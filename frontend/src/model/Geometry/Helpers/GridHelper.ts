import * as THREE from "three"
import { makeAutoObservable } from "mobx";
class GridHelper{
  enabled: boolean
  scene : THREE.Scene
  grid : THREE.GridHelper
  size : number
  divisions : number
  spacing : number 
  set setupEvent(enabled: boolean) {
    if (enabled) {
      this.scene.add( this.grid );
      this.grid.position.y = -0.005
    } else {
      this.scene.remove( this.grid );
    }
  }


  constructor(scene : THREE.Scene){
    this.enabled = true
    this.size = 50
    this.divisions = 50
    this.spacing = 1
    this.grid = new THREE.GridHelper( this.size, this.divisions, new THREE.Color(0x424242), new THREE.Color(0xD7D7D7) );
    this.scene = scene
    this.setupEvent = true;
    makeAutoObservable(this)
  }

  hide(){
    this.grid.visible = false
  }

  show(){
    this.grid.visible = true
  }

  toGround(){
    this.grid.position.y = -0.005
  }

  dispose(){
    this.scene.remove(this.grid)
    this.grid.dispose()
  }

  get(){
    return {size : this.size , divisions : this.divisions , spacing : this.spacing }
  }

  create(size : number, divisions : number){
    this.grid = new THREE.GridHelper(size, divisions, new THREE.Color(0x424242), new THREE.Color(0xD7D7D7))
    this.grid.position.y = -0.005
    this.scene.add(this.grid)
    this.size = size
    this.divisions = divisions 
    this.spacing = size / divisions
  }
  update(size : number, divisions : number){
    this.dispose()
    this.create(size, divisions)
  }
}



export default GridHelper ;