import * as THREE from "three";
import { ViewportGizmo } from "three-viewport-gizmo";
import { 
  Node, 
  Camera, 
  Selector, 
  Labeler , 
  GridHelper, 
  Light, 
  PostProcessing,
  Snapper,
  Line,
  ElasticBeamColumn,
  Console,
  Visibility,
  WebSocketHandler
} from "./index";
import { makeAutoObservable } from "mobx";
import { Material, mockMaterials, mockSections, Section } from "../types";
import { GUI } from "lil-gui";
import { Line3D, Member, Level, mockLevels } from "../types";
import BoundaryCondition from "./BoundaryCondition/BoundaryCondition";
import Load from "./Load/Load";
import { buildModelOnjson } from "../helpers";
import ToolsController from "./Geometry/Tools/Controller";
export type PointerCoords = {
  x: number;
  y: number;
  z: number;
};



export class Model {
  private static instance: Model | null = null;

  enabled = true
  showVolumes = true
  public scene = new THREE.Scene()
  public camera : Camera
  public renderer =  new THREE.WebGLRenderer();
  public container !: HTMLDivElement
  pointerCoords: THREE.Vector3;
  worldPlane : THREE.Plane;
  snapper : Snapper
  selector : Selector
  gizmo : ViewportGizmo
  canvas : HTMLCanvasElement
  // axes : Axes
  nodes : Node[]
  members : Member[]
  boundaryConditions : BoundaryCondition[] = []
  // lines : Line3D[]
  gridHelper : GridHelper
  layer : number
  light : Light
  levels : Level[]
  postProcessing : PostProcessing
  labeler : Labeler
  loads : Load[] = []
  output : any
  sections : Section[] = mockSections
  materials : Material[] = mockMaterials
  gui : GUI | null = null
  toolsController : ToolsController = new ToolsController()
  console : Console = new Console()
  visibility : Visibility
  ws : WebSocketHandler = new WebSocketHandler('ws://localhost:8000/ws/1', this)

  static getInstance(): Model {
    if (Model.instance === null) {
      Model.instance = new Model();
    }
    return Model.instance;
  }

  set setupEvent(enabled: boolean) {
    if (enabled) {
      this.onResize = this.onResize.bind(this);

      this.updatePointerCoords = this.updatePointerCoords.bind(this);

      window.addEventListener("resize", this.onResize);
      window.addEventListener('pointermove', this.updatePointerCoords);
    } else {
      window.removeEventListener("resize", this.onResize);
    }
  }

  private constructor() {
    this.camera = new Camera(this)
    this.gridHelper = new GridHelper(this.scene)
    this.light = new Light(this.scene)
    this.pointerCoords =  new THREE.Vector3(0,0,0,)
    this.worldPlane =  new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    
    this.snapper = new Snapper(this)
 
    this.update()
    this.init()
    this.setupEvent = true;
    
    this.selector = new Selector(this); 
    
    // this.axes = new Axes(this)  
    this.canvas = document.querySelector('canvas') as HTMLCanvasElement
    this.levels = mockLevels
    this.postProcessing = new PostProcessing(this)
    this.labeler = new Labeler(this)
    // this.sections = new Sections(this)
    this.gizmo = new ViewportGizmo(
      this.camera.cam, 
      this.renderer, 
      { 
        // Position options: "top-left" | "top-right" | "bottom-left" | "bottom-right"
        placement: "bottom-left", 
        size: 100, // Size of the gizmo in pixels
        offset :{
          left:300,
          bottom:50,
        },
        y: {
          label: 'Z',
        },
        z: {
          label: 'Y',
        }
      }
    )
    this.gizmo.attachControls(this.camera.controls);
    this.nodes = []
    this.members = []
    this.layer = 0
    this.visibility = new Visibility(this)
    // buildModelOnjson(this, '/examples/ipe330-cantilever-beam.json')
    // buildModelOnjson(this, '/examples/concrete-frame-nodal-load.json')
    makeAutoObservable(this)
    
  }

