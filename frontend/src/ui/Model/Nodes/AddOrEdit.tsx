import { useState, useEffect } from 'react';
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Stack,
} from '@mui/material';
import {
  Save as SaveIcon,
  OpenWith as MoveIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useModel } from '../../../model/Context';
import Dialog from '../../../components/Dialog/Dialog';
import Node from '../../../model/Elements/Node/Node';
import * as THREE from 'three';
import Move from './Components/Move/Move';
import TextField from '../../../components/TextField/TextField';

interface NodesProps {
  open: boolean;
  onClose: () => void;
  selectedNode?: Node | null;
}



const AddOrEdit = observer(({ open, onClose, selectedNode }: NodesProps) => {
  const model = useModel();
  const [node, setNode] = useState({
    name: '',
    x: '0',
    y: '0',
    z: '0',
  });

  useEffect(() => {
    if (open) {
      if (selectedNode) {
        setNode({
          name: selectedNode.name || '',
          x: selectedNode.x.toString(),
          y: selectedNode.y.toString(),
          z: selectedNode.z.toString(),
        });
      } else {
        setNode({
          name: '',
          x: '0',
          y: '0',
          z: '0',
        });
      }
    }
  }, [open, selectedNode]);

  const handleSave = () => {
    const coordinates = new THREE.Vector3(
      Number(node.x),
      Number(node.y),
      Number(node.z)
    );

    if (selectedNode) {
      selectedNode.update(coordinates, node.name || undefined);
      onClose();
    } else {
      const name = node.name || `Node ${(model.nodes?.length || 0) + 1}`;
      const newNode = new Node(coordinates, name);
      newNode.model = model;
      newNode.create();
      model.nodes.push(newNode);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setNode({
      ...node,
      [name]: value,
    });
  };

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
        {selectedNode ? 'Save' : 'Add'}
      </Button>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth={false}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      draggable
      title={selectedNode ? 'Edit Node' : 'Add Node'}
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
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Name
            </Typography>
            <TextField
              name="name"
              value={node.name}
              onChange={handleChange}
              placeholder="Node name"
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
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              X (m)
            </Typography>
            <TextField
              name="x"
              value={node.x}
              onChange={handleChange}
              placeholder="X"
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
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Y (m)
            </Typography>
            <TextField
              name="z"
              value={node.z}
              onChange={handleChange}
              placeholder="Y"
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
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Z (m)
            </Typography>
            <TextField
              name="y"
              value={node.y}
              onChange={handleChange}
              placeholder="Z"
              fullWidth
            />
          </Box>
        </Stack>
    </Dialog>
  );
});

export default AddOrEdit;
