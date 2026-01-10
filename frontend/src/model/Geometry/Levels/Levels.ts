import Model from "../../Model"
import { mockLevels } from "../../../types"
interface Level {
  value: number
  label: string
}


class Levels {
  items : Level[] = mockLevels
  constructor(private model: Model) {
    this.model = model
  }

  addLevel(level: Level) {
    this.items.push(level)
  }

  getLevels() {
    return this.items
  }

  getLevel(value: number) {
    return this.items.find(level => level.value === value)
  }  
}

export default Levels
