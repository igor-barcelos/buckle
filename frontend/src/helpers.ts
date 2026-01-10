
import * as THREE from 'three';
// import { useModel } from './model/Context';

import Node from './model/Elements/Node/Node';
import ElasticBeamColumnClass from './model/Elements/ElasticBeamColumn/ElasticBeamColumn';
import BoundaryCondition from './model/BoundaryCondition/BoundaryCondition';
import Load from './model/Load/Load';
import Model from './model/Model';

export const exportModelJson = (model: Model) => {
  // Create JSON structure from the current model
  const jsonData = {
    nodes: model.nodes.map(node => ({
      id: node.id,
      name: node.name,
      x: node.x,
      y: node.y,
      z: node.z
    })),
    materials: model.materials,
    sections: model.sections,
    members: model.members.map(member => ({
      id: member.id,
      label: member.label,
      nodei: {
        id: member.nodes[0].id
      },
      nodej: {
        id: member.nodes[1].id
      },
      section: member.section.id,
      vecxz: [member.vecxz.x, member.vecxz.y, member.vecxz.z]
    })),
    boundary_conditions: model.boundaryConditions.map(bc => ({
      id: bc.id,
      type: bc.type,
      targets: bc.targets,
      name: bc.name,
      dx: bc.dx,
      dy: bc.dy,
      dz: bc.dz,
      rx: bc.rx,
      ry: bc.ry,
      rz: bc.rz
    })),
    loads: model.loads.map(load => ({
      id: load.id,
      type: load.type,
      targets: load.targets,
      name: load.name,
      value: {
        x: load.value.x,
        y: load.value.y,
        z: load.value.z
      },
      // direction: {
      //   x: load.direction.x,
      //   y: load.direction.y,
      //   z: load.direction.z
      // }
    }))
  };

  return jsonData;
};

export const buildModelOnjson = async (model: Model , path : string) => {
  try {
    
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
    }
    const jsonData = await response.json();

    // const model = useModel();
    // Clear existing model first
    model.clear()
    
    // Create a map to store node references by ID for member creation
    const nodeMap = new Map<number, Node>()
    
    // 1. Create nodes first
    if (jsonData.nodes) {
      jsonData.nodes.forEach((nodeData: any) => {
        const node = new Node(
          new THREE.Vector3(nodeData.x, nodeData.y, nodeData.z),
          nodeData.name
        )
        // Use the original ID from the JSON
        node.id = nodeData.id
        node.model = model
        node.create()
        model.nodes.push(node)
        nodeMap.set(node.id, node)
      })
      console.log(`Created ${jsonData.nodes.length} nodes`)
    }
    
    // 2. Update materials and sections if provided
    if (jsonData.materials) {
      model.materials = jsonData.materials
    }
    if (jsonData.sections) {
      model.sections = jsonData.sections
    }
    
    // 3. Create members/elements
    if (jsonData.members) {
      jsonData.members.forEach((memberData: any) => {
        const nodei = nodeMap.get(memberData.nodei.id)
        const nodej = nodeMap.get(memberData.nodej.id)
        
        if (!nodei || !nodej) {
          console.warn(`Could not find nodes for member ${memberData.id}`)
          return
        }
        
        // Find the section
        const section = model.sections.find(s => s.id === memberData.section)
        if (!section) {
          console.warn(`Could not find section ${memberData.section} for member ${memberData.id}`)
          return
        }
        
        const vecxz = new THREE.Vector3(
          memberData.vecxz[0],
          memberData.vecxz[1],
          memberData.vecxz[2]
        )
        
        const member = new ElasticBeamColumnClass(
          model,
          memberData.label || `Member ${memberData.id}`,
          [nodei, nodej],
          section,
        )
        member.id = memberData.id
        member.create()
        member.release = memberData.release || ""
        model.members.push(member)
      })
      console.log(`Created ${jsonData.members.length} members`)
    }
    
    // 4. Create boundary conditions
    if (jsonData.boundary_conditions) {
      jsonData.boundary_conditions.forEach((bcData: any) => {
        const boundaryCondition = new BoundaryCondition(model, {
          id: bcData.id,
          type: bcData.type,
          targets: bcData.targets,
          name: bcData.name,
          dx: bcData.dx,
          dy: bcData.dy,
          dz: bcData.dz,
          rx: bcData.rx,
          ry: bcData.ry,
          rz: bcData.rz
        } as any)
        boundaryCondition.createOrUpdate()
      })
      console.log(`Created ${jsonData.boundary_conditions.length} boundary conditions`)
    }
    
    // 5. Create loads
    if (jsonData.loads) {
      jsonData.loads.forEach((loadData: any) => {
        const load = new Load(model, {
          id: loadData.id,
          type: loadData.type,
          targets: loadData.targets,
          name: loadData.name,
          value: new THREE.Vector3(loadData.value.x, loadData.value.y, loadData.value.z),
        } as any)
        load.createOrUpdate()
      })
      console.log(`Created ${jsonData.loads.length} loads`)
    }
    
    console.log('Model loaded successfully from JSON!')
    // alert('Model loaded successfully!')
    
  } catch (error) {
    console.error('Error loading model from JSON:', error)
    alert('Error loading model: ' + error)
  }
}

