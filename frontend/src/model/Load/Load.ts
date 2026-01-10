import * as THREE from "three";
import { Model } from "../Model";
import { Labeler, ElasticBeamColumn } from "../index";
class Load {
  model : Model
  targets : number[]
  value : THREE.Vector3
  type : 'nodal' | 'linear' | 'area'
  id : number
  name : string
  mesh : THREE.Object3D[] = []
  // direction : THREE.Vector3

  constructor(model : Model, load : Load) {
    this.model = model
    this.targets = load.targets
    this.value = new THREE.Vector3(load.value.x, load.value.y, load.value.z)
    this.type = 'nodal'
    this.id = load.id || Math.floor(Math.random() * 0x7FFFFFFF)
    this.name = load.name || `Load ${this.model.loads.length + 1}`
    this.type = load.type
    // this.direction = this.value.clone().normalize()
  }

  createOrUpdate(){
    const index = this.model.loads.findIndex(l => l.id === this.id)
    if(index !== -1){
      console.log('updating load', this)
      this.removeAllLabels()
      this.update(this)
    }else{
      console.log('creating load')
      this.create()
    }
  }
  update(load : Load){
    this.value = new THREE.Vector3(load.value.x, load.value.y, load.value.z)
    this.targets = load.targets
    this.type = load.type
    this.id = load.id
    this.name = load.name
    this.mesh = this.model.loads.find(l => l.id === this.id)?.mesh || []
    // this.direction = this.value.clone().normalize()
    this.model.loads = this.model.loads.map(l => l.id === this.id ? this : l)
    this.dispose()
    this.create()
    this.removeAllLabels()
    this.createLabels()
  }

