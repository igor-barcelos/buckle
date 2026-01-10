import { ViewportGizmo } from "three-viewport-gizmo";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export default  class Guizmo {
  gizmo : ViewportGizmo

  constructor(camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, controls : OrbitControls) {
    this.gizmo = new ViewportGizmo(camera, renderer);
    this.gizmo.attachControls(controls);    
  }
}