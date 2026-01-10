import { Model } from "../../Model";
import * as THREE from 'three'
import Node from "../Node/Node";
import { 
  ElementType, 
  Section, 
  Line3D, 
  ISection, 
  HollowCircularSection, 
  RectangularSection,
 } from "../../../types";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Label } from "../../../types";
class ElasticBeamColumn {
  model: Model
  id: number
  index: number
  nodes: Node[]
  label: string
  mesh: THREE.Mesh
  group!: THREE.Group
  type: ElementType = 'elasticBeamColumn'
  section: Section
  vecxz: THREE.Vector3
  gamma: number = 0
  line: Line3D | null = null
  edges : THREE.LineSegments = new THREE.LineSegments()
  release: string = ""
  constructor(model: Model, label: string, nodes: Node[], section: Section, id?: number) {
    this.model = model
    this.id = id ? id : Math.floor(Math.random() * 0x7FFFFFFF)
    this.index = this.model.members.length === 0 ? 1 : Math.max(...this.model.members.map(member => member.index)) + 1

    this.nodes = nodes
    this.label = label ? label : `Member ${this.index}`
    this.section = section
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0), new THREE.MeshStandardMaterial({ color: 0x888888 }))
    this.vecxz = this._vecxz()
  }

  create = () => {
    const start = new THREE.Vector3(this.nodes[0].x, this.nodes[0].y, this.nodes[0].z)
    const end = new THREE.Vector3(this.nodes[1].x, this.nodes[1].y, this.nodes[1].z)
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const positions = [
      start.x,
      start.y,
      start.z,
      end.x,
      end.y,
      end.z
    ]
    const sectionType = this.section.type
    let geometry: THREE.ExtrudeGeometry;
    let edges: THREE.EdgesGeometry;

    switch (sectionType) {
      case 'HollowCircular':
        geometry = this.hollowCircularSection(this.section, length);
        edges = new THREE.EdgesGeometry(geometry);
        break;
      case 'Rectangular':
        geometry = this.rectangularSection(this.section, length);
        edges = new THREE.EdgesGeometry(geometry);
        break;
      case 'I':
        geometry = this.iSection(this.section, length);
        edges = new THREE.EdgesGeometry(geometry);
        break;
      default:
        throw new Error(`Unknown section type: ${sectionType}`);
    }
    // const material = new THREE.MeshBasicMaterial({ color: 0x575757 });
    // const material = new THREE.MeshStandardMaterial({ color: 0x575757 , metalness : 0.45, roughness: 0.65});

    const material = new THREE.MeshLambertMaterial({
      color: 0xa0a0a0,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      linewidth: 1.5
    });

    this.edges = new THREE.LineSegments(edges, edgeMaterial);
    this.mesh = new THREE.Mesh(geometry, material);

    this.group = new THREE.Group();
    this.group.add(this.mesh);
    this.group.add(this.edges);

    this.model.scene.add(this.group);
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    direction.normalize();

    const z = direction.clone() // In threejs the extrusion occurs in the Z axis.
    let up = new THREE.Vector3(0, 1, 0) // Default for  local UP horizontal members
    const cross_vec = new THREE.Vector3().crossVectors(up, z)

    if (cross_vec.length() === 0) up = new THREE.Vector3(1, 0, 0) // Local UP vertical members

    const gammaRad = this.gamma * Math.PI / 180

    const x = new THREE.Vector3().crossVectors(up, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x).normalize();

    const rotation = new THREE.Quaternion().setFromAxisAngle(z, gammaRad)

    x.applyQuaternion(rotation)
    y.applyQuaternion(rotation)

    const m = new THREE.Matrix4().makeBasis(x, y, z);
    const qWorld = new THREE.Quaternion().setFromRotationMatrix(m);
    this.group.quaternion.copy(qWorld);

    const lineGeometry = new LineGeometry();
    lineGeometry.setPositions(positions);
    const lineMaterial = new LineMaterial({
      color: 0xa0a0a0,
      linewidth: 4,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight)
    });
    const lineMesh = new Line2(lineGeometry, lineMaterial); // TODO: fix this
    this.line = {
      startPoint: this.nodes[0],
      endPoint: this.nodes[1],
      mesh: lineMesh,
      layer: this.model.layer
    }


    this.group.position.copy(midpoint);
    this.group.userData.id = this.id
    this.group.userData.type = this.type
    this.group.userData.label = this.label
    this.edges.visible = this.model.visibility.sections
    this.mesh.visible = this.model.visibility.sections
    this.group.layers.set(this.model.layer)

    this.model.scene.add(lineMesh);
    lineMesh.userData.id = this.id
    lineMesh.userData.type = this.type
    lineMesh.userData.label = this.label
    lineMesh.visible = true
    lineMesh.layers.set(this.model.layer)
    this.addLabel()
  }

  update(nodes: Node[], section: Section, gamma: number, label: string, release: string) {
    this.nodes = nodes
    this.label = label
    this.section = section
    this.vecxz = this._vecxz()
    this.gamma = gamma
    this.release = release

    
    this.dispose()
    this.create()
  }

  private dispose() {
    const ids = [`member-${this.id}`]
    this.model.labeler.batchDelete(ids)
    
    // Dispose the group and all its children
    if (this.group) {
      // Remove group from scene first
      if (this.group.parent) {
        this.model.scene.remove(this.group)
      }
      
      // Dispose all children (mesh and edges)
      this.group.children.forEach((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          if (child.geometry) {
            child.geometry.dispose()
          }
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose())
            } else {
              child.material.dispose()
            }
          }
        }
      })
    }
    
    // Also dispose the line if it exists
    if (this.line && this.line.mesh) {
      if (this.line.mesh.geometry) {
        this.line.mesh.geometry.dispose()
      }
      if (this.line.mesh.material) {
        if (Array.isArray(this.line.mesh.material)) {
          this.line.mesh.material.forEach((mat) => mat.dispose())
        } else {
          this.line.mesh.material.dispose()
        }
      }
      if (this.line.mesh.parent) {
        this.line.mesh.parent.remove(this.line.mesh)
      }
    }
  }

  remove() {
    // Clean up all meshes and 3D objects
    this.dispose()
    
    // Remove member from model
    const index = this.model.members.findIndex(member => member.id === this.id)
    if (index !== -1) {
      this.model.members.splice(index, 1)
    }
  }

  _vecxz() {
    const nodei = this.nodes[0]
    const nodej = this.nodes[1]

    let up = new THREE.Vector3(0, 1, 0)
    const local_vecx = new THREE.Vector3(nodej.x - nodei.x, nodej.y - nodei.y, nodej.z - nodei.z).normalize()
    const cross_vec = new THREE.Vector3().crossVectors(up, local_vecx)

    // https://help.autodesk.com/view/RSAPRO/2025/ENU/?guid=GUID-E6C19973-6864-4E67-9659-6F43579E2DB8
    // HORIZONTAL MEMBERS LOCAL VEC_Z = GLOBAL_VEC_Z IN OPENSEESPY
    let vecz = new THREE.Vector3(0, 0, 1)

    // VERTICAL MEMBERS LOCAL VEC_Z = GLOBAL_VEC_X IN OPENSEESPY
    if (cross_vec.length() === 0) vecz = new THREE.Vector3(1, 0, 0)

    // Apply gamma rotation about the local x-axis (member axis)
    const gammaRad = this.gamma * Math.PI / 180
    const rotation = new THREE.Quaternion().setFromAxisAngle(local_vecx, gammaRad)
    vecz.applyQuaternion(rotation)

    console.log('MEMBER', this.label, vecz)
    return vecz
  }

  iSection(section: ISection, L: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    const { depth, width, tw, tf, r } = section

    // Half-dimensions
    const H = depth / 2, B = width / 2, TW = tw / 2, TF = tf;

    // Helper to move/draw
    const m = (x: number, y: number) => shape.moveTo(x, y);
    const l = (x: number, y: number) => shape.lineTo(x, y);

    // --- Outline (clockwise), sharp corners version (r = 0) ---
    // Start at bottom-left outer corner and walk around the I perimeter
    m(-B, -H);
    l(B, -H);
    l(B, -H + TF);
    l(TW, -H + TF);
    l(TW, H - TF);
    l(B, H - TF);
    l(B, H);
    l(-B, H);
    l(-B, H - TF);
    l(-TW, H - TF);
    l(-TW, -H + TF);
    l(-B, -H + TF);
    l(-B, -H); // close

    // If you want inner fillets (r > 0), replace the sharp inner corners
    // with quadraticCurveTo/absarc segments. Omitted here for brevity.

    // Extrude along z (Three.js default). We’ll scale to meters later.
    const geom = new THREE.ExtrudeGeometry(shape, { depth: L * 1E3, bevelEnabled: false });

    // Put centroid at origin: shift by -L/2 in Z
    geom.translate(0, 0, -L * 1E3 / 2);

    const mmToM = 0.001;
    geom.scale(mmToM, mmToM, mmToM);
    return geom
    // Convert mm → m if your world uses SI meters

  }

  hollowCircularSection(section: HollowCircularSection, L: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    const { diameter, thickness } = section;

    // Calculate radii
    const outerRadius = diameter / 2;
    const innerRadius = outerRadius - thickness;

    // Create outer circle
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // Create inner hole (counter-clockwise to create a hole)
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    // Extrude along z (Three.js default). We'll scale to meters later.
    const geom = new THREE.ExtrudeGeometry(shape, { depth: L * 1E3, bevelEnabled: false });

    // Put centroid at origin: shift by -L/2 in Z
    geom.translate(0, 0, -L * 1E3 / 2);

    const mmToM = 0.001;
    geom.scale(mmToM, mmToM, mmToM);
    return geom;
  }

  rectangularSection(section: RectangularSection, L: number): THREE.ExtrudeGeometry {
    const shape = new THREE.Shape();
    const { width, height } = section;

    // Half-dimensions
    const W = width / 2;
    const H = height / 2;

    // Create rectangular shape
    shape.moveTo(-W, -H);
    shape.lineTo(W, -H);
    shape.lineTo(W, H);
    shape.lineTo(-W, H);
    shape.lineTo(-W, -H); // close the shape

    // Extrude along z (Three.js default). We'll scale to meters later.
    const geom = new THREE.ExtrudeGeometry(shape, { depth: L * 1E3, bevelEnabled: false });

    // Put centroid at origin: shift by -L/2 in Z
    geom.translate(0, 0, -L * 1E3 / 2);

    const mmToM = 0.001;
    geom.scale(mmToM, mmToM, mmToM);
    return geom;
  }

  addLabel() {
    if (!this.model || !this.model.visibility.memberLabels) return

    const delta = 0.1
    const iNode = this.nodes[0]
    const jNode = this.nodes[1]

    const xCenter = (iNode.x + jNode.x) / 2
    const yCenter = (iNode.y + jNode.y) / 2
    const zCenter = (iNode.z + jNode.z) / 2
    const labels: Label[] = [
      {
        id: `member-${this.id}`,
        position: new THREE.Vector3(xCenter, yCenter + delta, zCenter),
        text: this.label || '',
      }
    ]

    this.model.labeler.batchUpdateOrCreate(labels)
  }

}

export default ElasticBeamColumn