import * as THREE from 'three';
import { getMouseLocation, findNodeAtPosition } from '../Helpers/utils';
import Selector from '../Helpers/Selector';
import Camera from '../../Camera/Camera';
import Model from '../../Model';
import Node from '../../Elements/Node/Node';
import ElasticBeamColumn from '../../Elements/ElasticBeamColumn/ElasticBeamColumn';
import { Tool } from './types';
import { Repeat } from '@mui/icons-material';

interface MeshData {
  mesh: THREE.Mesh;
  offset: THREE.Vector3;
  inverseMatrix : THREE.Matrix4;
  repeat: number;
}

class CopyTool implements Tool {
  private static instance: CopyTool | null = null;

  uuid: String = 'Copy'

  enabled = false
  model : Model
  plane: THREE.Plane
  intersection: THREE.Vector3
  copyStart: THREE.Vector3
  offset: THREE.Vector3
  selectedObject: THREE.Mesh | null
  inverseMatrix: THREE.Matrix4
  camera : Camera
  rayCaster: THREE.Raycaster
  selector : Selector
  state : number = 0
  meshesData : MeshData[] = []
  repeat : number = 1

  static getInstance(): CopyTool {
    if (CopyTool.instance === null) {
      CopyTool.instance = new CopyTool();
    }
    return CopyTool.instance;
  }

