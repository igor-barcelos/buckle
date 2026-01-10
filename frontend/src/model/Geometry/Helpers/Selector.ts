import { Model } from '../../Model';
import * as THREE from 'three';
import { makeAutoObservable } from 'mobx';
import Node from '../../Elements/Node/Node';
import ElasticBeamColumn from '../../Elements/ElasticBeamColumn/ElasticBeamColumn';
import { Level } from '../../../types';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import Line from '../Tools/Line';

type Mesh = {
  object: THREE.Mesh
  originalColor: number
}
class Selector {
  enabled: boolean = true
  enableHover: boolean
  enableClick: boolean
  rayCaster: THREE.Raycaster
  model: Model;
  hovered: THREE.Mesh | null
  originalColor: number
  colorOnSelection: number
  colorOnHover: number
  isCtrlPressed: boolean
  selected: Mesh[]
  set setupEvent(enabled: boolean) {
    if (enabled) {
      this.onHover = this.onHover.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onKeyUp = this.onKeyUp.bind(this);
      window.addEventListener('pointermove', this.onHover);
      window.addEventListener('click', this.onClick);
      window.addEventListener('keydown', this.onKeyDown);
      window.addEventListener('keyup', this.onKeyUp);
    } else {
      window.removeEventListener("pointermove", this.onHover);
      window.removeEventListener("click", this.onClick);
      window.removeEventListener("keydown", this.onKeyDown);
      window.removeEventListener("keyup", this.onKeyUp);
    }
  }
  constructor(model: Model) {
    this.setupEvent = true;
    this.model = model;
    this.enableHover = true
    this.enableClick = true
    this.rayCaster = new THREE.Raycaster()
    this.hovered = null
    this.originalColor = 0xa0a0a0
    this.colorOnSelection = 0
    this.colorOnHover = 0xA020F0
    this.isCtrlPressed = false
    this.selected = []
    makeAutoObservable(this)
  }

