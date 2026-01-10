import * as THREE from 'three';
import { Model } from '../../Model';
import { Node } from '../../../types';

import { Vector3 } from 'three';
import { ElementType } from '../../../types';
import { makeAutoObservable } from "mobx";

type Label = {
  id : string
  position : Vector3
  text : string
  type : 'effort' | 'load' | 'length' | 'angle' | 'arc' | 'gridSnap' | 'endPointSnap'
  rotation? : number
}

class Snapper {
  snap : THREE.Mesh | THREE.Group | null
  enabled : boolean
  onGrid : boolean
  onNode : boolean = true
  snappedCoords : THREE.Vector3 | null
  snappedScreenCoords : THREE.Vector2 | null 
  snappedNode : Node | undefined
  model : Model  
  threshold : number = 0.1
  set setupEvent(enabled: boolean) {
    if (enabled) {
      this.update()
    }
  }
  constructor(model : Model) {
    this.model = model
    this.onGrid = true
    this.snap = null
    this.snappedCoords = null
    this.snappedScreenCoords = null
    this.snappedNode = undefined
    this.enabled = false
    this.setupEvent = true
    makeAutoObservable(this)
  }

  snapToGrid = (pointerCoords: THREE.Vector3, gridSize : number ): THREE.Vector3 => {
    
    const newCoords = new THREE.Vector3().copy(pointerCoords);
    const screenCoords = new THREE.Vector2(pointerCoords.x, pointerCoords.y)
    const worldPosition = this.screenToWorld(screenCoords, this.model.camera.cam)

    //declaration of function which calculates new values and returns them
    const getCoordByOriginAndGridSize = (coord: number, gridSize: number): number => {
      // Calculate how many grid units we are from origin
      const gridUnits = coord / gridSize;
      // Round to nearest integer grid unit
      const roundedGridUnits = Math.round(gridUnits);
      // Convert back to coordinate space with high precision
      return roundedGridUnits * gridSize;
    };

    
    newCoords.x = getCoordByOriginAndGridSize(worldPosition.x, gridSize);
    newCoords.y = getCoordByOriginAndGridSize(worldPosition.y, gridSize)
    newCoords.z = getCoordByOriginAndGridSize(worldPosition.z, gridSize);

    const distanceToCurrent = pointerCoords.distanceTo(newCoords);

    return newCoords;
  }

  update()
  { 
    this.model.labeler?.deleteOne('gridSnap')
    this.model.labeler?.deleteOne('endPointSnap')
    // if(this.model?.lineTool?.state === 0) return 

    const gridSize = this.model.gridHelper.size
    const gridDivisions = this.model.gridHelper.divisions
    const gridStep = gridSize / gridDivisions
    const snappedGrid = this.snapToGrid(this.model.pointerCoords, gridStep)
    const {snappedEndPoint, elementId } = this.getClosestEndPoint() || { snappedEndPoint: null, elementId: null }
    

    this.snappedNode = undefined

    if(this.onNode && snappedEndPoint && elementId){
      const node = this.model?.nodes?.find((node) => node.id === elementId)
      if(node){
        this.model?.labeler?.batchUpdateOrCreate([{
          id : 'endPointSnap',
          position : snappedEndPoint,
          text : '',
          type : 'endPointSnap'
        }])
        this.snappedCoords = snappedEndPoint
        this.snappedNode = node
        const projected = this.snappedCoords.clone().project(this.model.camera.cam)
        this.snappedScreenCoords = new THREE.Vector2(projected.x, projected.y)
      }
    }
    else if(this.onGrid && snappedGrid){
      this.model?.labeler?.batchUpdateOrCreate([{
        id : 'gridSnap',
        position : snappedGrid,
        text : '',
        type : 'gridSnap'
      }])
      this.snappedCoords = snappedGrid
      const projected = this.snappedCoords.clone().project(this.model.camera.cam)
      this.snappedScreenCoords = new THREE.Vector2(projected.x, projected.y)
    }
    else {
      this.snappedCoords = null
      this.snappedScreenCoords = null
      this.model.labeler?.deleteOne('endPointSnap')
    }
  }

  screenToWorld(screenCoords : THREE.Vector2, camera : THREE.PerspectiveCamera | THREE.OrthographicCamera) {
    const worldPosition = new THREE.Vector3()
    // const plane = new THREE.Plane(new THREE.Vector3(0.0, 1.0, 0.0), )
    const plane = this.model.worldPlane
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(screenCoords, camera)
    raycaster.ray.intersectPlane(plane, worldPosition)
    return worldPosition

  }
  getClosestEndPoint() {
    if(!this.onNode) return

    const mesh = this.model.selector?.hovered 
    // const lineTool = Line.getInstance()
    if(!mesh) return
    // if(mesh.uuid === lineTool?.mesh?.uuid) return
    
    // Check userData on mesh first, then check parent group if mesh doesn't have it
    let userData = mesh.userData
    if (!userData?.type && mesh.parent instanceof THREE.Group) {
      userData = mesh.parent.userData
    }
    const id = userData?.id
    const type = userData?.type as ElementType
    
    // console.log('GetClosestEndPoint', type)
    // console.log('MESH', mesh)
    const geometry = mesh.geometry
    const attributes = geometry.attributes
    const instanceEnd = attributes.instanceEnd?.array
    const positions = attributes.position; 

    let v1: number[] = [];
    let v2: number[] = [];
    let v3: number[] = [];
    let vertices: number[][] = [];
    switch(type){
      case '3dLine':
        v1 = [instanceEnd[0], instanceEnd[1], instanceEnd[2]]   
        v2 = [instanceEnd[3], instanceEnd[4], instanceEnd[5]]
        vertices = [v1 , v2]  
        // console.log('VERTICES', vertices) 
       break;
      case 'elasticBeamColumn':
        // const id = userData?.id
        // console.log('BEAM ID', id)
        const beam = this.model.members.find(el => el.id === id)
        // console.log('SNAPPED BEAM', beam)
        const nodes = beam?.nodes
        if(!nodes) return 
        
        const nodei = nodes[0]
        const nodej = nodes[1]
        v1 = [nodei.x , nodei.y , nodei.z]
        v2 = [nodej.x , nodej.y , nodej.z]
        vertices = [v1 , v2]
        break;
      case 'node' :
        const node = this.model.nodes.find((el) => el.id === id)
        
        if(!node) return

        v1 = [node.x , node.y , node.z] 
        vertices = [v1]
        break;
    }

    const pointer = new THREE.Vector2(this.model.pointerCoords.x, this.model.pointerCoords.y);
        
    let closestVertex = null
    let closestDistance = Infinity
    
    for(const vertex of vertices){
      const v = new THREE.Vector3(vertex[0], vertex[1], vertex[2])
      const vertexProjected = v.clone().project(this.model.camera.cam)
      const vertexOnScreen = new THREE.Vector2(vertexProjected.x, vertexProjected.y)
      const distance = vertexOnScreen.distanceTo(pointer)
      if(distance < closestDistance){
        closestDistance = distance
        closestVertex = v
      }
    }
    if(closestDistance < this.threshold){
      return { snappedEndPoint : closestVertex, elementId : id };
    } 
  }

  disable() {
    this.model.labeler?.deleteOne('gridSnap')
    this.model.labeler?.deleteOne('endPointSnap')
    this.enabled = false
  }

  enable() {
    this.enabled = true
    this.onGrid = true
    this.onNode = true
  }

  toggleOnNode(){
    this.onNode = !this.onNode
  }
  
  toggleOnGrid(){
    this.onGrid = !this.onGrid
  }  
}

export default Snapper;