  private constructor() {
    this.model = Model.getInstance()
    this.camera = this.model.camera
    this.plane = new THREE.Plane()
    this.intersection = new THREE.Vector3()
    this.copyStart = new THREE.Vector3()
    this.offset = new THREE.Vector3()
    this.selectedObject = null
    this.inverseMatrix = new THREE.Matrix4()
    this.rayCaster = new THREE.Raycaster()
    this.selector = this.model.selector
  }
  start(){
    this.model.snapper.enable()
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('keydown', this.onKeyDown);
  }
  stop(){
    this.model.snapper.disable()
    this.model.selector.enable()
    this.model.selector.clear()
    this.state = 0
    // Clean up temporary cloned meshes
    this.meshesData.forEach(item => {
      this.model.scene.remove(item.mesh)
      item.mesh.geometry.dispose()
      if (Array.isArray(item.mesh.material)) {
        item.mesh.material.forEach(mat => mat.dispose())
      } else {
        item.mesh.material.dispose()
      }
    })
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("keydown", this.onKeyDown);
    // Clear all state
    this.meshesData = []
    this.selectedObject = null
    this.state = 0
    this.copyStart.set(0, 0, 0)
  }
  onMouseDown(event: MouseEvent) : void{
    if(this.state === 1) {
      this.paste()
      return
    }

    let mouse = getMouseLocation( event)

    if(this.model.snapper.snappedScreenCoords) mouse = this.model.snapper.snappedScreenCoords

    this.rayCaster.setFromCamera(mouse, this.camera.cam);
    const nodes = this.model.nodes.map((node) => node.mesh)
    const members = this.model.members.map(member => member.mesh)
    const grid = this.model.gridHelper.grid
    const meshesArray = [...nodes, ...members, grid]
    const intersects: THREE.Intersection[] = this.rayCaster.intersectObjects(meshesArray);
    if (intersects.length > 0) {
      this.selectedObject = intersects[0].object as THREE.Mesh;
      const worldPosition = new THREE.Vector3().setFromMatrixPosition(this.selectedObject.matrixWorld);
      this.plane.setFromNormalAndCoplanarPoint(
        this.camera.cam.getWorldDirection(this.plane.normal),
        worldPosition ,
      )

      if(this.rayCaster.ray.intersectPlane(this.plane, this.intersection) ){
        this.copyStart.copy(this.intersection)
        for (let repeat = 0; repeat < this.repeat; repeat++) {
          const meshes = this.model.selector.selected.map(item => {
            const userData = item.object.parent!.userData
            const matrixWorld = item.object.parent!.matrixWorld.clone()
            const mesh = item.object.clone()
            mesh.applyMatrix4(matrixWorld)
            mesh.userData = {...userData}

            let offset = new THREE.Vector3()
            let inverseMatrix = matrixWorld.clone().invert()
            let elPosition = new THREE.Vector3().setFromMatrixPosition(matrixWorld)
            offset.copy(elPosition).sub(this.copyStart)
            
            return {
              mesh, 
              offset, 
              inverseMatrix,
              repeat: repeat 
            }
          })
          
          this.meshesData.push(...meshes)
        }
        
        this.model.scene.add(...this.meshesData.map(item => item.mesh))
      }

      this.state++
    }
  }
  onMouseMove(event: MouseEvent): void {
    // if(this.state === 0) return
    let mouse = getMouseLocation(event)

    if(this.model.snapper.snappedScreenCoords) mouse = this.model.snapper.snappedScreenCoords

    if (this.selectedObject) {
      this.rayCaster.setFromCamera(mouse, this.camera.cam);

      if (this.rayCaster.ray.intersectPlane(this.plane, this.intersection)) {
        
        this.meshesData.forEach(item=> {
          const copy = item.mesh as THREE.Mesh
          const displacement = this.intersection.clone().sub(this.copyStart).multiplyScalar(item.repeat)
          item.mesh.position.copy(this.intersection.clone().add(item.offset).add(displacement));
        });
      }
    }
  }
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.stop()
    }
  }
  paste() {
    for (const item of this.meshesData) {
      const copy = item.mesh as THREE.Mesh
      const userData = copy.userData
      let copyPosition
      
      if (userData.type === 'node') {
        copyPosition = copy.position.clone()
        // Check if node already exists at this position
        let targetNode = findNodeAtPosition(this.model.nodes, copyPosition, 0.01)
        if (!targetNode) {
          // Create new node
          targetNode = new Node(copyPosition)
          targetNode.model = this.model
          targetNode.create()
          this.model.nodes.push(targetNode)
        }
      
      } else if (userData.type === 'elasticBeamColumn') {
        // Handle member pasteing
        const originalMember = this.model.members.find(m => m.id === userData.id)
        if(!originalMember) continue
        const matrixWorld = originalMember.mesh.parent!.matrixWorld.clone()
        const initialPosition = new THREE.Vector3().setFromMatrixPosition(matrixWorld)
        copyPosition = copy.position.clone() 
        const dVector = copyPosition.clone().sub(initialPosition) 
        
        if (originalMember) {
          const nodei = originalMember.nodes[0]
          const nodej = originalMember.nodes[1]
          // Calculate new positions for both endpoints
          const newPosI = new THREE.Vector3(nodei.x, nodei.y, nodei.z).add(
            dVector
          )
          const newPosJ = new THREE.Vector3(nodej.x, nodej.y, nodej.z).add(
            dVector
          )

          // Find or create node at position I
          let newNodeI = findNodeAtPosition(
            this.model.nodes,
            newPosI,
            0.01
          )
          if (!newNodeI) {
            newNodeI = new Node(newPosI)
            newNodeI.model = this.model
            newNodeI.create()
            this.model.nodes.push(newNodeI)
          }

          // Find or create node at position J
          let newNodeJ = findNodeAtPosition(
            this.model.nodes,
            newPosJ,
            0.01
          )
          if (!newNodeJ) {
            newNodeJ = new Node(newPosJ)
            newNodeJ.model = this.model
            newNodeJ.create()
            this.model.nodes.push(newNodeJ)
          }

          // Create new member with found/created nodes
          const newMember = new ElasticBeamColumn(
            this.model,
            originalMember.label,
            [newNodeI, newNodeJ],
            originalMember.section,
            undefined // let it generate new ID
          )
          newMember.create()
          this.model.members.push(newMember)
        }
      }
    }

    // Clean up temporary cloned meshes
    this.meshesData.forEach(item => {
      this.model.scene.remove(item.mesh)
      item.mesh.geometry.dispose()
      if (Array.isArray(item.mesh.material)) {
        item.mesh.material.forEach(mat => mat.dispose())
      } else {
        item.mesh.material.dispose()
      }
    })

    // Clear the array
    this.meshesData = []
    this.copyStart.set(0, 0, 0)

    // Stop the paste tool
    this.stop()
  }
  dispose(){
    this.stop()
  }
  setRepeat(repeat : number):void {
    this.repeat = repeat
  }
}

export default CopyTool