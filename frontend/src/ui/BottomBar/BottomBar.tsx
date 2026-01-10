// import { useState } from 'react';
// import { Box, IconButton, Divider, Tooltip } from '@mui/material';
// import {
//   Create,
//   KeyboardArrowDown,
//   ThreeDRotation,
//   Settings as SettingsIcon,
//   Analytics,
//   Upload as UploadIcon,
//   Download as DownloadIcon,
//   PlayArrow
// } from '@mui/icons-material';
// import { observer } from 'mobx-react-lite';
// import { useModel } from '../../model/Context';
// import axios from 'axios';
// import Node from '../../model/Elements/Node/Node';
// import ElasticBeamColumnClass from '../../model/Elements/ElasticBeamColumn/ElasticBeamColumn';
// import BoundaryCondition from '../../model/BoundaryCondition/BoundaryCondition';
// import Load from '../../model/Load/Load';
// import * as THREE from 'three';
// import Results from './Components/Results';
// import Settings from './Components/Settings';
// import CreateMember from './Components/CreateMember'
// import { toast } from 'react-toastify';
// const { VITE_OPENSEES_SERVER, VITE_BACKEND_SERVER } = import.meta.env;

// interface BottomBarProps {
//   loading?: boolean;
//   setLoading?: (loading: boolean) => void;
// }

// const BottomBar = observer(({ setLoading }: BottomBarProps) => {
//   const model = useModel();
//   const [openSettings, setOpenSettings] = useState(false);
//   const [openResults, setOpenResults] = useState(false);
//   const [openDraw, setOpenDrawn] = useState(false)

//   const runAnalysis = async () => {
//     try {
//       if (setLoading) setLoading(true);
//       model.postProcessing.dispose();
      
//       const nodes = model.nodes.map(node => ({
//         id: node.id,
//         x: node.x,
//         y: node.y,
//         z: node.z
//       }));

//       const members = model.members.map(member => ({
//         id: member.id,
//         name: member.label,
//         nodei: { id: member.nodes[0].id, x: member.nodes[0].x, y: member.nodes[0].y, z: member.nodes[0].z },
//         nodej: { id: member.nodes[1].id, x: member.nodes[1].x, y: member.nodes[1].y, z: member.nodes[1].z },
//         section: member.section.id,
//         vecxz: [member.vecxz.x, member.vecxz.y, member.vecxz.z]
//       }));

//       const sections = model.sections;

//       const loads = model.loads.map(load => {
//         const { id, type, targets, name, value, direction } = load;
//         return { id, type, targets, name, value, direction };
//       });

//       const boundaryConditions = model.boundaryConditions.map(boundaryCondition => {
//         const { id, type, targets, name, dx, dy, dz, rx, ry, rz } = boundaryCondition;
//         return { id, type, targets, name, dx, dy, dz, rx, ry, rz };
//       });

//       const materials = model.materials;
//       const data = {
//         nodes,
//         members,
//         materials,
//         sections,
//         loads,
//         boundary_conditions: boundaryConditions,
//       };
      
//       const res = await axios.post(`${VITE_BACKEND_SERVER}/analysis`, data);
//       console.log('RES', res);
//       model.output = res.data.output;
//       if (setLoading) setLoading(false);
      
//       // Show success toast
//       toast.success('Analysis completed successfully!', {
//         position: "bottom-right",
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//     } catch (error) {
//       if (setLoading) setLoading(false);
//       console.error('Analysis error:', error);
      
//       // Show error toast
//       const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
//         ? error.response.data.message 
//         : 'Analysis failed. Please check your model and try again.';
      
//       toast.error(errorMessage, {
//         position: "bottom-right",
//         autoClose: 4000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//       });
//     }
//   };

//   const download = () => {
//     const nodes = model.nodes.map(node => ({
//       id: node.id,
//       x: node.x,
//       y: node.y,
//       z: node.z,
//       name: node.name
//     }));

//     const members = model.members.map(member => ({
//       id: member.id,
//       label: member.label,
//       nodei: { id: member.nodes[0].id, x: member.nodes[0].x, y: member.nodes[0].y, z: member.nodes[0].z },
//       nodej: { id: member.nodes[1].id, x: member.nodes[1].x, y: member.nodes[1].y, z: member.nodes[1].z },
//       section: member.section.id,
//       vecxz: [member.vecxz.x, member.vecxz.y, member.vecxz.z]
//     }));

//     const sections = model.sections;

//     const loads = model.loads.map(load => {
//       const { id, type, targets, name, value, direction } = load;
//       return { id, type, targets, name, value, direction };
//     });

//     const boundaryConditions = model.boundaryConditions.map(boundaryCondition => {
//       const { id, type, targets, name, dx, dy, dz, rx, ry, rz } = boundaryCondition;
//       return { id, type, targets, name, dx, dy, dz, rx, ry, rz };
//     });

//     const materials = model.materials;
    
