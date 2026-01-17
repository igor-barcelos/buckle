from ast import Continue, mod
from enum import auto
import os
os.environ['FOR_DISABLE_CONSOLE_CTRL_HANDLER'] = '1'

from pydantic import BaseModel
from typing import List
import math
import openseespy.opensees as ops
import uvicorn
from fastapi import FastAPI, HTTPException
import random
from .helpers import compute_section_properties
import numpy as np
import json
from .settings import *
# Export public API
__all__ = ['run_analysis']


mm = 1E-3
m = 1 

def print_model_for_inspection(model: dict):
    """Prints the full model data in a readable format for debugging."""
    print("\n" + "="*80)
    print("MODEL DATA FOR INSPECTION (DPBSV Error Debug)")
    print("="*80 + "\n")
    
    print("NODES:")
    print(json.dumps(model.get('nodes', []), indent=2, default=str))
    print("\n" + "-"*80 + "\n")
    
    print("MEMBERS:")
    print(json.dumps(model.get('members', []), indent=2, default=str))
    print("\n" + "-"*80 + "\n")
    
    print("MATERIALS:")
    print(json.dumps(model.get('materials', []), indent=2, default=str))
    print("\n" + "-"*80 + "\n")
    
    print("SECTIONS:")
    print(json.dumps(model.get('sections', []), indent=2, default=str))
    print("\n" + "-"*80 + "\n")
    
    print("BOUNDARY CONDITIONS:")
    print(json.dumps(model.get('boundary_conditions', []), indent=2, default=str))
    print("\n" + "-"*80 + "\n")
    
    print("LOADS:")
    print(json.dumps(model.get('loads', []), indent=2, default=str))
    print("\n" + "="*80 + "\n")

def run_analysis(model: dict):
  try:
    global output
    output = {}
    output = {}
    output['nodes'] = []
    output['members'] = []
    nodes = model['nodes']
    members = model['members']
    # materials = model['materials']
    sections = model['sections']
    loads = model['loads']
    boundary_conditions = model['boundary_conditions']
    
    # print("[ANALYSIS] Starting structural analysis...", model)
    
    # Initialize
    init()
    print(f"[ANALYSIS] ✓ Model initialized (3D, 6 DOF per node)")
    
    # Create nodes
    create_nodes(nodes)
    print(f"[ANALYSIS] ✓ Created {len(nodes)} nodes")

    # Create transformation for beam-column elements
    create_geometric_transformation(members)
    print(f"[ANALYSIS] ✓ Created geometric transformations for {len(members)} members")

    # Create sections 
    create_sections(sections)
    print(f"[ANALYSIS] ✓ Created {len(sections)} sections")
    
    # Create elements
    create_members(members)
    print(f"[ANALYSIS] ✓ Created elements (discretized members)")

    # Apply boundary conditions
    apply_boundary_conditions(boundary_conditions)
    print(f"[ANALYSIS] ✓ Applied boundary conditions to {len(boundary_conditions)} constraint(s)")
    
    # Apply loads
    apply_loads(loads)
    print(f"[ANALYSIS] ✓ Applied {len(loads)} load case(s)")
    
    # Run the analysis
    print("[ANALYSIS] Starting static analysis...")
    run_static_analysis(model)
    print("[ANALYSIS] ✓ Static analysis completed successfully")

    # Extract results
    extract_results()
    print("[ANALYSIS] ✓ Results extracted")
    # print('output: ', output)
    
    # Clean up
    ops.wipe()
    print("[ANALYSIS] ✓ Model cleaned up")
    
    return output

  except Exception as e:
      error_msg = str(e)
      # Check if this is a DPBSV error
      if "DPBSV" in error_msg or "illegal value" in error_msg.lower():
          print("\n!!! DPBSV ERROR DETECTED - Printing model for inspection !!!")
          print_model_for_inspection(model)
      print('ERROR: ', e)
      raise HTTPException(status_code=500, detail=str(e))

def init():
    """Initializes a new OpenSees 3D model."""
    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

def get_local_axis(nodei, nodej, vecxz=None):

    pi = np.array(ops.nodeCoord(nodei))
    pj = np.array(ops.nodeCoord(nodej))

    vecx = pj - pi
    
    length = np.linalg.norm(vecx)
    
    if length < 1e-10:
        raise ValueError("Member has zero length")

    vecx = vecx / length
    vecz = np.array(vecxz)
    vecy = np.cross(vecz, vecx)
    
    return [vecx, vecy, vecz]

