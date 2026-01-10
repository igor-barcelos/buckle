import { Model } from '../../Model';
import * as THREE from 'three';
import { Tool } from './types';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import ElasticBeamColumn from '../../Elements/ElasticBeamColumn/ElasticBeamColumn'
import Node from '../../Elements/Node/Node';
import { ElementType, Line3D, mockSections, Section } from '../../../types';
import { Vector3 } from 'three';
import { makeAutoObservable } from 'mobx';
import { findNodeAtPosition } from '../Helpers/utils';
type Label = {
  id : string
  position : Vector3
  text : string
  type? : 'effort' | 'load' | 'length' | 'angle' | 'arc' | 'prompt'
  rotation? : number
}

export default class Line implements Tool {
  private static instance: Line | null = null;

  enabled = true
  state : number = 0;
  inputMode: "point" | "lengthAndAngle" = 'point'
  inputState: 'length' | 'angle' = 'length';
  uuid : String = 'Line3D'
  mesh : Line2 | THREE.Mesh | null = null;
  model : Model = Model.getInstance()
  currentPointerCoord : THREE.Vector3;
  onOrthoMode : boolean;
  type : ElementType = '3dLine';
  startPoint: Node = new Node( new THREE.Vector3(0,0,0,) );
  endPoint: Node = new Node( new THREE.Vector3(0,0,0,) );
  angle  = '' ;
  length = ''
  positions: Array<number> = []
  section : Section
  colLength : number = 4

  static getInstance(): Line {
    if (Line.instance === null) {
      Line.instance = new Line();
    }
    return Line.instance;
  }

  set setupEvent(enabled: boolean) {
    this.model.canvas.addEventListener('mousemove', this.onMouseMove);
    this.model.canvas.addEventListener('click', this.onDrawClick);
    this.model.canvas.addEventListener('contextmenu', this.onRightClick);
    window.addEventListener('keydown', this.onKey);
  }

  private constructor()
  {
    this.currentPointerCoord = new THREE.Vector3();
    this.onOrthoMode = false;
    this.setupEvent = true
    this.section = this.model.sections[0]
    makeAutoObservable(this)
  }

  private onMouseMove = (e: MouseEvent) => {
    const mouseLoc = this.getMouseLocation(e,this.model.canvas, this.model.worldPlane, this.model.camera.cam);
    this.currentPointerCoord = mouseLoc;
    if (this.state === 1) {
      this.currentPointerCoord = mouseLoc;
    }

    if (this.state === 2 ||  this.state === 3) {

      this.update(this.endPoint, new Node(this.currentPointerCoord))
    }
  }

  private onDrawClick = () => {
    if(this.state === 0) return
    const snappedCoords =  this.model.snapper.snappedCoords
    const snappedNode = this.model.snapper.snappedNode

    const nodeId = snappedNode?.id
    if (this.state === 1) {
      if(snappedCoords){
        this.startPoint = new Node(snappedCoords)

        if(snappedNode) this.startPoint.id = snappedNode.id
      }
      else{
        this.startPoint =  new Node(this.currentPointerCoord)
      } 

      if(this.type === 'colDown' || this.type === 'colUp'){
        this.create()
        return
      }

      this.endPoint = new Node(
        new THREE.Vector3(this.startPoint.x , this.startPoint.y , this.startPoint.z) 
      )

      if(snappedNode) this.endPoint.id = snappedNode.id

      this.state = 2 
    }
    else if (this.state === 2) {
      
      if(snappedNode){
        this.endPoint = new Node(new THREE.Vector3(snappedNode.x, snappedNode.y, snappedNode.z))
        this.endPoint.id = snappedNode.id
      }else{
        const point = new THREE.Vector3(this.positions[3], this.positions[4], this.positions[5])
        this.endPoint = new Node(point)
      }

      this.create()
      this.state = 3
    }
    else if(this.state === 3)
    {
      this.startPoint = this.endPoint
      if(snappedNode){
        this.endPoint = new Node(new THREE.Vector3(snappedNode.x, snappedNode.y, snappedNode.z))
        this.endPoint.id = snappedNode.id
      }else{
        this.endPoint = new Node(new THREE.Vector3(this.positions[3], this.positions[4], this.positions[5]))
      }
      this.create()
    }
  };
  
  private onKey = (event: KeyboardEvent) => { 
    if (event.key === 'Escape') {
      event.preventDefault();
      this.stop()
      this.delete()
      // this.dispose()
    } 
  };

  private onRightClick = (e: MouseEvent) => {
    if(this.state === 0) return
    e.preventDefault(); 
    this.delete()
    this.state = 1;
  };

