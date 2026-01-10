import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import ElasticBeamColumn  from './model/Elements/ElasticBeamColumn'
import * as THREE from 'three'

/**
 * Section Types
 */
 
export type RectangularSection = {
  id: number
  name: string
  type: 'Rectangular'
  width: number
  height: number
  material: Material
  properties?: SectionProperties

}
export type CircularSection = {
  id: number
  name: string
  type: 'Circular'
  diameter: number
  material: Material
  properties?: SectionProperties
}

export type HollowCircularSection = {
  id: number
  name: string
  type: 'HollowCircular'
  diameter: number
  thickness: number
  material: Material
  properties?: SectionProperties
}

export type ISection = {
  id: number
  name: string
  type: 'I'
  depth: number
  width: number
  tw: number
  tf: number
  r: number
  material: Material
  properties?: SectionProperties
}


export type SectionProperties = {
  A: number;
  Iz: number;
  Iy: number;
  Jxx: number;
  G: number;
  E: number;
  v: number;
}

export type ElasticIsotropicMaterial = {
  id : number; 
  name : string; 
  E : number ;
  nu : number;
  rho? : number

}
export type Material  =  ElasticIsotropicMaterial

export type Section = RectangularSection | CircularSection | HollowCircularSection | ISection


// Nodes 

export type Node = {
  id : number;
  x  : number;
  y : number;
  z : number;
}

export type Member = ElasticBeamColumn 

export type ElementType = 'elasticBeamColumn' | '3dLine' | 'node' | 'colUp' | 'colDown'

// Levels 
export interface Level {
  value: number
  label: string
}

export type Line3D = {
  // id : number
  startPoint : Node
  endPoint : Node
  mesh : Line2 
  layer : number
}


export type Prompt = {
  id: string
  message: string
  type: 'INFO' | 'ERROR' | 'SUCCESS' | 'WARNING'
  timestamp: Date
}

//  MOCK DATA

export const mockSections: Section[] = [
  {
    id: 2,
    name: 'REC 0.3x0.5m',
    type: 'Rectangular',
    width: 200,
    height: 500,
    material: {
      id: 1,
      name: 'Concrete',
      E: 30e9,
      nu: 0.2
    },
    properties: {
      A: 0.15,
      Iz: 0.003125,
      Iy: 0.001125,
      Jxx: 0.004250,
      G: 12.5e9,
      E: 30e9,
      v: 0.2
    }
  }, 
]

export const mockMaterials : Material[] = [
  {
    id: 1,
    name: 'Concrete',
    E: 30e9,
    nu: 0.2
  },
  {
    id: 2,
    name: 'Steel',
    E: 210e9,
    nu: 0.3
  }
]
export const mockLevels : Level[] = [
  { value: 0, label: '+0m' },
  { value: 5, label: '+5m' },
  { value: 10, label: '+10m' },
]

//  LOADS 
export type LoadType = 'nodal' | 'linear'
export type NodalLoad = {
  id: number
  name: string
  type: LoadType
  targets: number[]
  value: THREE.Vector3

}

export type LinearLoad = {
  id: number
  name: string
  type: LoadType
  targets: number[]
  value: number
  direction: 'x' | 'y' | 'z'
}

export type GlobalLoad = NodalLoad | LinearLoad

export type Label = {
  id : string
  position : THREE.Vector3
  text : string
  type? : 'effort' | 'load' | 'length' | 'angle' | 'arc' | 'gridSnap' | 'endPointSnap'
  rotation? : number
}