def calculate_vecxz(member):
    """
    Calculate vecxz (local z-axis vector) for a member if not provided.
    Mirrors the _vecxz() logic from frontend ElasticBeamColumn.ts

    For horizontal members: vecz = [0, 0, 1] (global Z-axis)
    For vertical members: vecz = [1, 0, 0] (global X-axis)
    """
    if 'vecxz' in member and member['vecxz']:
        return member['vecxz']

    # Get node coordinates
    nodei = np.array([member['nodei']['x'], member['nodei']['y'], member['nodei']['z']])
    nodej = np.array([member['nodej']['x'], member['nodej']['y'], member['nodej']['z']])

    # Calculate local x-axis (along member)
    local_vecx = nodej - nodei
    local_vecx = local_vecx / np.linalg.norm(local_vecx)

    # Default up vector for horizontal members
    up = np.array([0, 1, 0])

    # Calculate cross product
    cross_vec = np.cross(up, local_vecx)
    cross_length = np.linalg.norm(cross_vec)

    # Determine local z-axis based on member orientation
    if cross_length < 1e-6:  # Vertical member
        vecz = np.array([1, 0, 0])
    else:  # Horizontal member
        vecz = np.array([0, 0, 1])

    return vecz.tolist()

def create_geometric_transformation(members):
    """Creates a linear geometric transformation for beam-column elements."""
    for member in members:
        vecxz = calculate_vecxz(member)
        ops.geomTransf("Linear", member['id'], *vecxz)

def create_sections(sections):
    """Creates a section for the beam-column elements."""
    for section in sections:
        properties = compute_section_properties(section)
        E = properties['E']
        A = properties['A']
        Iz = properties['Iz']
        Iy = properties['Iy']
        Jxx = properties['Jxx']
        G_mod  = properties['G_mod']
        ops.section('Elastic', section['id'], E, A, Iz, Iy, G_mod, Jxx)

def create_nodes(nodes):
  """Creates nodes in the OpenSees model and returns a set of node IDs."""
  node_ids = set()
  for node in nodes:
    ops.node(node['id'], node['x'], node['z'], node['y'])
    node_ids.add(node['id'])
    
    output['nodes'].append({
        'id': node['id'],
        'x': node['x'],
        'y': node['y'],
        'z': node['z']
    })
  
def get_release(release_type):
  if not release_type:
    return None, None
  if release_type == 'fixed-pinned':
    return None, {'rx': 0, 'ry': 0, 'rz': 0}
  elif release_type == 'pinned-fixed':
    return {'rx': 0, 'ry': 0, 'rz': 0}, None
  elif release_type == 'pinned-pinned':
    return {'rx': 0, 'ry': 0, 'rz': 0}, {'rx': 0, 'ry': 0, 'rz': 0}
  else:
    return None, None

def get_release_node(member, node_id, releases):
  
    nodei = member['nodei']['id']
    nodej = member['nodej']['id']
    vecxz = member.get('vecxz')
    
    local_matrix = get_local_axis(nodei, nodej, vecxz)
    vecx = local_matrix[0]  # Local x-axis (along member)
    vecy = local_matrix[1]  # Local y-axis
    vecz = local_matrix[2]  # Local z-axis
    
    i_node = node_id
    
    j_node = int(random.random() * 0x7FFFFFFF)
    coords = ops.nodeCoord(i_node)
    ops.node(j_node, coords[0], coords[1], coords[2])
    
    released_dofs = []
    constrained_dofs = []
    materials = []
    
    # Stiffness for released DOFs (very low)
    k_release = 1e-12
    
    # DOF mapping
    dof_mapping = {
      'fx': 1, 'fy': 2, 'fz': 3,  # Translations
      'rx': 4, 'ry': 5, 'rz': 6   # Rotations
    }
    
    # Check each DOF
    for dof_name, dof_number in dof_mapping.items():
      # Default to fixed (1) if not specified
      is_released = releases.get(dof_name, 1) == 0
      
      if is_released:
        released_dofs.append(dof_number)
        mat_id = int(random.random() * 0x7FFFFFFF)
        ops.uniaxialMaterial("Elastic", mat_id, k_release)
        materials.append(mat_id)
      else:
        constrained_dofs.append(dof_number)

    if released_dofs:
      zero_length_id = int(random.random() * 0x7FFFFFFF)
      
      ops.element("zeroLength", zero_length_id, i_node, j_node,
                  "-mat", *materials,
                  "-dir", *released_dofs,
                  "-orient", vecx[0], vecx[1], vecx[2], vecy[0], vecy[1], vecy[2])

      if constrained_dofs:
          ops.equalDOF(i_node, j_node, *constrained_dofs)
    
    return j_node

