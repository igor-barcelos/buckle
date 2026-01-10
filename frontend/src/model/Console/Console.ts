import { Prompt } from "../../types"
import { makeAutoObservable } from "mobx"

export default  class Console {
  prompts: Prompt[] = []
  constructor(){
    this.prompts = []
    makeAutoObservable(this)
  } 
  
  create(prompt: Prompt){
    this.prompts.push(prompt)
  }
  updateOne(prompt: Prompt){
    const promps = this.prompts.map(p => {
      if(p.id === prompt.id){
        return {
          ...p,
          message: prompt.message,
          timestamp: new Date()
        }
      }
      return p
    })
    this.prompts = promps
  }

  createOrUpdateOne(prompt: Prompt){
    const id = prompt.id
    const exist = this.prompts.find(p => p.id === id)
    console.log('PROMPTS', this.prompts)
    if(exist){
      this.updateOne(prompt)
    }
    else{
      this.create(prompt)
    }
    
  }

  batchDelete(ids: string[]){
    const promps = this.prompts.filter(p => !ids.includes(p.id))
    this.prompts = promps
    console.log('PROMPTS', this.prompts)
  }
}