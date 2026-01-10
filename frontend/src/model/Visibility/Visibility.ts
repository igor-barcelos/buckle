import Model from "../Model"
import Labeler from "../Labeler/Labeler"
import { Label } from "../../types"
import * as THREE from "three";
import { makeAutoObservable } from "mobx";
class Visibility {
  labeler : Labeler
  model : Model
  nodes : boolean = true
  nodeLabels : boolean = false
  members : boolean = true
  memberLabels : boolean = false
  sections : boolean = true
  
  constructor(model : Model) {
    this.model = model
    this.labeler = model.labeler

    makeAutoObservable(this)
  }

  showOrHideMembers(visible : boolean){
    this.members = visible
    this.model.members.forEach((member) => {
      // member.mesh.visible = visible

      const line = member.line
      if(line) line.mesh.visible = visible

    })
  }

  showOrHideMemberLabels(visible : boolean) {
    this.memberLabels = visible
    const ids = this.model.members.map((member) => `member-${member.id}`)
    const delta = 0.1
    if(!visible) {
      this.model.labeler.batchDelete(ids) 
      return
    } 

    const labels : Label[] = this.model.members.map((member) => {
      const nodes = member.nodes
      const iNode = nodes[0]
      const jNode = nodes[1]

      const xCenter = (iNode.x + jNode.x) / 2
      const yCenter = (iNode.y + jNode.y) / 2
      const zCenter = (iNode.z + jNode.z) / 2
      return(
        {
          id : `member-${member.id}`,
          position : new THREE.Vector3(xCenter, yCenter + delta, zCenter),
          text : member.label ? member.label : '',
        }
      )
    })
    
    this.model.labeler.batchUpdateOrCreate(labels)
  }
  
  showOrHideNodes(visible : boolean){
    this.nodes = visible
    this.model.nodes.forEach((node) => {
      node.mesh.visible = visible
    })
  }

  showOrHideNodeLabels(visible : boolean) {
    this.nodeLabels = visible
    const ids = this.model.nodes.map((node) => `node-${node.id}`)
    const delta = 0.1
    if(!visible) {
      this.model.labeler.batchDelete(ids) 
      return
    } 

    const labels : Label[] = this.model.nodes.map((node) => {
      return(
        {
          id : `node-${node.id}`,
          position : new THREE.Vector3(node.x, node.y + delta, node.z),
          text : node.name ? node.name : '',
        }
      )
    })
    
    this.model.labeler.batchUpdateOrCreate(labels)
  }

  showOrHideSections(visible : boolean){
    this.sections = visible
    this.model.members.forEach((member) => {
      member.mesh.visible = visible
      member.edges.visible = visible
    })
  }

}

export default Visibility