def create_members(members):
    
  """Creates elements by discretizing members into segments."""
  for member in members:
    # print('create_members member: ', member)
    parent_id = member['id'] 
    geoTransf_id = parent_id
    new_nodes, new_members, length = mesh_member(member)
    
    # Get release type and convert to DOF specifications
    release_type = member.get('release')
    releases_i, releases_j = get_release(release_type)
    
    original_start_node = member['nodei']['id']
    original_end_node = member['nodej']['id']
    
    release_start_node = None
    release_end_node = None
    
    if releases_i:
      release_start_node = get_release_node(member, original_start_node, releases_i)

    if releases_j:
      release_end_node = get_release_node(member, original_end_node, releases_j)

    for idx, new_member in enumerate(new_members):
      child_id = new_member['id']
      node_i = new_member['nodei']
      node_j = new_member['nodej']
      section_id = member['section']

      if idx == 0 and release_start_node:
        node_i = release_start_node

      if idx == len(new_members) - 1 and release_end_node:
        node_j = release_end_node

      ops.element("elasticBeamColumn", child_id, node_i, node_j, section_id , geoTransf_id)
      
    output['members'].append({
        'id': parent_id,
        'mesh': {
          'nodes': new_nodes,
          'members': new_members
        },
        'vecxz': member['vecxz'],
        'length' : length
    })  
     
def mesh_member(member):
    """Discretizes a member into segments and creates nodes and elements."""
    ni = member['nodei']
    nj = member['nodej']
    section_id = member['section']
    model_nodes_ids = [node['id'] for node in output['nodes']]

    # Ensure the input nodes exist in the model
    if ni['id'] not in model_nodes_ids or nj['id'] not in model_nodes_ids:
        raise HTTPException(status_code=400, detail=f"Member {member['id']} references undefined node(s).")
    
    # Compute the total length of the member
    L = math.sqrt((nj['x'] - ni['x'])**2 + (nj['y'] - ni['y'])**2 + (nj['z'] - ni['z'])**2)
    
    # Determine the number of segments
    num_segments = math.ceil(L / 0.5)
    
    # Generate the list of node IDs along the member
    new_nodes = [{
      'id': ni['id'],
      'x': ni['x'],
      'y': ni['z'],
      'z': ni['y']
    }]
      
    # Generate interior nodes via linear interpolation
    for i in range(1, num_segments):
        fraction = i / num_segments
        x_coord = ni['x'] + fraction * (nj['x'] - ni['x'])
        y_coord = ni['y'] + fraction * (nj['y'] - ni['y'])
        z_coord = ni['z'] + fraction * (nj['z'] - ni['z'])

        # print('x_coord: ', x_coord)
        # print('y_coord: ', y_coord)
        # print('z_coord: ', z_coord)

        node_id = int(random.random() * 0x7FFFFFFF)
        ops.node(node_id, x_coord, z_coord, y_coord)
        
        output['nodes'].append({
            'id': node_id,
            'x': x_coord, 
            'y': z_coord,
            'z': y_coord
        })
        
        new_nodes.append({
          'id': node_id,
          'x': x_coord,
          'y': z_coord,
          'z': y_coord
        })
    
    # Append the provided ending node
    new_nodes.append({
      'id': nj['id'],
      'x': nj['x'],
      'y': nj['z'],
      'z': nj['y']
    })
    
    # Create elements between consecutive nodes
    new_members = []
    number_of_members = len(new_nodes) - 1
    for k in range(number_of_members):
      member_id = int(random.random() * 0x7FFFFFFF)
      new_members.append({
          'id': member_id,
          'nodei': new_nodes[k]['id'],
          'nodej': new_nodes[k+1]['id'],
          'section': section_id
      })

    return new_nodes, new_members, L

def apply_boundary_conditions(boundary_conditions):
  """Applies boundary conditions to the model."""
  for (i, boundary_condition) in enumerate(boundary_conditions):
    targets = boundary_condition['targets']
    bdc_type = boundary_condition['type']
    dx = boundary_condition['dx']
    dy = boundary_condition['dy']
    dz = boundary_condition['dz']
    rx = boundary_condition['rx']
    ry = boundary_condition['ry']
    rz = boundary_condition['rz']
    for target in targets:
    
      j_coord = ops.nodeCoord(target)
      
      if(bdc_type == "elastic"):
        support_node = int(random.random() * 0x7FFFFFFF)
        ops.node(support_node, j_coord[0], j_coord[1], j_coord[2])
      
        kx = dx   # Spring stiffness in X direction
        ky = dy   # Spring stiffness in Y direction  
        kz = dz   # Spring stiffness in Z direction
        krx =  rx # Rotational spring stiffness about X
        kry =  ry # Rotational spring stiffness about Y
        krz =  rz # Rotational spring stiffness about Z
        
        # Create spring materials for each DOF
        mat_ids = []
        for dof_idx, stiffness in enumerate([kx, ky, kz, krx, kry, krz], start=1):
            mat_id = int(random.random() * 0x7FFFFFFF)
            ops.uniaxialMaterial("Elastic", mat_id, stiffness)
            mat_ids.append(mat_id)
        
        zero_length_id = int(random.random() * 0x7FFFFFFF)
        ops.element("zeroLength", zero_length_id, target, support_node, 
                    "-mat", *mat_ids,
                    "-dir", 1, 2, 3, 4, 5, 6)
        
        # Fix the support node (ground)
        ops.fix(support_node, 1, 1, 1, 1, 1, 1)
      else:      
        ops.fix(target, dx, dy, dz, rx, ry, rz)
      