  start = () => {
    if(this.state === 0) {
      this.state = 1
      // this.type = type
      this.model.canvas.style.cursor = 'crosshair'
      this.model.snapper.enable()
      this.model.console.create({
        id: '',
        message: 'Select the first point',
        type: 'INFO',
        timestamp: new Date()
      })

      return
    }
    const positions = [
      this.startPoint.x, 
      this.startPoint.y, 
      this.startPoint.z, 
      this.endPoint.x, 
      this.endPoint.y, 
      this.endPoint.z
    ]
    
    let geometry : LineGeometry | THREE.BoxGeometry
    let material : LineMaterial | THREE.MeshBasicMaterial
    geometry = new LineGeometry();
    geometry.setPositions(positions);
    material = new LineMaterial({
      color: 0x0000ff,
      linewidth: 5, // in pixels
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });
    this.mesh = new Line2(geometry, material);
    this.mesh.userData.type = this.type;
    this.model.scene.add(this.mesh);
  };
  
  create(layer : number = this.model.layer)
  {

    
    const vecz = new THREE.Vector3(0, 0, 1)
   
    const type = this.type
    const nodeIds = this.model.nodes.map((node) => node.id)
    switch(type) 
    {
      case 'elasticBeamColumn':
        if(this.state === 2) {
          const nodei = this.startPoint
          const nodej = this.endPoint
          const nodes : Node[] = [nodei, nodej]
          
          if(!nodeIds.includes(nodei.id)) {
            this.model.nodes.push(nodei)
            nodei.model = this.model
            nodei.create()
          }
          if(!nodeIds.includes(nodej.id)) {
            this.model.nodes.push(nodej)
            nodej.model = this.model
            nodej.create()
          }
          const member = new ElasticBeamColumn(this.model, '', nodes, this.section)
          member.create()
          this.model.members = [
            ...this.model.members,
            member
          ]

        }
        else if(this.state === 3) {
          const nodei = this.startPoint
          const nodej =  this.endPoint
          const nodes = [nodei, nodej]
          const elasticBeamColumn = new ElasticBeamColumn(this.model,  '', nodes, this.section)
          elasticBeamColumn.create()
          this.model.members.push(elasticBeamColumn)

          if(!nodeIds.includes(nodej.id)) {
            console.log('CREATING NODE')
            this.model.nodes.push(nodej)
            nodej.model = this.model
            nodej.create()
          }
        }
        break;
      case 'colUp':
      case 'colDown':
        const nodei = this.startPoint
        const colLength = this.type === 'colDown' ? -this.colLength : this.colLength 
        const position = new THREE.Vector3(this.startPoint.x , this.startPoint.y + colLength , this.startPoint.z) 
        let nodej: Node | null
        nodej = findNodeAtPosition(this.model.nodes, position , 0.01)
        if(!nodej){
          nodej = new Node(
            new THREE.Vector3(this.startPoint.x , this.startPoint.y + colLength , this.startPoint.z) 
          )
        }

        if(!nodeIds.includes(nodei.id)) {
          this.model.nodes.push(nodei)
          nodei.model = this.model
          nodei.create()
        }
        if(!nodeIds.includes(nodej.id)) {
          this.model.nodes.push(nodej)
          nodej.model = this.model
          nodej.create()
        }

        const nodes = [nodei, nodej]
        const column = new ElasticBeamColumn(this.model,  '', nodes, this.section)
        column.create()
        this.model.members = [
          ...this.model.members,
          column
        ]
        break
      default:
        // mesh.layers.set(layer)
        break;
    }   
  }

  update(startPoint: Node, endPoint: Node)
  {
    if (!this.mesh) this.start()
    const type = this.type
    let positions = [startPoint.x, startPoint.y, startPoint.z, endPoint.x, endPoint.y, endPoint.z]
    
    if (this.onOrthoMode && this.state >= 2) {
      const orthoEndPoint = this.getOrthogonalProjection(startPoint, endPoint)
      positions[3] = orthoEndPoint.x
      positions[4] = orthoEndPoint.y
      positions[5] = orthoEndPoint.z
      endPoint = new Node(orthoEndPoint)
    }
  
    if((this.model.snapper.onGrid || this.model.snapper.onNode) && this.model.snapper.snappedCoords)
    {
      const snappedCoords = this.model.snapper.snappedCoords
      positions[3] = snappedCoords.x
      positions[4] = snappedCoords.y
      positions[5] = snappedCoords.z
    }

    this.positions = positions
    if(this.mesh instanceof Line2) {
      this.mesh.geometry.setPositions(positions)
      this.mesh.computeLineDistances();
      this.mesh.layers.set(this.model.layer)
      this.mesh.material.resolution.set(window.innerWidth, window.innerHeight);
    }
    
    const start = new THREE.Vector3(this.positions[0], this.positions[1], this.positions[2])
    const end = new THREE.Vector3(this.positions[3], this.positions[4], this.positions[5])
    const midPoint = this.getMidPoint(start, end)
    const length = start.distanceTo(end)
    
    // Calculate label angle using atan2 for proper quadrant handling
    const dx = end.x - start.x
    const dz = end.z - start.z
    let labelAngle = Math.atan2(dz, dx) * 180 / Math.PI
    
    if (labelAngle > 90) {
      labelAngle -= 180;
    } else if (labelAngle < -90) {
      labelAngle += 180;
    }

    const labels : Label[] = [
      {
        id: 'Line3D',
        text: `${length.toFixed(2)}`,
        position: midPoint,
        rotation: labelAngle,
        type:'length'
      }, 
    ]
    this.model.labeler.batchUpdateOrCreate(labels)
  }