  async init()
  {
    try {
      this.container = document.getElementById('app-container') as HTMLDivElement
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.container?.appendChild( this.renderer.domElement )
      this.scene.background = new THREE.Color('white');
      if (this.ws.isConnected())  console.log('Connected!');
      
    } catch (error) {
      console.log('init error', error)
    }
  }

  private onResize = () => 

  {
    this.camera.handleResize()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.gizmo.update()
    this.labeler.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  private update = () => {
    this.camera.cam.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera.cam);
    this.camera.controls.update()
    this.camera.directionalLight.target.position.copy(this.camera.controls.target)
    this.camera.directionalLight.target.updateMatrixWorld()
    requestAnimationFrame(this.update);
    this.gizmo?.render()
    this.labeler?.renderer.render(this.scene, this.camera.cam)
  }

  public dispose = () => {
    function removeObjWithChildren(obj : any) {
      if (obj.children.length > 0) {
        for (var x = obj.children.length - 1; x >= 0; x--) {
          removeObjWithChildren(obj.children[x])
        }
      }
      if (obj.isMesh) {
        obj.geometry.dispose();
        if( Array.isArray(obj.material)){
          for(let i = 0; i < obj.material.length; i++){
            obj.material[i].dispose()
          }
        }else{
          obj.material.dispose();
        }
      }
      if (obj.parent) {
        obj.parent.remove(obj)
      }
    }
    this.scene.traverse(function(obj) {
      removeObjWithChildren(obj)
    });
    this.container.removeChild(this.renderer.domElement)
    this.selector.dipose()
    this.labeler.dispose()
    this.gizmo.dispose()
    this.removeListeners()
    this.toolsController.dispose()
    // Disconnect when done
    this.ws.disconnect();

    // Reset singleton instance
    Model.instance = null;
  }
  public removeListeners = () => { 
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('pointermove', this.updatePointerCoords)
  }

  public clear = () => {
    // Clear all existing model data
    console.log('Clearing existing this...')
    
    // Dispose of all loads
    this.loads.forEach(load => load.dispose())
    this.loads = []
    
    // Dispose of all boundary conditions
    this.boundaryConditions.forEach(bc => bc.delete())
    this.boundaryConditions = []
    
    // Dispose of all members
    console.log('MEMBERS TO DISPOSE', this.members.length)
    const members = [...this.members]
    members.forEach(member => {
      console.log('disposing', member)
      member.remove()
    })
    this.members = []
    
    // Dispose of all nodes
    // Create a copy of the array to avoid issues when dispose() modifies the original array
    const nodes = [...this.nodes]
    nodes.forEach(node => node.dispose())
    this.nodes = []
    
    // Clear post processing
    this.postProcessing.dispose()
    
    // Clear labeler
    this.labeler.deleteAll('load')
    this.labeler.deleteAll('effort')
    
    console.log('Model cleared successfully')
  }

  updatePointerCoords = (event : MouseEvent) =>
  {

    const mouseLoc =  this.getMouseLocation(event)
    this.pointerCoords = new THREE.Vector3(mouseLoc.x, mouseLoc.y, this.pointerCoords.z);
    if(this.snapper.enabled){
      this.snapper.update()
    }
  }

  getMouseLocation ( event : MouseEvent ) {
      
      const canvas = document.querySelector('canvas')
      const rect = canvas!.getBoundingClientRect();
      const _vec2 = new THREE.Vector2();
      _vec2.x = (( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1);
      _vec2.y =  -( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;

      return _vec2
  }

  handleLevelChange(level: Level) {
    if(this.camera.viewMode === '3d') {
      this.camera.handle2dView()
      this.gridHelper.show()
    }
    const elevation = level.value
    this.worldPlane.constant = -elevation
    this.gridHelper.grid.position.y = elevation -0.005
    this.layer = this.levels.findIndex(l => l.value === level.value)
    this.snapper.snap?.layers.set(this.layer)
    this.gridHelper.grid.layers.set(this.layer)
    // this.axes.setLayer(this.layer)
    this.camera.cam.layers.set(this.layer)
    // this.light.directionalLight.layers.set(this.layer)

  }
}


export default Model