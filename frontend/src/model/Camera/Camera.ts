import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Model from '../Model';
import { ViewportGizmo } from 'three-viewport-gizmo';
export class Camera {
  cam: THREE.OrthographicCamera | THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  frustumSize: number;
  viewMode : '2d' | '3d'
  orthoCam: THREE.OrthographicCamera;
  perspectiveCam: THREE.PerspectiveCamera;  
  directionalLight : THREE.DirectionalLight;
  model: Model
  constructor(model: Model) {
    this.model = model
    this.renderer = model.renderer
    // this.cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.viewMode = '2d'
    this.frustumSize = 50
    const aspect = window.innerWidth / window.innerHeight;
    this.orthoCam = new THREE.OrthographicCamera( this.frustumSize * aspect / - 2, this.frustumSize * aspect / 2, this.frustumSize / 2, this.frustumSize / - 2, 0.1, 100 );
    this.perspectiveCam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.cam = this.orthoCam;
    this.cam.position.set(0, -10, 0);
    this.controls = new OrbitControls(this.cam, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enableRotate = false;

    // https://discourse.threejs.org/t/directionallight-parallel-to-the-camera-step-by-step/54225/5
    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    this.directionalLight = new THREE.DirectionalLight( 0xffffff, 20 );
    this.directionalLight.position.set(0, 1, 100);
    this.directionalLight.shadow.mapSize.set( 4096, 4096 );
    this.directionalLight.shadow.bias = -0.0005;
    this.directionalLight.shadow.camera.left =	-200;
    this.directionalLight.shadow.camera.right = 	200;
    this.directionalLight.shadow.camera.top = 	200;
    this.directionalLight.shadow.camera.bottom = -200;
    this.directionalLight.castShadow = true;
    this.directionalLight.castShadow = true;
    // this.cam.add(this.directionalLight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.model.scene.add(ambientLight);
    this.model.scene.add(this.cam)
    this.handle3dView()
  }


  handleResize() {
    const aspect = window.innerWidth / window.innerHeight;
    
    if(this.cam instanceof THREE.OrthographicCamera) {
      this.cam.left = - this.frustumSize * aspect / 2;
      this.cam.right = this.frustumSize * aspect / 2;
      this.cam.top = this.frustumSize / 2;
      this.cam.bottom = - this.frustumSize / 2;
    }
    else{
      this.cam.aspect = window.innerWidth / window.innerHeight
    }
    this.cam.updateProjectionMatrix();
  }

  handle3dView(){
    this.viewMode = '3d'
    this.cam.position.set(20, 30, 20);
    this.controls.enableDamping = true;
    this.controls.enableRotate = true;
    this.cam.layers.enableAll()
  }
  handle2dView(){
    this.viewMode = '2d'
    this.model.snapper.enable()
    this.controls.enableRotate = false;
    this.cam.position.set(0, 50, 0) 
    this.cam.lookAt(0, 0, 0);       
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }
}

export default Camera