from pydantic import BaseModel, Field
from typing import Optional, List, Any
from enum import Enum


class Vector3(BaseModel):
  """Represents a 3D vector (equivalent to THREE.Vector3)"""
  x: float = 0.0
  y: float = 0.0
  z: float = 0.0

class Node(BaseModel):
  """Represents a structural node in 3D space"""
  id: Optional[int] = Field(None, description="Node ID (auto-generated if not provided)")
  name: Optional[str] = Field(None, description="Node name")
  x: float = Field(..., description="X coordinate")
  y: float = Field(..., description="Y coordinate")
  z: float = Field(..., description="Z coordinate")

class Member(BaseModel):
  """Represents a structural member (beam, column, etc.)"""
  id: int = Field(..., description="Member ID")
  label: Optional[str] = Field(None, description="Member label")
  nodei: int = Field(..., description="ID of the start node")
  nodej: int = Field(..., description="ID of the end node")
  section: Optional[int] = Field(None, description="ID of the section")
  vecxz: Optional[List[float]] = Field(None, description="Local x-z vector")

class Material(BaseModel):
  """Represents material properties"""
  id: int = Field(..., description="Material ID")
  name: str = Field(..., description="Material name")
  E: float = Field(..., description="Young's modulus (MPa)")
  nu: float = Field(..., description="Poisson's ratio")

class SupportType(str, Enum):
  """Enumeration of support types for boundary conditions"""
  FIXED = "fixed"
  PINNED = "pinned"
  ROLLER = "roller"
  FREE = "free"

class BoundaryCondition(BaseModel):
  """Represents a boundary condition (support) applied to one or more nodes"""
  id: int = Field(..., description="Boundary condition ID")
  targets: List[int] = Field(..., description="List of node IDs where the boundary condition is applied (use actual node IDs from get_scene_info)")
  type: SupportType = Field(..., description="Type of support: fixed, pinned, roller, or free")
  dx: int = Field(1, ge=0, le=1, description="Restrain translation in X direction (0=free, 1=fixed)")
  dy: int = Field(1, ge=0, le=1, description="Restrain translation in Y direction (0=free, 1=fixed)")
  dz: int = Field(1, ge=0, le=1, description="Restrain translation in Z direction (0=free, 1=fixed)")
  rx: int = Field(0, ge=0, le=1, description="Restrain rotation around X axis (0=free, 1=fixed)")
  ry: int = Field(0, ge=0, le=1, description="Restrain rotation around Y axis (0=free, 1=fixed)")
  rz: int = Field(0, ge=0, le=1, description="Restrain rotation around Z axis (0=free, 1=fixed)")

class LinearLoad(BaseModel):
  id: int = Field(..., description="Load ID")
  targets: List[int] = Field(..., description="List of member IDs where the linear load is applied (use actual member IDs from get_scene_info)")
  type: str = Field(default="linear", description="Load type")
  value: Vector3 = Field(..., description="Load value vector (Fx, Fy, Fz) in kN")
  name: Optional[str] = Field(default=None, description="Load name")
  
class Model(BaseModel):
  """Output schema for structural model containing all structural elements"""
  nodes: Optional[List[Node]] = Field(None, description="List of nodes")
  members: Optional[List[Member]] = Field(None, description="List of members")
  materials: Optional[List[Material]] = Field(None, description="List of materials")
  sections: Optional[List[Any]] = Field(None, description="List of sections")
  loads: Optional[List[Any]] = Field(None, description="List of loads")
  boundary_conditions: Optional[List[BoundaryCondition]] = Field(None, description="List of boundary conditions")


class ClientResponse(BaseModel):
  """Basic response from WebSocket client operations"""
  id: str = Field(..., description="Message ID")
  message: str = Field(..., description="Response message")
  success: bool = Field(..., description="Whether the operation was successful")

