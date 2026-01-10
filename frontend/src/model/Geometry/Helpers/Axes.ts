import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js"
import { Model } from "../../Model"
import * as THREE from "three"
import { Line2 } from "three/examples/jsm/lines/Line2.js"
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js"

class Axes {
  model: Model
  meshes : THREE.Group[] = []
  constructor(model: Model){
    this.model = model
  }
  
  startDrawMode = () => {
    this.model.camera.controls.enableRotate = false
    // this.model.drawTool.start('Axis')
    // const line = new Line(this.model)
    // line.setType(ToolsId.AXES);
    // line.start();
  }
  draw = (points : Float32Array) => {
    const group = new THREE.Group();
   
    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions(points);
    const line = new Line2(lineGeometry, new LineMaterial({ 
      color: 0x000000,
      linewidth: 0.002,
      // dashed: true,
      // dashSize: 0.2,
      // gapSize: 0.5
     }));
    // line.computeLineDistances();

    const circleShape = new THREE.Shape();
    circleShape.absarc(0, 0, 0.3, 0, Math.PI * 2, false);
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, 0.25, 0, Math.PI * 2, true);
    circleShape.holes.push(holePath);

    const extrudeSettings = {depth: 0.,bevelEnabled: false};

    const circleGeometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings);
    const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    
    const circle1 = new THREE.Mesh(circleGeometry, circleMaterial);
    const circle2 = new THREE.Mesh(circleGeometry, circleMaterial);
    
    // Position circles at line endpoints
    circle1.position.set(points[0], points[1], points[2]);
    circle2.position.set(points[3], points[4], points[5]);
    
    // Rotate circles to face up (lie in XZ plane)
    circle1.rotation.x = -Math.PI / 2;
    circle2.rotation.x = -Math.PI / 2;

    const createTextSprite = (text: string, position: THREE.Vector3) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      if (context) {
          context.strokeStyle = '#000000';
          context.font = '32px Arial';
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(text, 32, 32);
      }
      const texture = new THREE.CanvasTexture(canvas);
      const textMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(textMaterial);
      sprite.position.copy(position); // Place text exactly at the circle center
      sprite.scale.set(0.5, 0.5, 1); // Adjust size to match circle scale
      return sprite;
    };


  
  const textSprite1 = createTextSprite('A', circle1.position);
  const textSprite2 = createTextSprite('B', circle2.position);


    group.add(line, circle1, circle2, textSprite1, textSprite2);
  
    this.model.scene.add(group);
    this.meshes.push(group)
  }

  setMockAxes = () => {
    const mockPoints = [
      -5, 0, 4,   // Start point
      5, 0, 4,   // End point
      
      -5, 0, -4,   // Start point
      5, 0, -4,   // End point
    
      // Horizontal axis 2
      0, 0, -5,   // Start point
      0, 0,  5,   // End point

    ];

    for (let i = 0; i < mockPoints.length; i += 6) {
      const points = new Float32Array(mockPoints.slice(i, i + 6));
      this.draw(points);
    }
  }

  setLayer = (layer : number) => {
    this.meshes.forEach((mesh) => {
      mesh.traverse((child) => {
        if(child instanceof THREE.Mesh){
          child.layers.set(layer)
        }
      })
    })
  }
}



export default Axes