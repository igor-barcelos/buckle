import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Select as MUISelect,
  SelectChangeEvent,
  Stack,
  Typography,
  FormControl,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';

import Dialog from '../../../components/Dialog/Dialog';
import TextField from '../../../components/TextField/TextField';
import Select from '../../../components/Select';
import { useModel } from '../../../model/Context';
import Load from '../../../model/Load/Load';
import { LoadType } from '../../../types';

interface LoadsProps {
  open: boolean;
  onClose: () => void;
  selectedLoad?: Load | null;
}

interface LoadForm {
  id: number | null;
  name: string;
  type: LoadType;
  direction: string;
  value: string;
  targets: number[];
}

const base_vectors = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

const AddOrEdit = observer(({ open, onClose, selectedLoad = null }: LoadsProps) => {
  const model = useModel();
  const [load, setLoad] = useState<LoadForm>({
    id: null,
    name: '',
    type: 'nodal',
    direction: 'z',
    value: '0',
    targets: [],
  });

  const reset = () => {
    setLoad({
      id: null,
      name: '',
      type: 'nodal',
      direction: 'z',
      value: '0',
      targets: [],
    });
  };

  useEffect(() => {
    if (!open) return;

    if (selectedLoad) {
      // const vec_dir = selectedLoad.value.clone().normalize()
      let dir_name = 'x'
      
      Object.entries(base_vectors).forEach(([axis, vec]) => {
        const load_vec = selectedLoad.value.clone()
        const vec_cross = vec.clone().cross(load_vec.normalize()).length()

        if(vec_cross < 0.001) dir_name = axis
      })

      let vec_dir : THREE.Vector3 =  base_vectors.x
      switch (dir_name) {
        case 'x':
          vec_dir = base_vectors.x
          break;
        case 'y':
          vec_dir = base_vectors.y
          break;
        case 'z':
          vec_dir = base_vectors.z
          break;
      }
      
      // console.log('CROSS', vec_dir, selectedLoad.value.dot(vec_dir), selectedLoad.value)
      setLoad(
        {
          id : selectedLoad.id,
          name : selectedLoad.name,
          type : selectedLoad.type as LoadType,
          value : String(selectedLoad.value.dot(vec_dir)),
          targets : selectedLoad.targets,
          direction :  dir_name
        }
      );
      return;
    }
    else   reset();
  }, [open, selectedLoad]);


  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLoad((prev) => ({ ...prev, name: event.target.value }));
  };

  const handleLoadTypeChange = (event: SelectChangeEvent<LoadType>) => {
    const type = event.target.value as LoadType;
    setLoad((prev) => ({...prev, type, targets: [],}));

  };

  const handleDirectionChange = (event: SelectChangeEvent<string>) => {
    const dir = event.target.value
    setLoad((prev) => ({
      ...prev,
      direction: dir,
    }));
  };

  const handleValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setLoad((prev) => ({ ...prev, value }));
  };

  const handleTargetsChange = (event: SelectChangeEvent<typeof load.targets>) => {
    const { value } = event.target;
    setLoad((prev) => ({ ...prev, targets: value as number[] }));

  };

  const getTargetLabel = (id: number) => {
    if (!model) return 

    if (load.type === 'nodal') {
      const node = model.nodes.find((n: any) => n.id === id);
      return node?.name || (node as any)?.label || `Node ${id}`;
    }

    const member = model.members.find((m: any) => m.id === id);
    return member?.label || (member as any)?.name || `Member ${id}`;
  };

  const handleSave = () => {
    if (!model) return;

    const id = selectedLoad?.id || Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 0x7fffffff;
    const dir_name = load.direction
    const magnitude = Number(load.value)

    let vec_dir : THREE.Vector3 =  base_vectors.x
    switch (dir_name) {
      case 'x':
        vec_dir = base_vectors.x
        break;
      case 'y':
        vec_dir = base_vectors.y
        break;
      case 'z':
        vec_dir = base_vectors.z
        break;
    }


    const data = {
      id : id,
      name: load.name || `Load ${model.loads.length + 1}`,
      type: load.type,
      targets: load.targets,
      value : vec_dir.clone().multiplyScalar(magnitude)
    };

    const newLoad = new Load(model, data as Load);
    
    newLoad.createOrUpdate();
    
    reset();
    onClose();
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  // Select options
  const typeOptions = [
    { id: 'nodal', name: 'Nodal' },
    { id: 'linear', name: 'Linear' },
  ];

  const directionOptions = [
    { id: 'x', name: 'X' },
    { id: 'z', name: 'Y' },
    { id: 'y', name: 'Z' },
  ];

  const actions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          reset();
          onClose();
        }}
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
      title={selectedLoad ? 'Edit Load' : 'New Load'}
      actions={actions}
    >
        <Stack spacing={1.5}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Name
            </Typography>
            <TextField
              value={load.name}
              onChange={handleNameChange}
              name="name"
              placeholder="Load name"
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Type
            </Typography>
            <Select
              label={''}
              list={typeOptions}
              value={load.type}
              onChange={handleLoadTypeChange}
              size="small"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Direction
            </Typography>
            <Select
              label={''}
              list={directionOptions}
              value={load.direction}
              onChange={handleDirectionChange}
              size="small"
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Value
            </Typography>
            <TextField
              value={load.value}
              onChange={handleValueChange}
              name="value"
              placeholder="Force magnitude"
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#ffffff',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Elements
            </Typography>
            <FormControl fullWidth size="small">
              <MUISelect
                multiple
                value={load.targets}
                onChange={handleTargetsChange}
                size="small"
                fullWidth
                renderValue={(selected) => {
                  const values = selected as number[];
                  if (!values.length) return 'Select elements';
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {values.map((id) => (
                        <Chip
                          key={id}
                          label={getTargetLabel(id)}
                          size="small"
                          sx={{
                            backgroundColor: '#5a5a5a',
                            color: '#e0e0e0',
                            '& .MuiChip-deleteIcon': {
                              color: '#ffffff',
                              '&:hover': {
                                color: '#f44336',
                              },
                            },
                          }}
                        />
                      ))}
                    </Box>
                  );
                }}
                sx={{
                  backgroundColor: '#ffff',
                  fontSize: '0.875rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#1e1e1e',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#404040',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#5a5a5a',
                  },
                  '& .MuiSelect-select': {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    minHeight: '32px',
                    alignItems: 'center',
                    color:'#e0e0e0'
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#3f3f3f',
                      border: '1px solid #1e1e1e',
                      maxHeight: 300,
                      '& .MuiMenuItem-root': {
                        fontSize: '0.85rem',
                        color: '#e0e0e0',
                        '&:hover': {
                          backgroundColor: '#4a4a4a',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#5a5a5a',
                        },
                      },
                    },
                  },
                }}
              >
                {
                  load.type === 'nodal' ? 
                  model?.nodes.map((node) => (
                    <MenuItem key={node.id} value={node.id}>
                      {node.name || `Node ${node.id}`}
                    </MenuItem>
                  ))
                  : 
                  model?.members?.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.label || `Member ${member.id}`}
                    </MenuItem>
                  ))
                }
              </MUISelect>
            </FormControl>
          </Box>

        </Stack>
    </Dialog>
  );
});

export default AddOrEdit