  create() {
    switch(this.type){
      case 'linear':
        this.createLinearLoad()
        break
      case 'nodal':
        this.createNodalLoad()
    }

    this.removeAllLabels()
    this.createLabels()
  }
  createLinearLoad() {
    const members = this.model.members
    const nodes = this.model.nodes
    const elements = [...members, ...nodes]
    const labels = []

    const ARROW_LEN_MAX = 1.0  // Maximum arrow length
    const ARROW_LEN_MIN = 0.3  // Minimum arrow length

    const maxLoad = this.model.loads.reduce((max, load) => load.value.length() > max ? load.value.length() : max, 0)
    const minLoad = this.model.loads.reduce((min, load) => load.value.length() < min ? load.value.length() : min, maxLoad)
    let arrowLength: number
    const currentLoadMagnitude = this.value.length()
  
    if (maxLoad === minLoad) {
      arrowLength = (ARROW_LEN_MAX + ARROW_LEN_MIN) / 2
    } else {
      const normalizedLoad = (currentLoadMagnitude - minLoad) / (maxLoad - minLoad)
      arrowLength = ARROW_LEN_MIN + normalizedLoad * (ARROW_LEN_MAX - ARROW_LEN_MIN)
    }


    for(const target of this.targets){
      const element = elements.find(e => e.id == target) as ElasticBeamColumn 
      const nodes = element?.nodes
      
      if (!element || !nodes || nodes.length < 2) {
        console.warn(`Element with id ${target} not found or invalid`)
        continue
      }
      
      const nodei = nodes[0]
      const nodej = nodes[1]
    
      const elementDirection = new THREE.Vector3( 
        nodej.x - nodei.x, 
        nodej.y - nodei.y, 
        nodej.z - nodei.z 
      )
      const length = elementDirection.length()
      elementDirection.normalize()
      
      const center = new THREE.Vector3(
        (nodei.x + nodej.x) / 2,
        (nodei.y + nodej.y) / 2,
        (nodei.z + nodej.z) / 2
      )
    
      // Generate nodes along the beam
      const nodesArray = []
      const steps = 10
      const stepSize = length / (steps - 1)
    
      for(let i = 0; i < steps; i++){
        const node = new THREE.Vector3(
          nodei.x + (elementDirection.x * stepSize * i) , 
          nodei.y + (elementDirection.y * stepSize * i), 
          nodei.z + (elementDirection.z * stepSize * i)
        )
        nodesArray.push(node)
      }
      
      // NEED TO HANDLE DIFFERENTLY FOR LOAD ON X AND Y
      const direction = this.value.clone().normalize()
      const angle = this.value.angleTo(direction)
      const directionSign = Math.cos(angle)
      const loadDirection = direction.clone().multiplyScalar(directionSign)
      const up = new THREE.Vector3(0, 1, 0 )
      const up_cross_load = new THREE.Vector3().crossVectors(up, direction)

      const d_vector = loadDirection.clone().negate().multiplyScalar(arrowLength)

      // if(directionSign > 0 && up_cross_load.length() === 0) 
      //   d_vector = loadDirection.clone().multiplyScalar(arrowLength)
      // else
      //   d_vector = loadDirection.clone().negate().multiplyScalar(arrowLength)

       // Create arrows along the element
      for(const node of nodesArray){
        // Calculate arrow origin position
        let arrowOrigin = node.clone().add(d_vector)
        // if(directionSign < 0 && up_cross_load.length() === 0)  arrowOrigin = node.clone().add(d_vector)
        
        const hex = 0xFF0000
        const arrowHelper = new THREE.ArrowHelper(
          loadDirection,
          arrowOrigin, 
          arrowLength, 
          hex, 
          0.1, 
          0.1
        )
        arrowHelper.userData = {
          id: `load-${target}`,
          type: 'load'
        }
        arrowHelper.userData.originalColor = '0xFF0000'
        this.model.scene.add(arrowHelper)
        this.mesh.push(arrowHelper)
      }
      

      const nbr = nodesArray.length
      const iNode = nodesArray[0]
      const jNode = nodesArray[nbr - 1]
      const planeNodes = [
        iNode, 
        jNode,
        jNode.clone().add(d_vector),
        iNode.clone().add(d_vector),
      ]
      
      const rectGeometry = new THREE.BufferGeometry();
      
      const vertices = [];
      const indices = [];
      
      for (let i = 0; i < 4; i++) {
        const point = planeNodes[i];
        vertices.push(point.x, point.y, point.z);
      }
      
      // Triangle 1: points 0, 1, 2
      indices.push(0, 1, 2);
      // Triangle 2: points 0, 2, 3
      indices.push(0, 2, 3);
      
      // Set the vertices and indices
      rectGeometry.setIndex(indices);
      rectGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      
      // Compute normals for proper lighting
      rectGeometry.computeVertexNormals();
      const rectMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFF0000,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      const rectangle = new THREE.Mesh(rectGeometry, rectMaterial);
      
      
      //  hide the plane if load is parallel to the element
      const crossProduct = new THREE.Vector3().crossVectors(elementDirection, loadDirection)
      if (crossProduct.length() < 0.001) {
        rectangle.visible = false 
      }
      
      rectangle.userData = {
        id: `load-${target}`,
        type: 'load',
        originalColor : '0xFF0000'
      }
      
      this.model.scene.add(rectangle)
      this.mesh.push(rectangle)
      
    }
    const index = this.model.loads.findIndex(l => l.id === this.id)
    if(index === -1){
      this.model.loads.push(this)
    }
    // this.createLabels()
  }
  createNodalLoad() {
    const arrowLength = 1.0
    const direction = this.value.clone().normalize()
    for (const target of this.targets) {
      const node = this.model.nodes.find(n => n.id === target)
      if (!node)  continue
      
  
      const nodePosition = new THREE.Vector3(node.x, node.y, node.z)
      
      // Define axis directions and colors
      const axes = [
        { 
          direction: new THREE.Vector3(1, 0, 0),  // X-axis
          value: this.value.x,
          color: 0xFF0000,  // Red
          label: 'Fx'
        },
        { 
          direction: new THREE.Vector3(0, 1, 0),  // Y-axis
          value: this.value.y,
          color: 0x00FF00,  // Green
          label: 'Fy'
        },
        { 
          direction: new THREE.Vector3(0, 0, 1),  // Z-axis
          value: this.value.z,
          color: 0x0000FF,  // Blue
          label: 'Fz'
        }
      ]
      
     
      for (const axis of axes) {
        if (Math.abs(axis.value) > 0.001) { 
          
          let arrowOrigin: THREE.Vector3
          let arrowDirection: THREE.Vector3
          
          if (axis.label === 'Fy') {
            // SPECIAL CASE FOR Y-AXIS (vertical forces)
            if (axis.value > 0) {
              // POSITIVE Y: Upward force, arrow tail should be at the node
              arrowOrigin = nodePosition.clone()
              arrowDirection = axis.direction.clone() // Points upward (+Y)
            } else {
              // NEGATIVE Y: Downward force, arrow head should be at the node
              arrowOrigin = nodePosition.clone().add(axis.direction.clone().multiplyScalar(arrowLength))
              arrowDirection = axis.direction.clone().negate() // Points downward (-Y)
            }
          } else {
            // STANDARD CASE FOR X AND Z AXES
            if (axis.value > 0) {
              // POSITIVE DIRECTION: Arrow head should be at the node
              arrowOrigin = nodePosition.clone().sub(direction.clone().multiplyScalar(arrowLength))
              arrowDirection = direction.clone() // Points toward node
            } else {
              // NEGATIVE DIRECTION: Arrow tail should be at the node
              arrowOrigin = nodePosition.clone()
              arrowDirection = direction.clone()
            }
          }
          
          const arrowHelper = new THREE.ArrowHelper(
            direction,
            arrowOrigin,
            arrowLength,
            axis.color,
            0.15,
            0.1
          )
          

          this.model.scene.add(arrowHelper)
          this.mesh.push(arrowHelper)
          
        }
      }
    }
    const index = this.model.loads.findIndex(l => l.id === this.id)
    if(index === -1){
      this.model.loads.push(this)
    }
    // this.createLabels()
  }
  removeAllLabels(){
    let ids = this.model.members.map(member => `linear-load-${member.id}`)
    ids = [...ids, ...this.model.nodes.map(node => `nodal-load-${node.id}-x`)]
    ids = [...ids, ...this.model.nodes.map(node => `nodal-load-${node.id}-y`)]
    ids = [...ids, ...this.model.nodes.map(node => `nodal-load-${node.id}-z`)]
    this.model.labeler.batchDelete(ids)
  }
  removeLoadLabels(){
    let ids = this.targets.map(target => `linear-load-${target}`)
    ids = [...ids, ...this.targets.map(target => `nodal-load-${target}-x`)]
    ids = [...ids, ...this.targets.map(target => `nodal-load-${target}-y`)]
    ids = [...ids, ...this.targets.map(target => `nodal-load-${target}-z`)]
    console.log('REMOVING LABELS', ids)
    this.model.labeler.batchDelete(ids)
  }
  delete() {
    const index = this.model.loads.findIndex(l => l.id === this.id)
    if(index !== -1){
      this.model.loads.splice(index, 1)
      this.removeLoadLabels()
      this.dispose()
    }
  }
  dispose() {
    this.mesh.forEach(obj => {
      this.model.scene.remove(obj)
      // Dispose of Mesh objects
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose())
        } else {
          obj.material.dispose()
        }
      }
      
