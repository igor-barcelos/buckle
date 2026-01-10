import * as THREE from 'three'

class Light {
  scene : THREE.Scene
  enabled : boolean
  // directionalLight : THREE.DirectionalLight
  ambientLight : THREE.AmbientLight
  set setupEvent(enabled : boolean) {
    if (enabled) {
      // this.directionalLight.position.set(5, 50, 7.5);
      // this.scene.add(this.directionalLight)
      this.scene.add(this.ambientLight)
    }
  }
  constructor(scene : THREE.Scene) {
    // this.directionalLight = new THREE.DirectionalLight(0xffffff, 10)
    // this.directionalLight.castShadow = true;
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.1)

    
    this.scene = scene
    this.enabled = true
    this.setupEvent = true
  } 
}

export default Light
