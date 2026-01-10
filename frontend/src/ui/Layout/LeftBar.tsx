import { Box, Typography, Collapse, IconButton } from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  AccountTree as NodesIcon,
  Polyline as MembersIcon,
  Science as MaterialsIcon,
  ViewInAr as SectionsIcon,
  Lock as BoundaryConditionsIcon,
  TrendingDown as LoadsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useModel } from '../../model/Context';
import AddOrEditNode from '../Model/Nodes/AddOrEdit';
import AddOrEditSection from '../Model/Sections/AddOrEdit'
import AddOrEditLoad from '../Model/Loads'
import AddOrEditMember from '../Model/Members/AddOrEdit';
import AddOrEditBoundaryCondition from '../Model/BoundaryConditions';
import Node from '../../model/Elements/Node/Node';
import { Load } from '../../model';
import { ElasticIsotropicMaterial, Section as SectionType } from '../../types';
import AddOrEditMaterial from '../Model/Materials/AddOrEdit';
import ElasticBeamColumn from '../../model/Elements/ElasticBeamColumn/ElasticBeamColumn';
import BoundaryCondition from '../../model/BoundaryCondition/BoundaryCondition';
interface LeftBarProps {
  isCollapsed?: boolean;
}

interface TreeItemProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  level?: number;
  onAdd?: () => void;
}

const TreeItem = ({ id, label, icon, children, level = 0, onAdd }: TreeItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const hasChildren = children !== undefined;

  return (
    <>
      <Box
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          pl: 2 + level * 1.5,
          py: 1,
          color: '#e0e0e0',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            backgroundColor: '#3f3f3f',
          },
        }}
      >
        <Box 
          onClick={() => hasChildren && setExpanded(!expanded)}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            flex: 1,
            cursor: hasChildren ? 'pointer' : 'default',
          }}
        >
          {hasChildren && (
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 20 }}>
              {expanded ? (
                <ExpandMoreIcon sx={{ fontSize: 18, color: '#a0a0a0' }} />
              ) : (
                <ChevronRightIcon sx={{ fontSize: 18, color: '#a0a0a0' }} />
              )}
            </Box>
          )}
          {!hasChildren && <Box sx={{ minWidth: 20 }} />}
          {/* <Box sx={{ display: 'flex', alignItems: 'center', color: '#555' }}>
            {icon}
          </Box> */}
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: level === 0 ? 600 : 500,
              color: level === 0 ? '#e0e0e0' : '#b0b0b0',
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {label}
          </Typography>
        </Box>
        {onAdd && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            sx={{
              opacity: isHovered ? 1 : 0.5,
              transition: 'all 0.2s ease-in-out',
              padding: '4px',
              color: '#b0b0b0',
              '&:hover': {
                backgroundColor: '#4a4a4a',
                color: '#e0e0e0',
                opacity: 1,
              },
            }}
          >
            <AddIcon sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </Box>
      {hasChildren && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          {children}
        </Collapse>
      )}
    </>
  );
};