def apply_loads(loads):
    """Applies loads to the model."""
    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)
    members = output['members']
    nodes = output['nodes']

    for load in loads:
      targets = load['targets']
      value = load['value']
      if(load['type'] == 'linear'):
        for id in targets:
          member = next((e for e in members if e['id'] == id), None)
          if member:
            mesh = member['mesh']
            nodes = mesh['nodes']
            length = member['length']

            number_of_nodes = len(nodes)
            for (j, node) in enumerate(nodes):
              node_id = node['id']
              distance_between_nodes = length / (number_of_nodes - 1)

              # Calculate load based on node position
              if j == 0 or j == number_of_nodes - 1:  # First or last node
                nDelta = distance_between_nodes / 2
              else:  # Interior nodes
                nDelta = distance_between_nodes
              # Apply load (note: coordinate swapping for y and z)
              fx = value['x'] * nDelta * 1E3
              fy = value['z'] * nDelta * 1E3
              fz = value['y'] * nDelta * 1E3
              ops.load(node_id, fx, fy, fz, 0.0, 0.0, 0.0)
      elif(load['type'] == 'nodal'):
        for id in targets:
          node = next((e for e in nodes if e['id'] == id), None)
          if node:
            fx = value['x'] * 1E3
            fy = value['z'] * 1E3
            fz = value['y'] * 1E3
            ops.load(id, fx, fy, fz, 0.0, 0.0, 0.0)

def run_static_analysis(model: dict = None):
    """Sets up and runs the static analysis."""
    try:
        ops.system("BandSPD")
        ops.numberer("RCM")
        ops.constraints("Plain")
        
        # Apply load in multiple steps instead of one
        num_steps = 10
        load_step = 1.0 / num_steps
        
        # Set integrator before creating analysis
        ops.integrator("LoadControl", load_step)
        
        # Set convergence test with slightly relaxed tolerance
        ops.test("NormUnbalance", 1.0e-5, 50)
        
        ops.algorithm("Newton")
        ops.analysis("Static")
        
        # Perform the analysis in incremental steps
        ok = ops.analyze(num_steps)
        
        if ok != 0:
            print(f"Analysis failed with error code: {ok}")
            raise Exception(f"Analysis failed to converge")
        
        return 0
    except Exception as e:
        error_msg = str(e)
        # Check if this is a DPBSV error
        if "DPBSV" in error_msg or "illegal value" in error_msg.lower():
            print("\n!!! DPBSV ERROR DETECTED IN run_static_analysis - Printing model for inspection !!!")
            if model:
                print_model_for_inspection(model)
        raise

def extract_node_displacements():
  """Extracts displacement data for all nodes."""
  nodes = output['nodes']

  for node in nodes:
    node_id = node['id']
    try:
      disp = ops.nodeDisp(node_id) 
      node['displacements'] = {
        'ux': round(disp[0], 5),  
        'uy': round(disp[1], 5),    
        'uz': round(disp[2], 5),  
        'rx': round(disp[3], 5),  
        'ry': round(disp[4], 5),  
        'rz': round(disp[5], 5),
      }

      
    except Exception as e:
      print(f"Warning: Could not extract displacement for node {node_id}: {e}")