//     const modelData = {
//       nodes,
//       members,
//       materials,
//       sections,
//       loads,
//       boundary_conditions: boundaryConditions,
//       metadata: {
//         exportDate: new Date().toISOString(),
//         modelName: 'FEM Model',
//         version: '1.0'
//       }
//     };

//     const dataStr = JSON.stringify(modelData, null, 2);
//     const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
//     const url = URL.createObjectURL(dataBlob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = `fem-model-${new Date().toISOString().split('T')[0]}.json`;
    
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     URL.revokeObjectURL(url);
    
//     console.log('Model downloaded successfully');
//   };

//   const upload = () => {
//     const fileInput = document.createElement('input');
//     fileInput.type = 'file';
//     fileInput.accept = '.json';
//     fileInput.style.display = 'none';
    
//     fileInput.onchange = (event) => {
//       const file = (event.target as HTMLInputElement).files?.[0];
//       if (!file) return;
      
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const jsonData = JSON.parse(e.target?.result as string);
//           buildOnJson(jsonData);
//         } catch (error) {
//           console.error('Error parsing JSON file:', error);
//           alert('Error: Invalid JSON file format');
//         }
//       };
//       reader.readAsText(file);
//     };
    
//     document.body.appendChild(fileInput);
//     fileInput.click();
//     document.body.removeChild(fileInput);
//   };

//   const buildOnJson = (jsonData: any) => {
//     try {
//       console.log('Loading model from JSON...', jsonData);
      
//       model.clear();
      
//       const nodeMap = new Map<number, Node>();
      
//       if (jsonData.nodes) {
//         jsonData.nodes.forEach((nodeData: any) => {
//           const node = new Node(
//             new THREE.Vector3(nodeData.x, nodeData.y, nodeData.z),
//             nodeData.name
//           );
//           node.id = nodeData.id;
//           node.model = model;
//           node.create();
//           model.nodes.push(node);
//           nodeMap.set(node.id, node);
//         });
//         console.log(`Created ${jsonData.nodes.length} nodes`);
//       }
      
//       if (jsonData.materials) {
//         model.materials = jsonData.materials;
//       }
//       if (jsonData.sections) {
//         model.sections = jsonData.sections;
//       }
      
//       if (jsonData.members) {
//         jsonData.members.forEach((memberData: any) => {
//           const nodei = nodeMap.get(memberData.nodei.id);
//           const nodej = nodeMap.get(memberData.nodej.id);
          
//           if (!nodei || !nodej) {
//             console.warn(`Could not find nodes for member ${memberData.id}`);
//             return;
//           }
          
//           const section = model.sections.find(s => s.id === memberData.section);
//           if (!section) {
//             console.warn(`Could not find section ${memberData.section} for member ${memberData.id}`);
//             return;
//           }
          
//           const vecxz = new THREE.Vector3(
//             memberData.vecxz[0],
//             memberData.vecxz[1],
//             memberData.vecxz[2]
//           );
          
//           const member = new ElasticBeamColumnClass(
//             model,
//             memberData.label || `Member ${memberData.id}`,
//             [nodei, nodej],
//             section,
//           );
//           member.id = memberData.id;
//           member.create();
//           model.members.push(member);
//         });
//         console.log(`Created ${jsonData.members.length} members`);
//       }
      
//       if (jsonData.boundary_conditions) {
//         jsonData.boundary_conditions.forEach((bcData: any) => {
//           const boundaryCondition = new BoundaryCondition(model, {
//             id: bcData.id,
//             type: bcData.type,
//             targets: bcData.targets,
//             name: bcData.name,
//             dx: bcData.dx,
//             dy: bcData.dy,
//             dz: bcData.dz,
//             rx: bcData.rx,
//             ry: bcData.ry,
//             rz: bcData.rz
//           } as any);
//           boundaryCondition.createOrUpdate();
//         });
//         console.log(`Created ${jsonData.boundary_conditions.length} boundary conditions`);
//       }
      
//       if (jsonData.loads) {
//         jsonData.loads.forEach((loadData: any) => {
//           const load = new Load(model, {
//             id: loadData.id,
//             type: loadData.type,
//             targets: loadData.targets,
//             name: loadData.name,
//             value: new THREE.Vector3(loadData.value.x, loadData.value.y, loadData.value.z),
//             direction: new THREE.Vector3(loadData.direction.x, loadData.direction.y, loadData.direction.z)
//           } as any);
//           load.createOrUpdate();
//         });
//         console.log(`Created ${jsonData.loads.length} loads`);
//       }
      
//       console.log('Model loaded successfully from JSON!');
//       alert('Model loaded successfully!');
      
//     } catch (error) {
//       console.error('Error loading model from JSON:', error);
//       alert('Error loading model: ' + error);
//     }
//   };

//   const handle3DView = () => {
//     model?.camera.handle3dView();
//     model?.gridHelper.toGround();
//   };