const LeftBar = observer(({ isCollapsed = false }: LeftBarProps) => {
  const model = useModel();
  const [addOrEditNode, setAddOrEditNode] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const [addOrEditSection, setAddOrEditSection] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SectionType | null>(null);

  const [addOrEditMaterial, setAddOrEditMaterial] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<ElasticIsotropicMaterial | null>(null);

  const [addOrEditLoad, setAddOrEditLoad] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);

  const [addOrEditMember, setAddOrEditMember] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ElasticBeamColumn | null>(null);

  const [addOrEditBoundaryCondition, setAddOrEditBoundaryCondition] = useState(false);
  const [selectedBoundaryCondition, setSelectedBoundaryCondition] = useState<BoundaryCondition | null>(null);

  

  return (
    <Box
      sx={{
        width: isCollapsed ? 0 : '280px',
        backgroundColor: '#2d2d2d',
        borderRight: isCollapsed ? 'none' : '2px solid #1e1e1e',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out, border 0.3s ease-in-out',
        overflow: 'hidden',
        opacity: isCollapsed ? 0 : 1,
        pointerEvents: isCollapsed ? 'none' : 'auto',
      }}
    >
      {/* Tree View */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          py: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#353535',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#5a5a5a',
            borderRadius: '4px',
            '&:hover': {
              background: '#6a6a6a',
            },
          },
        }}
      >
        {/* Materials */}
        <TreeItem
          id="materials"
          label="Materials"
          icon={<MaterialsIcon sx={{ fontSize: 20 }} />}
          onAdd={() => {
            setSelectedMaterial(null);
            setAddOrEditMaterial(true);
          }}
        >
          {model?.materials?.map((material: ElasticIsotropicMaterial) => (
            <Box
              key={material.id}
              sx={{
                px: 2,
                pl: 6,
                py: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#3f3f3f',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#b0b0b0' }}>
                {material.name || `Material ${material.id}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMaterial(material);
                    setAddOrEditMaterial(true);
                  }}
                  sx={{ padding: '2px', color: '#b0b0b0', '&:hover': { color: '#e0e0e0' } }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const index = model?.materials.findIndex((m) => m.id === material.id);
                    if (index !== undefined && index !== -1 && model) {
                      model.materials.splice(index, 1);
                    }
                  }}
                  sx={{ padding: '2px', color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </TreeItem>

        {/* Sections */}
        <TreeItem
          id="sections"
          label="Sections"
          icon={<SectionsIcon sx={{ fontSize: 20 }} />}
          onAdd={() => setAddOrEditSection(true)}
        >
          {model?.sections?.map((section: SectionType) => (
            <Box
              key={section.id}
              sx={{
                px: 2,
                pl: 6,
                py: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#3f3f3f',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#b0b0b0' }}>
                {section.name || `Section ${section.id}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSection(section)
                    setAddOrEditSection(true)
                  }}
                  sx={{ padding: '2px', color: '#b0b0b0', '&:hover': { color: '#e0e0e0' } }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Delete section', section.id);
                  }}
                  sx={{ padding: '2px', color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </TreeItem>

        {/* Nodes */}
        <TreeItem
          id="nodes"
          label="Nodes"
          icon={<NodesIcon sx={{ fontSize: 20 }} />}
          onAdd={() => {
            setSelectedNode(null);
            setAddOrEditNode(true);
          }}
        >
          {model?.nodes?.slice(0, 50).map((node: Node) => (
            <Box
              key={node.id}
              sx={{
                px: 2,
                pl: 6,
                py: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#3f3f3f',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#b0b0b0' }}>
                {node.name || `Node ${node.id}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                      e.stopPropagation();                    
                      setSelectedNode(node);
                      setAddOrEditNode(true); 
                  }}
                  sx={{ padding: '2px', color: '#b0b0b0', '&:hover': { color: '#e0e0e0' } }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    node.delete()
                  }}
                  sx={{ padding: '2px', color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
          {(model?.nodes?.length || 0) > 50 && (
            <Box sx={{ px: 2, pl: 6, py: 0.8 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#707070', fontStyle: 'italic' }}>
                ... and {(model?.nodes?.length || 0) - 50} more
              </Typography>
            </Box>
          )}
        </TreeItem>

        {/* Members */}
        <TreeItem
          id="members"
          label="Members"
          icon={<MembersIcon sx={{ fontSize: 20 }} />}
          onAdd={() => {
            setSelectedMember(null);
            setAddOrEditMember(true);
          }}
        >
          {model?.members?.slice(0, 50).map((member: ElasticBeamColumn) => (
            <Box
              key={member.id}
              sx={{
                px: 2,
                pl: 6,
                py: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#3f3f3f',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#b0b0b0' }}>
                {member.label || `Member ${member.id}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMember(member);
                    setAddOrEditMember(true);
                  }}
                  sx={{ padding: '2px', color: '#b0b0b0', '&:hover': { color: '#e0e0e0' } }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Delete member', member.id);
                    member.remove()
                  }}
                  sx={{ padding: '2px', color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
          {(model?.members?.length || 0) > 50 && (
            <Box sx={{ px: 2, pl: 6, py: 0.8 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#707070', fontStyle: 'italic' }}>
                ... and {(model?.members?.length || 0) - 50} more
              </Typography>
            </Box>
          )}
        </TreeItem>

        {/* Boundary Conditions */}
        <TreeItem
          id="boundaryConditions"
          label="Supports"
          icon={<BoundaryConditionsIcon sx={{ fontSize: 20 }} />}
          onAdd={() => {
            setSelectedBoundaryCondition(null);
            setAddOrEditBoundaryCondition(true);
          }}
        >
          {model?.boundaryConditions?.map((bc: BoundaryCondition) => (
            <Box
              key={bc.id}
              sx={{
                px: 2,
                pl: 6,
                py: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#3f3f3f',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#b0b0b0' }}>
                {bc.name || `Support ${bc.id}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBoundaryCondition(bc);
                    setAddOrEditBoundaryCondition(true);
                  }}
                  sx={{ padding: '2px', color: '#b0b0b0', '&:hover': { color: '#e0e0e0' } }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    const support = model.boundaryConditions.find((b) => b.id === bc.id);
                    console.log('Delete support', support?.id);
                    if (support) {
                      support.delete();
                    }
                  }}
                  sx={{ padding: '2px', color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </TreeItem>

        {/* Loads */}
        <TreeItem
          id="loads"
          label="Loads"
          icon={<LoadsIcon sx={{ fontSize: 20 }} />}
          onAdd={() => {
            setSelectedLoad(null);
            setAddOrEditLoad(true);
          }}
        >
          {model?.loads?.map((load: Load) => (
            <Box
              key={load.id}
              sx={{
                px: 2,
                pl: 6,
                py: 0.8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': {
                  backgroundColor: '#3f3f3f',
                },
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#b0b0b0' }}>
                {load.name || `Load ${load.id}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    console.log('load to edit', load)
                    e.stopPropagation();
                    setSelectedLoad(load)
                    setAddOrEditLoad(true)
                  }}
                  sx={{ padding: '2px', color: '#b0b0b0', '&:hover': { color: '#e0e0e0' } }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Delete load', load.id);
                    load.delete()
                  }}
                  sx={{ padding: '2px', color: '#d32f2f', '&:hover': { color: '#b71c1c' } }}
                >
                  <DeleteIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </TreeItem>
      </Box>

      <AddOrEditNode
        open={addOrEditNode}
        onClose={() => {
          setAddOrEditNode(false);
          setSelectedNode(null);
        }}
        selectedNode={selectedNode}
      />

      <AddOrEditSection
        open={addOrEditSection}
        onClose={() => setAddOrEditSection(false)}
        section={selectedSection}
      />

      <AddOrEditMaterial
        open={addOrEditMaterial}
        onClose={() => {setAddOrEditMaterial(false)}}
        selectedMaterial={selectedMaterial}
      />

      <AddOrEditLoad
        open={addOrEditLoad}
        onClose={() => {
          setAddOrEditLoad(false);
          setSelectedLoad(null);
        }}
        selectedLoad={selectedLoad}
      />

      <AddOrEditMember
        open={addOrEditMember}
        onClose={() => {
          setAddOrEditMember(false);
          setSelectedMember(null);
        }}
        selectedMember={selectedMember}
      />

      <AddOrEditBoundaryCondition
        open={addOrEditBoundaryCondition}
        onClose={() => {
          setAddOrEditBoundaryCondition(false);
          setSelectedBoundaryCondition(null);
        }}
        selectedBoundaryCondition={selectedBoundaryCondition}
      />
    </Box>
  );
});

export default LeftBar;