def extract_results():
  """Extracts and processes results from the analysis."""
  members = output['members']
  
  extract_node_displacements()

  for member in members:
    mesh = member['mesh']
    nodes = mesh['nodes']
    child_members = mesh['members']
    node_efforts_dict = {}

    forces = ['N', 'Vy', 'Vz', 'T', 'My', 'Mz']
    for child_member in child_members:
      child_id = child_member['id']
      
      try:
        ele_node_tags = ops.eleNodes(child_id)
        if not ele_node_tags or len(ele_node_tags) < 2:
          print(f"Warning: Element {child_id} has invalid node tags: {ele_node_tags}")
          continue
          
        node_i = ele_node_tags[0]
        node_j = ele_node_tags[1]

        node_i_coord = ops.nodeCoord(node_i)
        node_j_coord = ops.nodeCoord(node_j)
      except Exception as e:
        print(f"Warning: Failed to get nodes/coordinates for element {child_id}: {e}")
        continue

      # Initialize node efforts dictionaries if they don't exist
      if node_i not in node_efforts_dict:
          node_efforts_dict[node_i] = {
              "node": node_i,
              "efforts": {},
              "coord": node_i_coord,
          }
      
      if node_j not in node_efforts_dict:
          node_efforts_dict[node_j] = {
              "node": node_j,
              "efforts": {},
              "coord": node_j_coord,
          }

      # Process each force type
      for force in forces:
        try:
          data = extract_section_force_data(child_id, force, sfac=1E-5, nep=2, dir_plt=0)
          force_values = data['force_values']
          displaced_positions = data['displaced_positions']
          
          # Determine unit based on force type
          if force in ['N']:
            unit = "kN"
          elif force in ['Vy', 'Vz']:
            unit = "kN"
          elif force in ['T']:
            unit = "kNm"
          elif force in ['My', 'Mz']:
            unit = "kNm"
          else:
            unit = "kN"

          # Process node i
          if force not in node_efforts_dict[node_i]["efforts"]:
              node_efforts_dict[node_i]["efforts"][force] = {
                "value": np.round(force_values[0], 2),
                "unit": unit,
                "displaced_positions": displaced_positions[0]
              }
          else:
            # Average with existing value
            current_value = node_efforts_dict[node_i]["efforts"][force]["value"]
            mean_value = (current_value + force_values[0]) / 2
            node_efforts_dict[node_i]["efforts"][force]["value"] = np.round(mean_value, 2)
          
          # Process node j
          if force not in node_efforts_dict[node_j]["efforts"]:
            node_efforts_dict[node_j]["efforts"][force] = {
              "value": np.round(force_values[1], 2),
              "unit": unit,
              "displaced_positions": displaced_positions[1]
            }
          else:
            # Average with existing value
            current_value = node_efforts_dict[node_j]["efforts"][force]["value"]
            mean_value = (current_value + force_values[1]) / 2
            node_efforts_dict[node_j]["efforts"][force]["value"] = np.round(mean_value, 2)
            
        except Exception as e:
          print(f"Warning: Could not extract {force} data for element {child_id}: {e}")
          continue
    
    member['node_efforts'] = list(node_efforts_dict.values())
    # member['plot_2d'] = plot_2d(member, forces)

  
def plot_2d(member, forces_to_plot=None):
  vecz = np.array([0, 0, 1])
  scale = 1
  mesh = member['mesh']
  nodes = mesh['nodes']
  number_of_nodes = len(nodes)
  node_efforts = member['node_efforts']
  output_plot = {}
  output_plot['efforts'] = {}

  nodei = np.array([nodes[0]['x'], nodes[0]['y'], nodes[0]['z']])
  nodej = np.array([nodes[-1]['x'], nodes[-1]['y'], nodes[-1]['z']])
  local_origin = nodei.copy()

  member_vector = nodej - nodei
  member_length = np.linalg.norm(member_vector)
  vec_x = member_vector / member_length

  angle_rad = np.arccos(np.clip(np.dot(vec_x, vecz), -1.0, 1.0))
  angle_deg = np.degrees(angle_rad)


  s_0 = []
  for node in node_efforts:
      coord = np.array(node['coord'])
      r_vec = coord - local_origin
      r = np.linalg.norm(r_vec)

      x2d = np.round(r * np.cos(np.pi / 2 - angle_rad), 3)
      y2d = np.abs(np.round(r * np.sin(np.pi / 2 - angle_rad), 3))
      s_0.append({'x': x2d, 'y': y2d , 'label' : f'x:{x2d} y:{y2d}'})

  nodei_2d = np.array([s_0[0]['x'], s_0[0]['y']])
  nodej_2d = np.array([s_0[-1]['x'], s_0[-1]['y']])
  vec_2d = (nodej_2d - nodei_2d) / member_length
  norm_vec = np.array([-vec_2d[1], vec_2d[0]])
  output_plot["s_0"] = s_0

  for i, node in enumerate(s_0):
      efforts = node_efforts[i]['efforts']
      coords = [node['x'], node['y']]
      for type, effort in efforts.items():
        value = effort['value']
        unit = effort['unit']
        offset_vector = -norm_vec * value * scale
        point = np.array(coords) + offset_vector
        if type not in output_plot['efforts']:
            output_plot['efforts'][type] = []
        output_plot['efforts'][type].append(
          {
            'x': point[0],
            'y': point[1],
            'label': f'{value} {unit}'
          }
        )

  return output_plot