  delete()
  {
    if(!this.mesh) return 
    this.model.scene.remove(this.mesh!)
    this.mesh.geometry.dispose();
    this.model.labeler.batchDelete(['Line3D'])
    this.mesh = null
  }

  getMouseLocation (
    event : MouseEvent,  
    canvas : HTMLCanvasElement, 
    plane: THREE.Plane, 
    camera: THREE.PerspectiveCamera | THREE.OrthographicCamera) {
      
      const rect = canvas.getBoundingClientRect();
      const _vec2 = new THREE.Vector2();
      const _vec3 = new THREE.Vector3();
      const raycaster = new THREE.Raycaster();
      _vec2.x = (( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1);
      _vec2.y =  -( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
      raycaster.setFromCamera(_vec2, camera);
  
      raycaster.ray.intersectPlane(plane, _vec3);
      return _vec3
  }

  enableOrthoMode = () => {
    this.onOrthoMode = true;
  }

  disableOrthoMode = () => {
    this.onOrthoMode = false;
  }

  toogleOrthomode = () => {
    this.onOrthoMode = !this.onOrthoMode
  }
  
  dispose = () => {
    this.model.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.model.canvas.removeEventListener('click', this.onDrawClick);
    this.model.canvas.removeEventListener('contextmenu', this.onRightClick);
    window.removeEventListener('keydown', this.onKey);
  }

  setSection(id : number){
    const section = this.model.sections.find((section) => section?.id === id)
    if(!section) return

    this.section = section
  }
  stop() {
    this.state = 0
    this.model.canvas.style.cursor = 'default'
    this.model.snapper.disable()
  }
  // HELPER FUNCTIONS
  // https://github.com/Immugio/three-math-extensions

  getMidPoint = (startPoint: THREE.Vector3, endPoint: THREE.Vector3) => {
    const midPoint = new THREE.Vector3()
    midPoint.x = (startPoint.x + endPoint.x) / 2
    midPoint.y = (startPoint.y + endPoint.y) / 2
    midPoint.z = (startPoint.z + endPoint.z) / 2
    return midPoint
  }

  getOrthogonalProjection = (startPoint: Node, endPoint: Node): THREE.Vector3 => {
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    const dz = endPoint.z - startPoint.z
    const line = new THREE.Vector3(dx, startPoint.y, dz)
    let vecx = new THREE.Vector3(1, 0, 0)
    let angle_rad_vecx_line : number
    let angle_deg_vecx_line : number
    if((dx < 0 && dz > 0) || (dx < 0 && dz < 0) )  vecx = new THREE.Vector3(-1, 0, 0)
    
    angle_rad_vecx_line = Math.acos(line.dot(vecx) / line.length())
    angle_deg_vecx_line = 180 * angle_rad_vecx_line / Math.PI

    if(angle_deg_vecx_line <= 45) return new THREE.Vector3(endPoint.x, startPoint.y, startPoint.z)
    else return new THREE.Vector3(startPoint.x, startPoint.y, endPoint.z)

  }

  getAxisAngle = (axis: THREE.Vector3) => {
    const position = this.mesh!.geometry.attributes.position.array
    const startPoint = new THREE.Vector3(position[0], position[1], position[2])
    const endPoint = new THREE.Vector3(position[3], position[4], position[5])

    // console.log('startPoint', startPoint)
    // console.log('endPoint', endPoint)
    const vectorLine = new THREE.Vector3
    (
      endPoint.x - startPoint.x, 
      endPoint.y - startPoint.y, 
      endPoint.z - startPoint.z
    )
    const direction = vectorLine.clone().normalize()

    const dotProduct = axis.dot(direction)
    const lineLength = vectorLine.length()
    const cosAngle = dotProduct / direction.length()
    const angleRad = Math.acos(cosAngle)
    const angleDeg = angleRad * 180 / Math.PI

    return angleDeg
  }

  setType = (type: ElementType): void => {
    this.type = type
  }
  setColLength = (length: number) => {
    this.colLength = length
  }
}
