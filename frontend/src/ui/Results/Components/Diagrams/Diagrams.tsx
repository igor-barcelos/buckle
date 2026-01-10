import { useState } from 'react';
import {
  Box,
  Typography,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Checkbox,
} from '@mui/material';
import { useModel } from '../../../../model/Context';

interface DiagramsProps {
  onApply: (option: string | null, scale: number, members: number[]) => void;
}

const Diagrams = () => {
  const model = useModel();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [scale, setScale] = useState<string>("1");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  const handleChangeSelectedOption = (value: string) => {
    setSelectedOption(selectedOption === value ? null : value);
  };

  const handleApply = () => {
    if (!selectedOption)  {
      model.postProcessing.dispose()
      return
    }
    model.postProcessing.showDiagram(selectedOption, Number(scale), selectedMembers)
  };

  return (
    <>
      <Box sx={{ mt: 2, mb: 2, width:'300px ' }}>
        <Typography
          variant="subtitle2" 
        >
          Select members
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            multiple
            value={selectedMembers}
            onChange={(e) => setSelectedMembers(e.target.value as number[])}
            renderValue={(selected) => (selected as number[]).map(id => model.members.find(m => m.id === id)?.label || id).join(', ')}
            sx={{
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#b0b0b0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#999999',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#666666',
              },
              '& .MuiSelect-select': {
                py: 1,
                fontSize: '0.875rem',
                color: '#333',
                fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #b0b0b0',
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    backgroundColor: '#ffffff',
                    color: '#333',
                    fontSize: '0.875rem',
                    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(0, 0, 0, 0.12)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.12)'
                      }
                    }
                  },
                  '&::-webkit-scrollbar': {
                    width: '12px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: '#e8e8e8',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: '#c0c0c0',
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: '#999999',
                    },
                  },
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#c0c0c0 #e8e8e8',
                }
              }
            }}
          >
            {model.members?.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                <Checkbox checked={selectedMembers.indexOf(member.id) > -1} sx={{ color: '#e0e0e0', '&.Mui-checked': { color: '#4a90e2' } }} />
                {member.label || `Member ${member.id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent:'space-between', marginTop:'1rem' }}>
        <Box>
          <Typography
            variant="subtitle2"
          >
            Forces
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOption === 'N'}
                  onChange={() => handleChangeSelectedOption('N')}
                  size="small"
                  sx={{
                    color: '#e0e0e0',
                    '&.Mui-checked': {
                      color: '#4a90e2'
                    }
                  }}
                />
              }
              label={
                <Typography
                  variant="body2"
                >
                  N (kN)
                </Typography>
              }
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOption === 'Vy'}
                  onChange={() => handleChangeSelectedOption('Vy')}
                  size="small"
                  sx={{
                    color: '#e0e0e0',
                    '&.Mui-checked': {
                      color: '#4a90e2'
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  Vy (kN)
                </Typography>
              }
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOption === 'Vz'}
                  onChange={() => handleChangeSelectedOption('Vz')}
                  size="small"
                  sx={{
                    color: '#e0e0e0',
                    '&.Mui-checked': {
                      color: '#4a90e2'
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  Vz (kN)
                </Typography>
              }
              sx={{ margin: 0 }}
            />
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Moments
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOption === 'T'}
                  onChange={() => handleChangeSelectedOption('T')}
                  size="small"
                  sx={{
                    color: '#e0e0e0',
                    '&.Mui-checked': {
                      color: '#4a90e2'
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  T (kNm)
                </Typography>
              }
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOption === 'My'}
                  onChange={() => handleChangeSelectedOption('My')}
                  size="small"
                  sx={{
                    color: '#e0e0e0',
                    '&.Mui-checked': {
                      color: '#4a90e2'
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  My (kNm)
                </Typography>
              }
              sx={{ margin: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedOption === 'Mz'}
                  onChange={() => handleChangeSelectedOption('Mz')}
                  size="small"
                  sx={{
                    color: '#e0e0e0',
                    '&.Mui-checked': {
                      color: '#4a90e2'
                    }
                  }}
                />
              }
              label={
                <Typography variant="body2">
                  Mz (kNm)
                </Typography>
              }
              sx={{ margin: 0 }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
        <Typography variant="subtitle2">
          Scale
        </Typography>
        <TextField
          value={scale}
          onChange={(e) => {
            setScale(e.target.value)
          }}
          size="small"
          sx={{
            width: '70px',
            '& .MuiOutlinedInput-root': {
              fontSize: '0.875rem',
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              backgroundColor: '#ffffff',
              '& fieldset': {
                borderColor: '#b0b0b0',
              },
              '&:hover fieldset': {
                borderColor: '#999',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#555',
              },
            },
            '& .MuiInputBase-input': {
              color: '#333',
              py: 1,
              '&::placeholder': {
                color: '#999',
                opacity: 1,
              },
            },
          }}
        />
      </Box>
      <Box sx={{ 
        position: 'absolute', 
        bottom: '15px',
        left: 0,
        right: 0,
        display: 'flex', 
        justifyContent: 'center',
        px: 2
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={handleApply}
          sx={{
            backgroundColor: '#ffffff',
            color: '#333',
            border: '1px solid #b0b0b0',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              border: '1px solid #999999',
            },
            textTransform: 'none',
            fontSize: '0.8rem',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Apply
        </Button>
      </Box>
    </>
  );
};

export default Diagrams;