  onHover() {
    if (this.enableHover) {
      const pointer = new THREE.Vector2(this.model.pointerCoords.x, this.model.pointerCoords.y)
      this.rayCaster.setFromCamera(pointer, this.model.camera.cam)
      if (this.model.camera.viewMode == '2d') {
        // console.log('2d view')
        this.rayCaster.layers.enable(this.model.layer)
      }
      else {
        this.rayCaster.layers.enableAll()
      }
      const meshesArray = [] as THREE.Mesh[]
      this.model.scene.children.forEach(element => this.getMeshes(element, meshesArray))
      // https://github.com/ThatOpen/engine_components/blob/main/packages/front/src/fragments/Highlighter/index.ts
      const intersects = this.rayCaster.intersectObjects(meshesArray, false)
      let materialOnHover = null
      if (intersects.length > 0) {

        if (intersects[0].object != this.hovered) {
          if (this.hovered) {
            // materialOnHover = this.hovered.material as THREE.MeshBasicMaterial | THREE.MeshLambertMaterial[]
            materialOnHover = this.hovered.material as THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[]

            // Get userData from mesh or parent group
            let userData = this.hovered.userData
            if (!userData?.originalColor && this.hovered.parent instanceof THREE.Group) {
              userData = this.hovered.parent.userData
            }
            const meshOriginalColor = userData.originalColor

            const isPreviousHoverSelected = this.isMeshSelected(this.hovered)
            if (!isPreviousHoverSelected) {
              if (Array.isArray(materialOnHover)) {
                materialOnHover[0].color.setHex(meshOriginalColor ? meshOriginalColor : this.originalColor);
              } else {
                materialOnHover.color.setHex(meshOriginalColor ? meshOriginalColor : this.originalColor);
              }
            }
          }
          this.hovered = intersects[0].object as THREE.Mesh;
          materialOnHover = this.hovered.material as THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[]

          if (Array.isArray(materialOnHover)) {
            materialOnHover[0].color.setHex(this.colorOnHover);
          } else {
            materialOnHover.color.setHex(this.colorOnHover);
          }
        }
      }
      else {
        if (this.hovered) {
          // console.log('SELECTION', this.hovered)
          const isSelected = this.isMeshSelected(this.hovered)
          // Get userData from mesh or parent group
          let userData = this.hovered.userData
          if (!userData?.originalColor && this.hovered.parent instanceof THREE.Group) {
            userData = this.hovered.parent.userData
          }
          const meshOriginalColor = userData.originalColor
          if (isSelected) return
          materialOnHover = this.hovered.material as THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[]
          if (Array.isArray(materialOnHover)) {
            materialOnHover[0].color.setHex(meshOriginalColor ? meshOriginalColor : this.originalColor);
          } else {
            materialOnHover.color.setHex(meshOriginalColor ? meshOriginalColor : this.originalColor);
          }
        }
        // (this.hovered.material as THREE.MeshBasicMaterial).color.setHex( this.originalColor );
        this.hovered = null;
      }
    }
  }
  onClick() {
    if (this.enableClick) {
      const pointer = new THREE.Vector2(this.model.pointerCoords.x, this.model.pointerCoords.y)
      this.rayCaster.setFromCamera(pointer, this.model.camera.cam)
      const meshesArray = [] as THREE.Mesh[]

      this.model.scene.children.forEach(element => this.getMeshes(element, meshesArray))
      const intersects = this.rayCaster.intersectObjects(meshesArray, false)

      if (intersects.length > 0) {
        const objectOnClick = intersects[0].object as THREE.Mesh
        const point = intersects[0].point
        if (objectOnClick.type != "GridHelper") {
          if (this.isCtrlPressed) {
            const isSelected = this.isMeshSelected(objectOnClick)
            if (isSelected) {
              this.removeFromSelection(objectOnClick)
            }
            else {
              const newSelection = {
                object: objectOnClick,
                originalColor: this.originalColor
              }
              this.selected = [...this.selected, newSelection]
            }
          }
          else {
            this.clear()
            this.selected = []
            this.selected.push(
              {
                object: objectOnClick,
                originalColor: this.originalColor
              }
            )
          }
        }
      }
    }
  }
  dipose() {
    window.removeEventListener('pointermove', this.onHover);
    window.removeEventListener('click', this.onClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp)
  }
  getMeshes(object: THREE.Object3D, meshesArray: THREE.Mesh[] = []): THREE.Mesh[] {

    if (object instanceof THREE.Mesh) {
      const camera = this.model.camera
      const viewMode = camera.viewMode
      const layer = camera.cam.layers
      const visible = object.visible
      const objectOnLayer = object.layers.test(layer)
      const lineTool = Line.getInstance()
      const meshInProgress = lineTool.mesh

      // Check userData on mesh first, then check parent group if mesh doesn't have it
      let userData = object.userData
      let type = userData?.type

      // If mesh doesn't have type, check parent group (for grouped elements like ElasticBeamColumn)
      if (!type && object.parent instanceof THREE.Group) {
        const parentUserData = object.parent.userData
        type = parentUserData?.type
        // Use parent's userData if mesh doesn't have the type
        if (type) {
          userData = parentUserData
        }
      }

      if (type === 'elasticBeamColumn' || type === '3dLine' || type === 'node') {
        switch (viewMode) {
          case '2d':
            if (objectOnLayer && visible && object.uuid !== meshInProgress?.uuid)
              meshesArray.push(object);
            break;
          default:
            if (visible && object.uuid !== meshInProgress?.uuid)
              meshesArray.push(object);
            break;
        }
      }

    } else if (object.children.length > 0) {
      object.children.forEach(child => this.getMeshes(child, meshesArray));
    }

    // console.log('MESH ARRAY', meshesArray)
    return meshesArray
  }
  onKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey) {
      this.isCtrlPressed = true
    }
  }
  onKeyUp(event: KeyboardEvent) {
    if (!event.ctrlKey) {
      this.isCtrlPressed = false
    }
    if (event.key === 'Escape') {
      this.clear()
    }
  }
  clear() {
    this.selected.forEach(m => {
      if (Array.isArray(m.object.material)) {
        const material = m.object.material as THREE.MeshLambertMaterial[]
        material[0].color.setHex(m.originalColor)
      } else {
        const material = m.object.material as THREE.MeshLambertMaterial
        material.color.setHex(m.originalColor)
      }
    })
    this.selected = []
  }
  isMeshSelected(mesh: THREE.Mesh) {
    return this.selected.some(m => m.object === mesh)
  }
  getSelected() {
    return this.selected
  }
  removeFromSelection(mesh: THREE.Mesh) {
    // console.log('CURRENT SELECTION', this.selected)
    const object = this.selected.find(m => m.object === mesh)
    this.selected = this.selected.filter(m => m.object !== mesh)
    const originalColor = object!.originalColor
    const material = mesh.material as THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[]
    if (Array.isArray(material)) {
      material[0].color.setHex(originalColor)
    } else {
      material.color.setHex(originalColor)
    }
  }
  divideSelection() {
    const members = this.model.members;
    const parts = 5
    for (let item of this.selected) {
      const object = item.object
      // Check userData on object, or on parent group if object is a mesh in a group
      let userData = object.userData
      if (!userData?.id && object instanceof THREE.Mesh && object.parent instanceof THREE.Group) {
        userData = object.parent.userData
      }
      const { id } = userData
      const member = members.find(el => el.id === id)
      const section = member!.section
      const memberNodes = member!.nodes;
      const nodei = memberNodes[0]
      const nodej = memberNodes[1]
      // console.log('NODEJ', nodej)
      const vector = new THREE.Vector3(
        nodej.x - nodei.x,
        nodej.y - nodei.y,
        nodej.z - nodei.z,
      )
      const direction = vector.clone().normalize()
      const length = vector.length()

      const nodes: Node[] = []
      nodes.push(nodei)
      // Remove the group if the object is a mesh in a group, otherwise remove the object itself
      if (object instanceof THREE.Mesh && object.parent instanceof THREE.Group && object.parent.userData?.type === 'elasticBeamColumn') {
        this.model.scene.remove(object.parent)
      } else {
        this.model.scene.remove(object)
      }
      for (let i = 0; i < parts; i++) {
        const ratio = (i + 1) / parts
        const point = new THREE.Vector3(
          nodei.x + direction.x * ratio * length,
          nodei.y + direction.y * ratio * length,
          nodei.z + direction.z * ratio * length
        )

        const node = new Node(point)

        nodes.push(node)
      }

      // console.log('NODES', nodes)
      for (let i = 0; i < nodes.length - 1; i++) {
        const iNode = nodes[i]
        const jNode = nodes[i + 1]
        const newBeam = new ElasticBeamColumn(this.model, '', [iNode, jNode], section)
        newBeam.create()
        this.model.members.push(newBeam)
      }
    }
  }
  copyToLevel(level: Level) {
    const meshes = this.selected.map(item => item.object)
    const layer = this.model.levels.map(l => l.value).indexOf(level.value)
    const y = level.value
    for (let mesh of meshes) {
      if (mesh instanceof Line2) {
        const line = Line.getInstance()
        const geometry = mesh.geometry
        const attributes = geometry.attributes
        const instanceEnd = attributes.instanceEnd?.array
        const v1 = [instanceEnd[0], instanceEnd[1], instanceEnd[2]]
        const v2 = [instanceEnd[3], instanceEnd[4], instanceEnd[5]]
        const positions = [...v1, ...v2]
        positions[1] = y
        positions[4] = y

        const startPoint = new Node(new THREE.Vector3(positions[0], positions[1], positions[2]))
        const endPoint = new Node(new THREE.Vector3(positions[3], positions[4], positions[5]))
        line.startPoint = startPoint
        line.endPoint = endPoint
        line.create(layer)
      }
    }
  }
  disable(){
    this.enableClick = false
    this.enableHover = false
  }
  enable(){
    this.enableClick = true
    this.enableHover = true
  }
}

export default Selector