def section_force_distribution_3d(ecrd, pl, nep=2,
                                  ele_load_data=[['-beamUniform', 0., 0., 0.]]):
    """
    Calculate section forces (N, Vy, Vz, T, My, Mz) for an elastic 3d beam.

    Longer description

    Parameters
    ----------

    ecrd : ndarray
        x, y, z element coordinates
    pl : ndarray
    nep : int
        number of evaluation points, by default (2) at element ends

    ele_load_list : list
        list of transverse and longitudinal element load
        syntax: [ele_load_type, Wy, Wz, Wx]
        For now only '-beamUniform' element load type is acceptable.

    Returns
    -------

    s : ndarray
        [N Vx Vy T My Mz]; shape: (nep,6)
        column vectors of section forces along local x-axis

    uvwfi : ndarray
        [u v w fi]; shape (nep,4)
        displacements at nep points along local x

    xl : ndarray
        coordinates of local x-axis; shape (nep,)

    nep : int
        number of evaluation points, by default (2) at element ends
        If the element load is between the points then nep is increased by 1 or 2

    Notes
    -----

    Todo: add '-beamPoint' element load type

    """
    Lxyz = ecrd[1, :] - ecrd[0, :]
    L = np.sqrt(Lxyz @ Lxyz)

    nlf = len(pl)
    xl = np.linspace(0., L, nep)

    for ele_load_data_i in ele_load_data:
        ele_load_type = ele_load_data_i[0]

        if nlf == 1:
            N1 = pl[0]
        elif nlf == 12:
            N1, Vy1, Vz1, T1, My1, Mz1 = pl[:6]
        else:
            print('\nWarning! Not supported. Number of nodal forces: {nlf}')

        if ele_load_type == '-beamUniform':
            n_ele_load_data = len(ele_load_data_i)

            if n_ele_load_data == 4:
                pass

        elif ele_load_type == '-beamPoint':
            Py, Pz, aL, Px = ele_load_data_i[1:5]
            a = aL * L

            if a in xl:
                xl = np.insert(xl, xl.searchsorted(a+0.001), a+0.001)
                nep += 1

            else:
                xl = np.insert(xl, xl.searchsorted(a), a)
                xl = np.insert(xl, xl.searchsorted(a+0.001), a+0.001)
                nep += 2

    one = np.ones(nep)

    N = -1. * (N1 * one)

    if nlf == 12:
        Vy = Vy1 * one
        Vz = Vz1 * one
        T = -T1 * one
        Mz = -Mz1 * one + Vy1 * xl
        My = -My1 * one - Vz1 * xl

        s = np.column_stack((N, Vy, Vz, T, My, Mz))

    elif nlf == 1:
        s = np.column_stack((N))

    for ele_load_data_i in ele_load_data:
        ele_load_type = ele_load_data_i[0]

        if ele_load_type == '-beamUniform':
            n_ele_load_data = len(ele_load_data_i)

            if n_ele_load_data == 4:
                Wy, Wz, Wx = ele_load_data_i[1:4]

                N = -1. * (Wx * xl)

                if nlf == 12:
                    Vy = Wy * xl
                    Vz = Wz * xl
                    T = np.zeros_like(one)
                    Mz = 0.5 * Wy * xl**2
                    My = -0.5 * Wz * xl**2

                    s += np.column_stack((N, Vy, Vz, T, My, Mz))

                elif nlf == 1:
                    s += np.column_stack((N))

        elif ele_load_type == '-beamPoint':
            Py, Pz, aL, Px = ele_load_data_i[1:5]
            a = aL * L

            indx = 0
            for x in np.nditer(xl):
                if x <= a:
                    pass
                elif x > a:
                    s[indx, 0] += -1. * Px
                    s[indx, 1] += Py
                    s[indx, 2] += Pz
                    s[indx, 4] += - Pz * (x - a)
                    s[indx, 5] += Py * (x - a)

                indx += 1

    return s, xl, nep


