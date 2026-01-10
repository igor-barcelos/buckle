import Model from "../../Model"
import * as THREE from "three"
import { Label } from "../../../types"
class Node {
  id: number
  name? : string
  x: number
  y: number
  z: number
  mesh: THREE.Mesh = new THREE.Mesh()
  model?: Model
  constructor(coordinates: THREE.Vector3, name? : string, id?: number){
    this.id = id ? id : Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 0x80000000
    this.x = coordinates.x
    this.y = coordinates.y
    this.z = coordinates.z
    this.name = name
  }
  create()
  {
    if(!this.model) return

    const geometry = new THREE.SphereGeometry(0.05, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    // const material = new THREE.MeshStandardMaterial({ color: 0x575757 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(new THREE.Vector3(this.x, this.y, this.z))
    mesh.userData.id = this.id
    mesh.userData.type = 'node'
    mesh.userData.originalColor=  0x0000ff
    mesh.visible = true
    mesh.layers.set(this.model.layer)
    this.model.scene.add(mesh);
    this.mesh = mesh
    
    if(!this.name) this.name = `Node ${this.model.nodes.length + 1 }`

    mesh.userData.label = this.name
    this.addLabel()
  }

  update(position : THREE.Vector3 ,  name? : string){
    this.x = position.x
    this.y = position.y
    this.z = position.z
    this.mesh.position.copy(position)
    if(name) this.name = name

    if(!this.model) return 
    const members = [...this.model.members]
    members.forEach(member => {
      let nodes = [...member.nodes]
      const index = nodes.findIndex(node => node.id === this.id )
      if(index !== -1 ){
        nodes[index] = this
        const {label , section, gamma, release } = member
        member.update(nodes, section, gamma, label, release)
      }
    })

    this.addLabel()
  }
  
  delete(){
    if(!this.model) return 
    const index = this.model.nodes.findIndex(node => node.id === this.id)

    if(index !== -1 ) this.model.nodes.splice(index, 1)

    this.dispose()

    const membersIdToDelete : number[]= []
    this.model?.members.forEach(member => {
      const index = member.nodes.findIndex(node => node.id === this.id )
      if(index !== -1 ) membersIdToDelete.push(member.id)
    })

    if(membersIdToDelete.length > 1 ){
      const membersToDelete = this.model.members.filter((member) => membersIdToDelete.includes(member.id))

      membersToDelete.forEach(member => {
        member.remove()
      })
    }
  }

  dispose(){
    this.mesh.geometry.dispose()
    const ids = [`node-${this.id}`]
    this.model?.labeler.batchDelete(ids) 
    if(Array.isArray(this.mesh.material)){
      for(let i = 0; i < this.mesh.material.length; i++){
        this.mesh.material[i].dispose()
      }
    }else{
      this.mesh.material.dispose()
    }
    if(this.mesh.parent){
      this.mesh.parent.remove(this.mesh)
    }
  }

  addLabel(){
    if(!this.model || !this.model.visibility.nodeLabels) return 

    const delta = 0.1
    const labels : Label[] = [
      {
          id : `node-${this.id}`,
          position : new THREE.Vector3(this.x, this.y + delta, this.z),
          text : this.name || '',
      }
    ]
    
    this.model.labeler.batchUpdateOrCreate(labels)
  }
}

export default Node