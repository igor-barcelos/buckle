import { Model } from "../Model"

import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';

import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';

class PostProcessing {  
  model : Model
  meshes : THREE.Mesh[] = []
  constructor(model : Model) {  
    this.model = model
  }
  
  showDiagram(type : string, scale: number = 1.0, selectedMemberIds : Number[]) {
    this.dispose()

    const { output } = this.model
    console.log('POST PROCESSING', output)
    const { members } = output
    const labels  = []

    // FILTER BY MEMBER 
    for (const member of members) {
      if(!selectedMemberIds.includes(member.id) && selectedMemberIds.length > 0) continue
       
      const effort = type
      const { node_efforts } = member
  
      // Create the main curve for the line
      const curve = new THREE.CatmullRomCurve3(node_efforts.map((node : any) => {
        const nodeEfforts = node['efforts']
        const nodeEffort = nodeEfforts[effort]
        const nodeEffortDisplacedPosition = nodeEffort['displaced_positions']
        const originalCoord = node['coord']
        
        // Calculate displacement vector: displaced_position - original_position
        const displacementX = nodeEffortDisplacedPosition[0] - originalCoord[0]
        const displacementY = nodeEffortDisplacedPosition[1] - originalCoord[1]
        const displacementZ = nodeEffortDisplacedPosition[2] - originalCoord[2]
        
        // Scale only the displacement, then add back to original position
        return new THREE.Vector3(
          originalCoord[0] + (displacementX * scale), 
          originalCoord[2] + (displacementZ * scale), 
          originalCoord[1] + (displacementY * scale)
        )
      }))
  
      // Get curve points for smooth interpolation
      const curvePoints = curve.getPoints(50)
      
      // Create baseline points (original undeformed positions)
      const baselinePoints = node_efforts.map((node : any) => {
        const coord = node['coord']
        return new THREE.Vector3(coord[0], coord[2], coord[1])
      })
      
      // Create baseline curve
      const baselineCurve = new THREE.CatmullRomCurve3(baselinePoints)
      const baselineCurvePoints = baselineCurve.getPoints(50)
  
      // Get actual effort values for each node
      const effortValues = node_efforts.map((node : any) => node['efforts'][effort]['value'])
      
      // Group consecutive points by sign (positive/negative)
      const regions = []
      let currentRegion = null
      
      for (let i = 0; i < curvePoints.length; i++) {
        const curvePoint = curvePoints[i]
        const baselinePoint = baselineCurvePoints[i]
        
        // Interpolate effort value based on curve position
        const t = i / (curvePoints.length - 1)
        const scaledT = t * (effortValues.length - 1)
        const lowerIndex = Math.floor(scaledT)
        const upperIndex = Math.min(lowerIndex + 1, effortValues.length - 1)
        const localT = scaledT - lowerIndex
        
        // Linear interpolation between effort values
        const effortValue = effortValues[lowerIndex] + (effortValues[upperIndex] - effortValues[lowerIndex]) * localT
        
        // Determine if this point is positive or negative
        const isPositive = effortValue >= 0
        
        if (!currentRegion || currentRegion.isPositive !== isPositive) {
          // If we're changing signs, we need to find the zero crossing point
          if (currentRegion && i > 0) {
            const prevT = (i - 1) / (curvePoints.length - 1)
            const prevScaledT = prevT * (effortValues.length - 1)
            const prevLowerIndex = Math.floor(prevScaledT)
            const prevUpperIndex = Math.min(prevLowerIndex + 1, effortValues.length - 1)
            const prevLocalT = prevScaledT - prevLowerIndex
            const prevEffortValue = effortValues[prevLowerIndex] + (effortValues[prevUpperIndex] - effortValues[prevLowerIndex]) * prevLocalT
            
            // Find zero crossing point if values have different signs
            if ((prevEffortValue >= 0) !== (effortValue >= 0)) {
              const zeroT = Math.abs(prevEffortValue) / (Math.abs(prevEffortValue) + Math.abs(effortValue))
              const zeroCurvePoint = new THREE.Vector3().lerpVectors(curvePoints[i-1], curvePoint, zeroT)
              const zeroBaselinePoint = new THREE.Vector3().lerpVectors(baselineCurvePoints[i-1], baselinePoint, zeroT)
              
              // Add zero crossing to current region
              currentRegion.curvePoints.push(zeroCurvePoint)
              currentRegion.baselinePoints.push(zeroBaselinePoint)
              currentRegion.effortValues.push(0)
            }
          }
          
          // Start a new region
          if (currentRegion) {
            regions.push(currentRegion)
          }
          currentRegion = {
            isPositive: isPositive,
            curvePoints: [curvePoint],
            baselinePoints: [baselinePoint],
            effortValues: [effortValue]
          }
          
          // If we had a zero crossing, add it to the new region too
          if (i > 0 && currentRegion.curvePoints.length === 1) {
            const prevT = (i - 1) / (curvePoints.length - 1)
            const prevScaledT = prevT * (effortValues.length - 1)
            const prevLowerIndex = Math.floor(prevScaledT)
            const prevUpperIndex = Math.min(prevLowerIndex + 1, effortValues.length - 1)
            const prevLocalT = prevScaledT - prevLowerIndex
            const prevEffortValue = effortValues[prevLowerIndex] + (effortValues[prevUpperIndex] - effortValues[prevLowerIndex]) * prevLocalT
            
            if ((prevEffortValue >= 0) !== (effortValue >= 0)) {
              const zeroT = Math.abs(prevEffortValue) / (Math.abs(prevEffortValue) + Math.abs(effortValue))
              const zeroCurvePoint = new THREE.Vector3().lerpVectors(curvePoints[i-1], curvePoint, zeroT)
              const zeroBaselinePoint = new THREE.Vector3().lerpVectors(baselineCurvePoints[i-1], baselinePoint, zeroT)
              
              // Insert zero crossing at the beginning of new region
              currentRegion.curvePoints.unshift(zeroCurvePoint)
              currentRegion.baselinePoints.unshift(zeroBaselinePoint)
              currentRegion.effortValues.unshift(0)
            }
          }
        } else {
          // Continue current region
          currentRegion.curvePoints.push(curvePoint)
          currentRegion.baselinePoints.push(baselinePoint)
          currentRegion.effortValues.push(effortValue)
        }
      }
      
      // Add the last region
      if (currentRegion) {
        regions.push(currentRegion)
      }
  
      // Create filled regions with z-fighting prevention
      regions.forEach((region, regionIndex) => {
        if (region.curvePoints.length < 2) return // Skip regions with insufficient points
        
        // Create geometry for the filled area
        const vertices = []
        const indices = []
        
        // Small offset to prevent z-fighting (stagger each region slightly)
        const zOffset = regionIndex * 0.001
        
        // Add curve points with slight offset
        region.curvePoints.forEach((point) => {
          vertices.push(point.x, point.y, point.z + zOffset)
        })
        
        // Add baseline points (in reverse order to close the shape) with same offset
        for (let i = region.baselinePoints.length - 1; i >= 0; i--) {
          const point = region.baselinePoints[i]
          vertices.push(point.x, point.y, point.z + zOffset)
        }
        
        // Create triangular faces to fill the area
        const numCurvePoints = region.curvePoints.length
        const numTotalPoints = vertices.length / 3
        
        // Create triangles between curve and baseline
        for (let i = 0; i < numCurvePoints - 1; i++) {
          const curveIdx1 = i
          const curveIdx2 = i + 1
          const baselineIdx1 = numTotalPoints - 1 - i
          const baselineIdx2 = numTotalPoints - 2 - i
          
          // First triangle
          indices.push(curveIdx1, baselineIdx1, curveIdx2)
          // Second triangle
          indices.push(curveIdx2, baselineIdx1, baselineIdx2)
        }
        
        // Create the geometry
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()
        
        // Choose color based on sign
        const color =  0x87CEEB  // Light blue or light red
        
        // Create material with z-fighting prevention techniques
        const material = new THREE.MeshBasicMaterial({
          color: color,
          opacity: 0.6,
          transparent: true,
          side: THREE.DoubleSide,
          depthTest: true,
          depthWrite: false, // Prevent depth conflicts with transparent objects
          polygonOffset: true, // Enable polygon offset
          polygonOffsetFactor: regionIndex + 1, // Unique offset for each region
          polygonOffsetUnits: 1
        })
        
        // Create and add the filled region mesh
        const regionMesh = new THREE.Mesh(geometry, material)
        
        // Alternative: Use renderOrder to control rendering sequence
        regionMesh.renderOrder = regionIndex
        
        this.model.scene.add(regionMesh)
        this.meshes.push(regionMesh)
      })
  
      // Create the original line (on top of filled regions) with z-fighting prevention
      const middlePoints = curve.getPoints(50).flatMap(point => [point.x, point.y, point.z + 0.002])
      const startPoint = [
        node_efforts[0].coord[0],
        node_efforts[0].coord[2],
        node_efforts[0].coord[1] + 0.002
      ]
      const endPoint = [
        node_efforts[node_efforts.length - 1].coord[0],
        node_efforts[node_efforts.length - 1].coord[2],
        node_efforts[node_efforts.length - 1].coord[1] + 0.002
      ]
  
      const points = [...startPoint, ...middlePoints, ...endPoint]
      const lineGeometry = new LineGeometry().setPositions(points)
      const lineMaterial = new LineMaterial({
        color: 0x000000, // Black line for better contrast
        linewidth: 2, 
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
      })
      const line = new Line2(lineGeometry, lineMaterial)
      
      // Ensure line renders on top
      line.renderOrder = 1000
      
      this.model.scene.add(line)
      this.meshes.push(line)
      const getScaledPosition = (displacedPos: number[], originalCoord: number[]) => {
        const dispX = displacedPos[0] - originalCoord[0]
        const dispY = displacedPos[1] - originalCoord[1]
        const dispZ = displacedPos[2] - originalCoord[2]
        return new THREE.Vector3(
          originalCoord[0] + (dispX * scale),
          originalCoord[2] + (dispZ * scale),
          originalCoord[1] + (dispY * scale)
        )
      }

      // Find nodes with maximum and minimum effort values
      const findExtremes = (nodeEfforts: any[], effortType: string) => {
        let max = { value: -Infinity, node: null as any }
        let min = { value: Infinity, node: null as any }

        nodeEfforts.forEach((node: any) => {
          const effortValue = node.efforts[effortType].value
          
          if (effortValue > max.value) {
            max = { value: effortValue, node }
          }
          if (effortValue < min.value) {
            min = { value: effortValue, node }
          }
        })

        return { max, min}
      }

      // Create label for an effort node
      const createLabel = (
        node: any,
        effortType: string,
        effortValue: number,
        labelType: 'max' | 'min',
        memberId: string
      ) => {
        const nodeEffort = node.efforts[effortType]
        const unit = nodeEffort.unit
        const text = `${effortValue}`
        const displacedPosition = nodeEffort.displaced_positions
        const originalCoord = node.coord
        
        // Determine background color based on effort value
        const backgroundColor = effortValue >= 0 ? '#90EE90' : '#FFB6C1' // Light green for positive, light pink for negative
        
        return {
          id: `${labelType}-effort-label-${memberId}`,
          position: getScaledPosition(displacedPosition, originalCoord),
          text,
          type: 'effort',
          backgroundColor
        }
      }

      // Main logic
      const { max, min} = findExtremes(node_efforts, effort)
      const elementLabels: any[] = []

      // Add max effort label
      if (max.node) {
        elementLabels.push(
          createLabel(max.node, effort, max.value, 'max', member.id)
        )
      }

      // Add min effort label (only if different from max)
      if (min.node && min.node !== max.node) {
        elementLabels.push(
          createLabel(min.node, effort, min.value, 'min', member.id)
        )
      }
      labels.push(...elementLabels)
    }
    
    console.log('LABELS', labels)
    this.model.labeler.batchUpdateOrCreate(labels)
  }

  dispose(){
    this.meshes.forEach(mesh => {
      mesh.geometry.dispose()
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      } else {
        mesh.material.dispose()
      }
      this.model.scene.remove(mesh)
    })

    this.meshes = []
    this.removeLabels()
  }
  removeLabels(){
    const ids : string[] = []
    this.model.members.forEach(member => {
      ids.push(`min-effort-label-${member.id}`)
      ids.push(`max-effort-label-${member.id}`)
    })
    this.model.labeler.batchDelete(ids)
  }
}

export default PostProcessing

