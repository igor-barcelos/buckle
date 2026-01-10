import Model from '../Model'
import { 
  RectangularSection,
  CircularSection, 
  HollowCircularSection,
  ISection
 } from '../../types'

class Section {
  model: Model 
  section : RectangularSection | CircularSection | HollowCircularSection | ISection
  constructor(model: Model, section : RectangularSection | CircularSection | HollowCircularSection | ISection ) {
    this.model = model
    this.section = { 
      ...section, 
      id : section.id || Math.floor(Math.random() * 0x7FFFFFFF),
      name : section.name || `Section ${model.sections.length + 1 }`
    }
  }

  createOrUpdate(){
    const index = this.model.sections.findIndex(item => item.id === this.section.id)
    if(index === -1){
      this.model.sections.push(this.section)
    }else{
      this.model.sections[index] = this.section
    }
  }

  delete(){
    const index = this.model.sections.findIndex(item => item.id === this.section.id)
    if(index !== -1){
      this.model.sections.splice(index, 1)
    }
  }
}

export default Section
