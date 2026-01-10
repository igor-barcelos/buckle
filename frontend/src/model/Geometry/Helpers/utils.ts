import * as THREE from 'three'
import  Node  from '../../Elements/Node/Node'

export const  getMouseLocation  = ( event : MouseEvent  ) : THREE.Vector2 => {

  const canvas = document.querySelector('canvas')
  const rect = canvas!.getBoundingClientRect();
  const _vec2 = new THREE.Vector2();
  _vec2.x = (( ( event.clientX - rect.left ) / ( rect.right - rect.left ) ) * 2 - 1);
  _vec2.y =  -( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;

  return _vec2
}

export const findNodeAtPosition = (
  nodes: Node[],
  position: THREE.Vector3,
  threshold: number = 0.01
): Node | null => {
  return nodes.find(node => {
    const distance = Math.sqrt(
      Math.pow(node.x - position.x, 2) +
      Math.pow(node.y - position.y, 2) +
      Math.pow(node.z - position.z, 2)
    )
    return distance < threshold
  }) || null
}
