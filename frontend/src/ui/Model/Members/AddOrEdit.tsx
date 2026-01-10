import { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Stack,
  Button,
} from '@mui/material';
import { Save as SaveIcon, Clear } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useModel } from '../../../model/Context';
import Dialog from '../../../components/Dialog/Dialog';
import ElasticBeamColumn from '../../../model/Elements/ElasticBeamColumn/ElasticBeamColumn';
import TextField from '../../../components/TextField/TextField';
import Select from '../../../components/Select';

interface AddOrEditProps {
  open: boolean;
  onClose: () => void;
  selectedMember?: ElasticBeamColumn | null;
}


const AddOrEdit = observer(({ open, onClose, selectedMember = null }: AddOrEditProps) => {
  const model = useModel();
  
  const [member, setMember] = useState({
    id: null as number | null,
    label: '',
    nodeI: null as number | null,
    nodeJ: null as number | null,
    section: null as number | null,
    gamma: '0',
    release: "",
  });

  useEffect(() => {
    if (!open) return;

    if (selectedMember) {
      setMember({
        id: selectedMember.id,
        label: selectedMember.label || '',
        nodeI: selectedMember.nodes[0]?.id || null,
        nodeJ: selectedMember.nodes[1]?.id || null,
        section: selectedMember.section?.id || null,
        gamma: String(selectedMember.gamma || 0),
        release: selectedMember.release,
      });
    } else {
      reset();
    }
  }, [open, selectedMember]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMember({ ...member, [name]: value });
  };

  const handleSelectChange = (field: string, value: any) => {
    setMember({ ...member, [field]: value });
  };

  const reset = () => {
    setMember({
      id: null,
      label: '',
      nodeI: null,
      nodeJ: null,
      section: null,
      gamma: '0',
      release: "",
    });
  };

  const handleSave = () => {
    if (!model) return;

    // Find nodes by ID
    const nodeI = model.nodes.find(n => n.id === Number(member.nodeI));
    const nodeJ = model.nodes.find(n => n.id === Number(member.nodeJ));
    
    // Find section by ID
    const section = model.sections.find(s => s.id === Number(member.section));
    
    if (!nodeI || !nodeJ || !section) {
      console.warn('Node I, Node J, or Section not found');
      return;
    }

    const nodes = [nodeI, nodeJ];
    const gamma = Number(member.gamma) || 0;
    const label = member.label;
    const release = member.release;

    if (selectedMember) {
      // Update existing member
      selectedMember.update(nodes, section, gamma, label, release);
    } else {
      // Create new member
      const memberLabel = member.label || `Member ${model.members.length + 1}`;
      const newMember = new ElasticBeamColumn(model, memberLabel, nodes, section);
      newMember.create();
      model.members.push(newMember);
    }

    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  // Get node options for select dropdowns
  const nodes = model?.nodes.map((node) => ({
    id: node.id,
    name: node.name || `Node ${node.id}`,
  })) || [];

  // Get section options for select dropdown
  const sections = model?.sections.map((section) => ({
    id: section.id,
    name: section.name,
  })) || [];

  // Release options matching the Release type
  const releases: { id: string; name: string }[] = [
    { id: 'fixed-pinned', name: 'Fixed-Pinned' },
    { id: 'pinned-fixed', name: 'Pinned-Fixed' },
    { id: 'pinned-pinned', name: 'Pinned-Pinned' },
  ];

  const actions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleCancel}
        sx={{
          backgroundColor: '#3f3f3f',
          color: '#ffffff',
          borderColor: '#1e1e1e',
          minWidth: '60px',
          height: '28px',
          fontSize: '0.75rem',
          padding: '4px 12px',
          '&:hover': {
            backgroundColor: '#4a4a4a',
            borderColor: '#404040',
            color: '#e0e0e0',
          },
        }}
      >
        Cancel
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={handleSave}
        startIcon={<SaveIcon sx={{ fontSize: '0.875rem' }} />}
        sx={{
          backgroundColor: '#3f3f3f',
          color: '#ffffff',
          borderColor: '#1e1e1e',
          minWidth: '60px',
          height: '28px',
          fontSize: '0.75rem',
          padding: '4px 12px',
          '&:hover': {
            backgroundColor: '#4a4a4a',
            borderColor: '#404040',
            color: '#e0e0e0',
          },
        }}
      >
        Save
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="xs"
      fullWidth={false}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      draggable
      title={selectedMember ? 'Edit Member' : 'Add Member'}
      actions={actions}
    >
        <Stack spacing={1.5}>
          {/* Label */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Label
            </Typography>
            <TextField
              value={member.label}
              onChange={handleChange}
              name="label"
              placeholder="Member"
              fullWidth
            />
          </Box>

          {/* Node I */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Node I
            </Typography>
            <Select
              label={''}
              list={nodes}
              value={member.nodeI || ''}
              onChange={(e:any) => handleSelectChange('nodeI', e.target.value)}
              size="small"
            />
          </Box>

          {/* Node J */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Node J
            </Typography>
            <Select
              label={''}
              list={nodes}
              value={member.nodeJ || ''}
              onChange={(e: any) => handleSelectChange('nodeJ', e.target.value)}
              size="small"
            />
          </Box>

          {/* Section */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Section
            </Typography>
            <Select
              label={''}
              list={sections}
              value={member.section || ''}
              onChange={(e:any) => handleSelectChange('section', e.target.value)}
              size="small"
            />
          </Box>

          {/* Gamma */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Gamma
            </Typography>
            <TextField
              value={member.gamma}
              onChange={handleChange}
              name="gamma"
              placeholder="0"
              fullWidth
            />
          </Box>

          {/* Release */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Release
            </Typography>
            <Box sx={{ position: 'relative' }}>
              <Select
                label={''}
                list={releases}
                value={member.release || ''}
                onChange={(e:any) => handleSelectChange('release', e.target.value)}
                size="small"
              />
              {member.release && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectChange('release', null);
                  }}
                  sx={{
                    position: 'absolute',
                    right: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: '2px',
                    color: '#ffffff',
                    '&:hover': {
                      color: '#e0e0e0',
                      backgroundColor: '#4a4a4a',
                    },
                  }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </Stack>
    </Dialog>
  );
});

export default AddOrEdit;

