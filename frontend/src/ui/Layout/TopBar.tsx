import { Box, Typography, IconButton, Tooltip, Divider, Button, Tabs, Tab, Grid } from '@mui/material';
import {
  Menu as MenuIcon,
  Save as SaveIcon,
  FolderOpen as OpenIcon,
  Help as HelpIcon,
  OpenWith as MoveIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import Settings from '../Settings/Settings';
import Results from '../Results/Results';
import Move from '../Model/Nodes/Components/Move/Move';
import Draw from '../Draw/Draw';
import Docs from '../Docs/Docs';
import AddOrEditSection from '../Model/Sections/AddOrEdit';
import AddOrEditLoad from '../Model/Loads';
import AddOrEditBoundaryCondition from '../Model/BoundaryConditions';
import AddOrEditMaterial from '../Model/Materials/AddOrEdit';
import { observer } from 'mobx-react-lite';
import { useModel } from '../../model/Context';
import axios from 'axios';
import Node from '../../model/Elements/Node/Node';
import ElasticBeamColumnClass from '../../model/Elements/ElasticBeamColumn/ElasticBeamColumn';
import BoundaryCondition from '../../model/BoundaryCondition/BoundaryCondition';
import Load from '../../model/Load/Load';
import * as THREE from 'three';
import { toast } from 'react-toastify';
import Copy from '../Model/Copy';
import { useActiveDialog } from './hooks';
const { VITE_BACKEND_SERVER } = import.meta.env;
const APP_VERSION = '0.0.2';

interface TopBarProps {
  onMenuClick?: () => void;
}

interface RibbonButtonProps {
  title: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactElement;
  disabled?: boolean;
  iconImage?: {
    src: string;
    alt: string;
    size?: number;
  };
}

const RibbonButton = ({ title, label, onClick, icon, iconImage, disabled }: RibbonButtonProps) => {
  return (
    <Tooltip title={title}>
      <Button
        variant="text"
        onClick={onClick}
        disabled = {disabled}
        sx={{
          minWidth: '50px',
          flexDirection: 'column',
          gap: 0.3,
          py: 0.5,
          px: 1,
          color: '#e0e0e0',
          textTransform: 'none',
          '&:hover': {
            bgcolor: '#3f3f3f',
          },
        }}
      >
        {iconImage ? (
          <Box
            component="img"
            src={iconImage.src}
            alt={iconImage.alt}
            sx={{
              width: iconImage.size || 18,
              height: iconImage.size || 18,
              objectFit: 'contain',
              filter: 'brightness(0) saturate(100%) invert(100%)',
            }}
          />
        ) : (
          <Box sx={{ color: '#ffffff' }}>
            {icon}
          </Box>
        )}
        <Typography sx={{ fontSize: '0.65rem' }}>{label}</Typography>
      </Button>
    </Tooltip>
  );
};

const TopBar = observer(({ onMenuClick }: TopBarProps) => {
  const model = useModel();
  const { open, close, dialogs } = useActiveDialog();
  const [tool, setTool] = useState('')
  const toolName = model?.toolsController.getCurrentToolName()
  
  const handleToolChange = (newTool: string) => {
    // Stop the current tool before switching
    const currentTool = model.toolsController.getCurrentTool();
    currentTool?.stop()
    setTool(newTool);
  };

  const runAnalysis = async () => {
    try {
      model.postProcessing.dispose();
      
      // Validate that required data is present
      if (!model.nodes || model.nodes.length === 0) {
        toast.error('Cannot run analysis: No nodes found. Please add at least one node.', {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      if (!model.members || model.members.length === 0) {
        toast.error('Cannot run analysis: No members found. Please add at least one member.', {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }

      if (!model.sections || model.sections.length === 0) {
        toast.error('Cannot run analysis: No sections found. Please add at least one section.', {
          position: "bottom-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      
      const nodes = model.nodes.map(node => ({
        id: node.id,
        x: node.x,
        y: node.y,
        z: node.z
      }));

      const members = model.members.map(member => ({
        id: member.id,
        name: member.label,
        nodei: { id: member.nodes[0].id, x: member.nodes[0].x, y: member.nodes[0].y, z: member.nodes[0].z },
        nodej: { id: member.nodes[1].id, x: member.nodes[1].x, y: member.nodes[1].y, z: member.nodes[1].z },
        section: member.section.id,
        vecxz: [member.vecxz.x, member.vecxz.y, member.vecxz.z],
        release : member.release
      }));

      const sections = model.sections;

      const loads = model.loads.map(load => ({
        id: load.id,
        type: load.type,
        targets: load.targets,
        name: load.name,
        value: {
          x: load.value.x,
          y: load.value.y,
          z: load.value.z
        }
      }));

      const boundaryConditions = model.boundaryConditions.map(boundaryCondition => {
        const { id, type, targets, name, dx, dy, dz, rx, ry, rz } = boundaryCondition;
        return { id, type, targets, name, dx, dy, dz, rx, ry, rz };
      });

      const materials = model.materials;
      const data = {
        nodes,
        members,
        materials,
        sections,
        loads,
        boundary_conditions: boundaryConditions,
      };
      
      const res = await axios.post(`${VITE_BACKEND_SERVER}/analysis`, data);
      console.log('RES', res);
      model.output = res.data.output;
      
      // Show success toast
      toast.success('Analysis completed successfully!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Show error toast
      const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
        ? error.response.data.message 
        : 'Analysis failed. Please check your model and try again.';
      
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const download = () => {
    const nodes = model.nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y,
      z: node.z,
      name: node.name
    }));

    const members = model.members.map(member => ({
      id: member.id,
      label: member.label,
      nodei: { id: member.nodes[0].id, x: member.nodes[0].x, y: member.nodes[0].y, z: member.nodes[0].z },
      nodej: { id: member.nodes[1].id, x: member.nodes[1].x, y: member.nodes[1].y, z: member.nodes[1].z },
      section: member.section.id,
      vecxz: [member.vecxz.x, member.vecxz.y, member.vecxz.z],
      release: member.release
    }));

    const sections = model.sections;

    const loads = model.loads.map(load => ({
      id: load.id,
      type: load.type,
      targets: load.targets,
      name: load.name,
      value: {
        x: load.value.x,
        y: load.value.y,
        z: load.value.z
      }
    }));

    const boundaryConditions = model.boundaryConditions.map(boundaryCondition => {
      const { id, type, targets, name, dx, dy, dz, rx, ry, rz } = boundaryCondition;
      return { id, type, targets, name, dx, dy, dz, rx, ry, rz };
    });

    const materials = model.materials;
    
    const modelData = {
      nodes,
      members,
      materials,
      sections,
      loads,
      boundary_conditions: boundaryConditions,
      metadata: {
        exportDate: new Date().toISOString(),
        modelName: 'FEM Model',
        version: '1.0'
      }
    };

    const dataStr = JSON.stringify(modelData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fem-model-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('Model downloaded successfully');
  };

  const upload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
            
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          buildOnJson(jsonData);
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Error: Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const buildOnJson = (jsonData: any) => {
    try {
      console.log('Loading model from JSON...', jsonData);
      
      model.clear();
      
      const nodeMap = new Map<number, Node>();
      
      if (jsonData.nodes) {
        jsonData.nodes.forEach((nodeData: any) => {
          const node = new Node(
            new THREE.Vector3(nodeData.x, nodeData.y, nodeData.z),
            nodeData.name
          );
          node.id = nodeData.id;
          node.model = model;
          node.create();
          model.nodes.push(node);
          nodeMap.set(node.id, node);
        });
        console.log(`Created ${jsonData.nodes.length} nodes`);
      }
      
      if (jsonData.materials) {
        model.materials = jsonData.materials;
      }
      if (jsonData.sections) {
        model.sections = jsonData.sections;
      }
      
      if (jsonData.members) {
        jsonData.members.forEach((memberData: any) => {
          const nodei = nodeMap.get(memberData.nodei.id);
          const nodej = nodeMap.get(memberData.nodej.id);
          
          if (!nodei || !nodej) {
            console.warn(`Could not find nodes for member ${memberData.id}`);
            return;
          }
          
          const section = model.sections.find(s => s.id === memberData.section);
          if (!section) {
            console.warn(`Could not find section ${memberData.section} for member ${memberData.id}`);
            return;
          }
          
          const vecxz = new THREE.Vector3(
            memberData.vecxz[0],
            memberData.vecxz[1],
            memberData.vecxz[2]
          );
          
          const member = new ElasticBeamColumnClass(
            model,
            memberData.label || `Member ${memberData.id}`,
            [nodei, nodej],
            section,
          );
          member.id = memberData.id;
          console.log('member id', memberData.id )
          member.create();
          model.members.push(member);
        });
        console.log(`Created ${jsonData.members.length} members`);
      }
      
      if (jsonData.boundary_conditions) {
        jsonData.boundary_conditions.forEach((bcData: any) => {
          const boundaryCondition = new BoundaryCondition(model, {
            id: bcData.id,
            type: bcData.type,
            targets: bcData.targets,
            name: bcData.name,
            dx: bcData.dx,
            dy: bcData.dy,
            dz: bcData.dz,
            rx: bcData.rx,
            ry: bcData.ry,
            rz: bcData.rz
          } as any);
          boundaryCondition.createOrUpdate();
        });
        console.log(`Created ${jsonData.boundary_conditions.length} boundary conditions`);
      }
      
      if (jsonData.loads) {
        jsonData.loads.forEach((loadData: any) => {
          // Handle both Vector3 object format and direct value format
          const value = loadData.value?.x !== undefined 
            ? new THREE.Vector3(loadData.value.x, loadData.value.y, loadData.value.z)
            : new THREE.Vector3(0, 0, 0);
          
          const load = new Load(model, {
            id: loadData.id,
            type: loadData.type,
            targets: loadData.targets,
            name: loadData.name,
            value: value
          } as any);
          load.createOrUpdate();
        });
        console.log(`Created ${jsonData.loads.length} loads`);
      }
      
      console.log('Model loaded successfully from JSON!');
      toast.success('Model loaded successfully!', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error loading model from JSON:', error);
      toast.error('Error loading model: ' + (error instanceof Error ? error.message : String(error)), {
        position: "bottom-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const modelButtons = [
    { title: 'Materials', label: 'Materials', iconImage: { src: '/construction.png', alt: 'Materials', size: 18 }, onClick: () => open('materials') },
    { title: 'Sections', label: 'Sections', iconImage: { src: '/sections.png', alt: 'Sections', size: 18 }, onClick: () => open('sections') },
    { title: 'Draw', label: 'Draw', iconImage: { src: '/pencil.png', alt: 'Draw', size: 18 }, onClick: () => open('draw') },
    // { title: 'Beam', label: 'Beam', iconImage: { src: '/beam.png', alt: 'Beam', size: 18 }, onClick: () => {} },
    // { title: 'Column', label: 'Column', iconImage: { src: '/column.png', alt: 'Column', size: 18 }, onClick: () => handleToolChange('column')},
    { title: 'Loads', label: 'Loads', iconImage: { src: '/loads.png', alt: 'Loads', size: 22 }, onClick: () => open('loads') },
    { title: 'Supports', label: 'Supports', iconImage: { src: '/supports.png', alt: 'Supports', size: 22 }, onClick: () => open('supports') },
    { title: 'Move', label: 'Move', icon: <MoveIcon sx={{ fontSize: 18 }} />, onClick: () => open('move') },
    // { title: 'Copy', label: 'Copy', iconImage: { src: '/copy.png', alt: 'Copy', size: 18 }, onClick: () => open('copy'), disabled : model?.selector.selected.length === 0 },
  ];

  const analysisButtons = [
    { title: 'Run Analysis', label: 'Run', iconImage: { src: '/run.png', alt: 'Run', size: 18 }, onClick: runAnalysis },
    { title: 'Results', label: 'Results', iconImage: { src: '/growth.png', alt: 'Results', size: 18 }, onClick: () => open('results') },
    { title: 'Settings', label: 'Settings', iconImage: { src: '/engrenage.png', alt: 'Settings', size: 18 }, onClick: () => open('settings') },
    // { title: 'Draw', label: 'Draw', iconImage: { src: '/pencil.png', alt: 'Draw', size: 18 }, onClick: () => open('draw') },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#2d2d2d',
        borderBottom: '2px solid #1e1e1e',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Ribbon Bar */}
      <Box
        sx={{
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop:"0.25rem",
          px: 3,
          gap: 3,
          mt:2
        }}
      >
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {/* Hamburger Menu */}
          <IconButton
            onClick={onMenuClick}
            size="small"
            sx={{
              color: '#e0e0e0',
              '&:hover': {
                bgcolor: '#3f3f3f',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 18 }} />
          </IconButton>
          
        {/* File Group */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#a0a0a0', fontWeight: 600, mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            File
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <RibbonButton
              title="Open"
              label="Open"
              onClick={upload}
              icon={<OpenIcon sx={{ fontSize: 18 }} />}
            />
            <RibbonButton
              title="Save"
              label="Save"
              onClick={download}
              icon={<SaveIcon sx={{ fontSize: 18 }} />}
            />
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: '#1e1e1e', my: 1 }} />

        {/* Model Group */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#a0a0a0', fontWeight: 600, mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Model
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {modelButtons.map((button, index) => (
              <RibbonButton
                key={index}
                title={button.title}
                label={button.label}
                onClick={button.onClick}
                icon={button.icon}
                iconImage={button.iconImage}
                // disabled={button.disabled}
              />
            ))}
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ bgcolor: '#1e1e1e', my: 1 }} />

        {/* Analysis Group */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          <Typography sx={{ fontSize: '0.6rem', color: '#a0a0a0', fontWeight: 600, mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Analysis
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {analysisButtons.map((button, index) => (
              <RibbonButton
                key={index}
                title={button.title}
                label={button.label}
                onClick={button.onClick}
                iconImage={button.iconImage}
              />
            ))}
          </Box>
        </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
            <Typography sx={{ fontSize: '0.6rem', color: '#666', fontWeight: 600, mb: 0.3, textTransform: 'uppercase', letterSpacing: '0.5px', visibility: 'hidden' }}>
              Help
            </Typography>
            <RibbonButton
              title="Docs"
              label="Docs"
              onClick={() => window.open('https://github.com/igor-barcelos/buckle', '_blank')}
              iconImage={{ src: '/github.png', alt: 'Docs', size: 18 }}
            />
          </Box>
        </Box>
      </Box>

      <Settings open={dialogs.settings} onClose={close} />
      <Results open={dialogs.results} onClose={close} />
      <Move open={dialogs.move} onClose={close} selectedNode={null} />
      <Draw open={dialogs.draw} onClose={close} freeMode={true} />
      <Docs open={dialogs.docs} onClose={close} />
      <AddOrEditSection open={dialogs.sections} onClose={close} section={null} />
      <AddOrEditMaterial open={dialogs.materials} onClose={close} selectedMaterial={null} />
      <AddOrEditLoad open={dialogs.loads} onClose={close} selectedLoad={null} />
      <AddOrEditBoundaryCondition open={dialogs.supports} onClose={close} selectedBoundaryCondition={null} />
      <Copy open={dialogs.copy} onClose={close} />
    </Box>
  );
});

export default TopBar;