      // Dispose of ArrowHelper objects
      if (obj instanceof THREE.ArrowHelper) {
        // ArrowHelper has cone and line geometries
        obj.cone.geometry.dispose()
        obj.line.geometry.dispose()
        // Dispose materials
        if (obj.cone.material) {
          if (Array.isArray(obj.cone.material)) {
            obj.cone.material.forEach(material => material.dispose())
          } else {
            obj.cone.material.dispose()
          }
        }
        if (obj.line.material) {
          if (Array.isArray(obj.line.material)) {
            obj.line.material.forEach(material => material.dispose())
          } else {
            obj.line.material.dispose()
          }
        }
      }
    })
    
    // Clear the mesh array after disposal
    this.mesh = []
  }
  createLabels(){
    this.createLinearLoadLabels()
    this.createNodalLoadLabels()
  }
  createLinearLoadLabels(){
    const ARROW_LEN_MAX = 1.0  
    const ARROW_LEN_MIN = 0.3
    
    const elementLoads: { [key: number]: Load[] } = {}
    const labels = []

    const maxLoad = this.model.loads.reduce((max, load) => load.value.length() > max ? load.value.length() : max, 0)
    const minLoad = this.model.loads.reduce((min, load) => load.value.length() < min ? load.value.length() : min, maxLoad)

    for(const load of this.model.loads){
      for(const target of load.targets){
        if(!elementLoads[target]){
          elementLoads[target] = []
        }
        elementLoads[target].push(load)
      }
    }

    for(const [elementId, loads] of Object.entries(elementLoads)){
      const element = this.model.members.find(e => Number(e.id) == Number(elementId))
      if(!element) continue

      const nodei = element?.nodes[0]
      const nodej = element?.nodes[1]
      const center = new THREE.Vector3(
        (nodei.x + nodej.x) / 2,
        (nodei.y + nodej.y) / 2,
        (nodei.z + nodej.z) / 2
      )

      const loadVector = new THREE.Vector3()
      for(const load of loads){
        loadVector.add(load.value)
      }
      const loadDirection = loadVector.clone().normalize()
      let arrowLength: number
      const currentLoadMagnitude = loadVector.length()
    
      if (maxLoad === minLoad) {
        arrowLength = (ARROW_LEN_MAX + ARROW_LEN_MIN) / 2
      } else {
        const normalizedLoad = (currentLoadMagnitude - minLoad) / (maxLoad - minLoad)
        arrowLength = ARROW_LEN_MIN + normalizedLoad * (ARROW_LEN_MAX - ARROW_LEN_MIN)
      }

      const angle = this.value.angleTo(loadDirection)
      const directionSign = Math.cos(angle)
      // FIX HERE
      console.log('Load Direction', loadDirection, directionSign)
      const labelPosition = new THREE.Vector3(
        center.x,
        center.y,
        center.z
      ).add(loadDirection.clone().negate().multiplyScalar(arrowLength * 1.1))

      // Get non-zero components for label
      const nonZeroComponents = [];
      if (Math.abs(loadVector.x) > 0.001) nonZeroComponents.push(`Fx: ${loadVector.x.toFixed(1)}`);
      if (Math.abs(loadVector.y) > 0.001) nonZeroComponents.push(`Fz: ${loadVector.y.toFixed(1)}`);
      if (Math.abs(loadVector.z) > 0.001) nonZeroComponents.push(`Fy: ${loadVector.z.toFixed(1)}`);
       
      const label = {
         id: `linear-load-${elementId}`,
         position:  labelPosition,
         text: `${nonZeroComponents.join(', ')}`,
         type: 'load'
       }
      labels.push(label)
    }

    console.log('LINEAR LOADS LABELS', labels)
    this.model.labeler.batchUpdateOrCreate(labels)
  }
  createNodalLoadLabels(){
    const labels = []
    const nodeLoads : { [key: number]: Load[] } = {}
    for(const load of this.model.loads){
      for(const target of load.targets){
        if(!nodeLoads[target]){
          nodeLoads[target] = []
        }
        nodeLoads[target].push(load)
      }
    }
    for(const [nodeId, loads] of Object.entries(nodeLoads)){
      const node = this.model.nodes.find(n => Number(n.id) == Number(nodeId))
      
      if(!node) continue

      const loadVector = new THREE.Vector3()
      for(const load of loads){
        loadVector.add(load.value)
      }

      const axes = [
        {
          index: 0,
          label: 'x',
          direction: new THREE.Vector3(1, 0, 0)
        },
        {
          index: 1,
          label: 'z',
          direction: new THREE.Vector3(0, 1, 0)
        },
        {
          index: 2,
          label: 'y',
          direction: new THREE.Vector3(0, 0, 1)
        }
      ]
      for(const axis of axes){
        const value = loadVector.getComponent(axis.index)
        if(value === 0) continue
        
        const nodePosition = new THREE.Vector3(node.x, node.y, node.z)
        let arrowEnd : THREE.Vector3
        const arrowLength = 1.0
        if(axis.index === 1) arrowEnd = nodePosition.clone().add(axis.direction.clone().multiplyScalar(arrowLength) )
        else arrowEnd = nodePosition.clone().sub(axis.direction.clone().multiplyScalar(arrowLength))

        let arrowCenter = new THREE.Vector3(
          (node.x + arrowEnd.x) / 2,
          (node.y + arrowEnd.y) / 2,
          (node.z + arrowEnd.z) / 2
        )
        
        const label = {
          id: `nodal-load-${nodeId}-${axis.label}`,
          position: arrowCenter.clone().multiplyScalar(1.02),
          text: `F${axis.label}: ${value.toFixed(1)}`,
          type: 'load'
        }
        labels.push(label)
      }
    }
    this.model.labeler.batchUpdateOrCreate(labels)
  }
}

export default Load;