def section_force_distribution_2d(ecrd, pl, nep=2,
                                  ele_load_data=[['-beamUniform', 0., 0.]]):
    """
    Calculate section forces (N, V, M) for an elastic 2D Euler-Bernoulli beam.

    Input:
    ecrd - x, y element coordinates in global system
    nep - number of evaluation points, by default (2) at element ends
    ele_load_list - list of transverse and longitudinal element load
      syntax: [ele_load_type, Wy, Wx]
      For now only '-beamUniform' element load type is acceptable

    Output:
    s = [N V M]; shape: (nep,3)
        section forces at nep points along local x
    xl: coordinates of local x-axis; shape: (nep,)

    Use it with dia_sf to draw N, V, M diagrams.

    nep : int
        number of evaluation points, by default (2) at element ends
        If the element load is between the points then nep is increased by 1 or 2

    TODO: add '-beamPoint' element load type
    """


    Lxy = ecrd[1, :] - ecrd[0, :]
    L = np.sqrt(Lxy @ Lxy)

    nlf = len(pl)
    print('NFL', nlf)
    xl = np.linspace(0., L, nep)

    for ele_load_data_i in ele_load_data:
        ele_load_type = ele_load_data_i[0]

        if nlf == 1:  # trusses
            N_1 = pl[0]
        elif nlf == 6:  # plane frames
            # N_1, V_1, M_1 = pl[0], pl[1], pl[2]
            N_1, V_1, M_1 = pl[:3]
        else:
            print('\nWarning! Not supported. Number of nodal forces: {nlf}')

        if ele_load_type == '-beamUniform':
            # raise ValueError
            # raise NameError

            n_ele_load_data = len(ele_load_data_i)

            if n_ele_load_data == 3:
                # eload_type, Wy, Wx = ele_load_data[0], ele_load_data[1], ele_load_data[2]
                Wy, Wx = ele_load_data_i[1], ele_load_data_i[2]

            elif n_ele_load_data == 7:
                wta, waa, aL, bL, wtb, wab = ele_load_data_i[1:7]
                a, b = aL*L, bL*L

                bma = b - a

                if a in xl:
                    pass
                else:
                    xl = np.insert(xl, xl.searchsorted(a), a)
                    nep += 1
                if b in xl:
                    pass
                else:
                    xl = np.insert(xl, xl.searchsorted(b), b)
                    nep += 1

        elif ele_load_type == '-beamPoint':
            Pt, aL, Pa = ele_load_data_i[1:4]
            a = aL * L

            if a in xl:
                # idx = xl.searchsorted(a)
                # np.concatenate((xl[:idx], [a], xl[idx:]))
                xl = np.insert(xl, xl.searchsorted(a+0.001), a+0.001)
                nep += 1

            else:
                # idx = xl.searchsorted(a)
                # xl = np.concatenate((xl[:idx], [a], xl[idx:]))
                # idx = xl.searchsorted(a+0.001)
                # xl = np.concatenate((xl[:idx], [a+0.001], xl[idx:]))
                xl = np.insert(xl, xl.searchsorted(a), a)
                xl = np.insert(xl, xl.searchsorted(a+0.001), a+0.001)
                nep += 2

    # xl is modified on the fly
    one = np.ones(nep)

    N = -1. * N_1 * one

    if nlf == 6:
        # s = np.zeros((nep, 3))
        V = V_1 * one
        M = -M_1 * one + V_1 * xl
        s = np.column_stack((N, V, M))

    elif nlf == 1:
        # s = np.zeros((nep, 1))
        s = np.column_stack((N))

    for ele_load_data_i in ele_load_data:
        ele_load_type = ele_load_data_i[0]

        if ele_load_type == '-beamUniform':
            # raise ValueError
            # raise NameError

            n_ele_load_data = len(ele_load_data_i)

            if n_ele_load_data == 3:
                # eload_type, Wy, Wx = ele_load_data[0], ele_load_data[1], ele_load_data[2]
                Wy, Wx = ele_load_data_i[1], ele_load_data_i[2]

                N = -1.*(Wx * xl)

                if nlf == 6:
                    V = Wy * xl
                    M = 0.5 * Wy * xl**2
                    s += np.column_stack((N, V, M))
                elif nlf == 1:
                    s += np.column_stack((N))

            elif n_ele_load_data == 7:
                wta, waa, aL, bL, wtb, wab = ele_load_data_i[1:7]
                a, b = aL*L, bL*L

                bma = b - a

                indx = 0
                for x in np.nditer(xl):
                    xma = x - a
                    wtx = wta + (wtb - wta) * xma / bma
                    xc = xma * (wtx + 2*wta) / (3 * (wta + wtx))

                    Ax = 0.5 * (wtx+wta) * xma
                    Axxc = Ax * xc

                    if x < a:
                        pass
                    elif x >= a and x <= b:
                        s[indx, 0] += -1.*((wab - waa) * x)
                        s[indx, 1] += Ax
                        s[indx, 2] += Axxc

                    elif x > b:
                        xmb = x - b
                        xc = bma * (wtb + 2 * wta) / (3 * (wta + wtb)) + xmb
                        Ab = 0.5 * (wtb + wta) * bma
                        Abxc = Ab * xc

                        s[indx, 0] += -1. * ((wab - waa) * x)
                        s[indx, 1] += Ab
                        s[indx, 2] += Abxc

                    indx += 1

                if aL == 0 and bL == 0:
                    N = -1.*(N_1 * one + wta * xl)
                    V = V_1 * one + wta * xl
                else:
                    N = 0

        elif ele_load_type == '-beamPoint':
            Pt, aL, Pa = ele_load_data_i[1:4]
            a = aL * L

            indx = 0
            for x in np.nditer(xl):
                if x <= a:
                    pass
                    # s[indx, 0] += -1. * N_1
                    # s[indx, 1] += V_1
                    # s[indx, 2] += -M_1 + V_1 * x
                elif x > a:
                    s[indx, 0] += -1. * (Pa)
                    s[indx, 1] += Pt
                    s[indx, 2] += Pt * (x-a)

                indx += 1

    # if eload_type == '-beamUniform':
    # else:

    return s, xl, nep