//   return (
//     <>
//     <Box
//       sx={{
//         position: 'absolute',
//         bottom: 20,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         zIndex: 1002,
//         display: 'flex',
//         gap: 2,
//         alignItems: 'center',
//       }}
//     >
//       <Box
//         sx={{
//           bgcolor: '#2c2c2c',
//           borderRadius: 2,
//           p: 1,
//           display: 'flex',
//           alignItems: 'center',
//           gap: 0.5,
//           boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
//         }}
//       >

//         {/* Pen tool */}
//         <Box sx={{ position: 'relative' }}>
//           <Tooltip title="Draw Tool" placement="top">
//             <IconButton
//               onClick={() => setOpenDrawn(true)}
//               sx={{
//                 color: 'white',
//                 width: 40,
//                 height: 40,
//                 borderRadius: 1.5,
//                 '&:hover': {
//                   bgcolor: '#3c3c3c'
//                 }
//               }}
//             >
//               <Create sx={{ fontSize: 20 }} />
//             </IconButton>
//           </Tooltip>
//           <KeyboardArrowDown
//             sx={{
//               position: 'absolute',
//               right: 2,
//               bottom: 2,
//               fontSize: 12,
//               color: 'white'
//             }}
//           />
//         </Box>

//         {/* 3D tool */}
//         <Tooltip title="3D View" placement="top">
//           <IconButton
//             onClick={handle3DView}
//             sx={{
//               color: 'white',
//               width: 40,
//               height: 40,
//               borderRadius: 1.5,
//               '&:hover': {
//                 bgcolor: '#3c3c3c'
//               }
//             }}
//           >
//             <ThreeDRotation sx={{ fontSize: 20 }} />
//           </IconButton>
//         </Tooltip>

//         {/* Divider */}
//         <Divider
//           orientation="vertical"
//           flexItem
//           sx={{
//             bgcolor: '#404040',
//             mx: 1,
//             height: 24,
//             alignSelf: 'center'
//           }}
//         />

//         {/* Settings tools */}
//         <Tooltip title="Settings" placement="top">
//           <IconButton
//             onClick={() => setOpenSettings(true)}
//             sx={{
//               color: 'white',
//               width: 40,
//               height: 40,
//               borderRadius: 1.5,
//               '&:hover': {
//                 bgcolor: '#3c3c3c'
//               }
//             }}
//           >
//             <SettingsIcon sx={{ fontSize: 20 }} />
//           </IconButton>
//         </Tooltip>

//         <Tooltip title="Results" placement="top">
//           <IconButton
//             onClick={() => setOpenResults(true)}
//             sx={{
//               color: 'white',
//               width: 40,
//               height: 40,
//               borderRadius: 1.5,
//               '&:hover': {
//                 bgcolor: '#3c3c3c'
//               }
//             }}
//           >
//             <Analytics sx={{ fontSize: 20 }} />
//           </IconButton>
//         </Tooltip>

//         <Tooltip title="Upload" placement="top">
//           <IconButton
//             onClick={upload}
//             sx={{
//               color: 'white',
//               width: 40,
//               height: 40,
//               borderRadius: 1.5,
//               '&:hover': {
//                 bgcolor: '#3c3c3c'
//               }
//             }}
//           >
//             <UploadIcon sx={{ fontSize: 20 }} />
//           </IconButton>
//         </Tooltip>

//         <Tooltip title="Download" placement="top">
//           <IconButton
//             onClick={download}
//             sx={{
//               color: 'white',
//               width: 40,
//               height: 40,
//               borderRadius: 1.5,
//               '&:hover': {
//                 bgcolor: '#3c3c3c'
//               }
//             }}
//           >
//             <DownloadIcon sx={{ fontSize: 20 }} />
//           </IconButton>
//         </Tooltip>
//       </Box>

//       {/* Play button - Separate box */}
//       <Box
//         sx={{
//           bgcolor: '#2c2c2c',
//           borderRadius: 2,
//           p: 1,
//           boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
//         }}
//       >
//         <Tooltip title="Run Analysis" placement="top">
//           <IconButton
//             onClick={runAnalysis}
//             sx={{
//               color: 'white',
//               width: 40,
//               height: 40,
//               borderRadius: 1.5,
//               '&:hover': {
//                 bgcolor: '#3c3c3c'
//               }
//             }}
//           >
//             <PlayArrow sx={{ fontSize: 20 }} />
//           </IconButton>
//         </Tooltip>
//       </Box>
//     </Box>

//     {/* Dialogs */}
//     <Results 
//       open={openResults}
//       onClose={() => setOpenResults(false)}
//     />

//     <Settings 
//       open={openSettings}
//       onClose={() => setOpenSettings(false)}
//     />

//     <CreateMember
//       open={openDraw}
//       onClose={() => setOpenDrawn(false)}
//       freeMode={true}
//     />
//     </>
//   );
// });

// export default BottomBar;


