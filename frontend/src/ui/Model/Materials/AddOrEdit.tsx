import { ChangeEvent, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import Dialog from '../../../components/Dialog/Dialog';
import TextField from '../../../components/TextField/TextField';
import { useModel } from '../../../model/Context';
import { ElasticIsotropicMaterial } from '../../../types';

interface MaterialsProps {
  open: boolean;
  onClose: () => void;
  selectedMaterial?: ElasticIsotropicMaterial | null;
}

const AddOrEdit = observer(({ open, onClose, selectedMaterial = null }: MaterialsProps) => {
  const model = useModel();
  const [material, setMaterial] = useState<ElasticIsotropicMaterial>({
    id: 0,
    name: '',
    E: 200e9,
    nu: 0.3,
    rho: 7850,
  });

  useEffect(() => {
    if(!open) return 
    if (selectedMaterial) setMaterial({...selectedMaterial});
    else reset()
  }, [open, selectedMaterial ]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setMaterial((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!model) return;
    const id = selectedMaterial?.id ||  (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 0x80000000)
    const rho =  material.rho || 0
    const newMaterial: ElasticIsotropicMaterial = {
      id: id,
      name: material.name || `Material ${model.materials.length + 1}`,
      E: Number(material.E),
      nu: Number(material.nu),
      rho: Number(rho),
    };

    if (selectedMaterial) {
      const currentMat = model.materials.find((m) => m.id === selectedMaterial.id);
      if (currentMat)  Object.assign(currentMat, newMaterial);
    } else model.materials.push(newMaterial);
    
    onClose();
    reset()
  };

  const reset = () => {
    setMaterial({
      id: 0,
      name: '',
      E: 200e9,
      nu: 0.3,
      rho: 7850,
    });
  }
  const handleCancel = () => {
    onClose();
    reset()
  };

  const actions = (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        onClick={handleCancel}
        sx={{
          backgroundColor: '#3f3f3f',
          color: 'white',
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
          color: 'white',
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
      title={selectedMaterial ? 'Edit Material' : 'New Material'}
      actions={actions}
    >
        <Stack spacing={1.5}>
          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#b0b0b0',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              Name
            </Typography>
            <TextField
              value={material.name}
              onChange={handleChange}
              name="name"
              placeholder="Material name"
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#b0b0b0',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              E (Pa)
            </Typography>
            <TextField
              value={material.E}
              onChange={handleChange}
              name="E"
              placeholder="Young's modulus"
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#b0b0b0',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              ν
            </Typography>
            <TextField
              value={material.nu}
              onChange={handleChange}
              name="nu"
              placeholder="Poisson ratio"
              fullWidth
            />
          </Box>

          <Box>
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#b0b0b0',
                mb: 0.5,
                fontWeight: 500,
                fontFamily:
                  '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }}
            >
              ρ (kg/m³)
            </Typography>
            <TextField
              value={material.rho ?? ''}
              onChange={handleChange}
              name="rho"
              placeholder="Density"
              fullWidth
            />
          </Box>
        </Stack>
    </Dialog>
  );
});

export default AddOrEdit;