def extract_section_force_data(ele_tag, sf_type, sfac=1/500, nep=2, dir_plt=0,):
    # https://portwooddigital.com/2022/11/04/simple-loads-on-a-cantilever/
    
    # Retrieve element tags from the analysis
    # ele_tags = ops.getEleTags()
    force_data = {}

    # for ele_tag in ele_tags:
        # Get node coordinates for the element
    try:
        ele_node_tags = ops.eleNodes(ele_tag)
        if not ele_node_tags or len(ele_node_tags) < 2:
            raise ValueError(f"Element {ele_tag} has invalid node tags: {ele_node_tags}")
        ecrd = np.array([ops.nodeCoord(tag) for tag in ele_node_tags])
    except Exception as e:
        raise Exception(f"Failed to get nodes/coordinates for element {ele_tag}: {e}")
    
    # Compute local coordinate system (xlocal, ylocal, zlocal)
    try:
        xloc = ops.eleResponse(ele_tag, 'xlocal')
        yloc = ops.eleResponse(ele_tag, 'ylocal')
        zloc = ops.eleResponse(ele_tag, 'zlocal')
        g = np.vstack((xloc, yloc, zloc))
    except Exception as e:
        raise Exception(f"Failed to get local coordinate system for element {ele_tag}: {e}")
    
    # If needed, adjust for offsets:
    try:
        ele_offsets = np.array(ops.eleResponse(ele_tag, 'offsets'))
        if np.any(ele_offsets):
            ecrd[:, 0] += ele_offsets[[0, 3]]
            ecrd[:, 1] += ele_offsets[[1, 4]]
            ecrd[:, 2] += ele_offsets[[2, 5]]
    except Exception as e:
        # Offsets are optional, continue if they fail
        pass
    
    # Get section force distribution data:
    try:
        pl = ops.eleResponse(ele_tag, 'localForces')
    except Exception as e:
        raise Exception(f"Failed to get local forces for element {ele_tag}: {e}")

    s_all, xl, nep = section_force_distribution_3d(ecrd, pl, nep, [['-beamUniform', 0., 0., 0.]])
  
    if sf_type == 'N':
        ss = s_all[:, 0]
        default_dir = 1
    elif sf_type == 'Vy':
        ss = s_all[:, 1]
        default_dir = 1
    elif sf_type == 'Vz':
        ss = s_all[:, 2]
        default_dir = 2
    elif sf_type == 'T':
        ss = s_all[:, 3]
        default_dir = 1
    elif sf_type == 'My':
        ss = s_all[:, 4]
        default_dir = 2
    elif sf_type == 'Mz':
        ss = s_all[:, 5]
        default_dir = 1
    else:
        raise ValueError("Invalid section force type.")
    
    if dir_plt == 0:
        dir_plt = default_dir

    # Compute the base positions s_0 along the beam in global coordinates
    s_0 = np.zeros((nep, 3))
    s_0[0, :] = ecrd[0, :]
    s_0[1:, 0] = s_0[0, 0] + xl[1:] * g[0, 0]
    s_0[1:, 1] = s_0[0, 1] + xl[1:] * g[0, 1]
    s_0[1:, 2] = s_0[0, 2] + xl[1:] * g[0, 2]
    
    # print('s_0: ', s_0)
    # Scale the force values
    # print('SS: ', ss)
    s_scaled = ss * sfac

    if sf_type == 'Mz':  # Adjust sign if necessary
        s_scaled *= -1
    
    # Compute the displaced positions s_p (offset by the scaled force in the chosen direction)
    s_p = np.copy(s_0)
    s_p[:, 0] += s_scaled * g[dir_plt, 0]
    s_p[:, 1] += s_scaled * g[dir_plt, 1]
    s_p[:, 2] += s_scaled * g[dir_plt, 2]
    
    # Determine min and max force values
    minVal = np.amin(ss)
    maxVal = np.amax(ss)
    # print('s_p: ', s_p)
    # Save the data for the current element
    force_data = {
        # "base_positions": s_0,
        "displaced_positions": s_p.tolist(),
        # "evaluation_points": xl,
        "force_values": (ss / 1E3).tolist(),
        # "min_value": minVal,
        # "max_value": maxVal
    }
      
    return force_data
