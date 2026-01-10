import { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { useModel } from '../../../model/Context';
import { observer } from 'mobx-react-lite';
import TextField from '../../../components/TextField';
import Dialog from '../../../components/Dialog/Dialog';
import { CopyTool } from '../../../model';

interface CopyProps {
  open: boolean;
  onClose: () => void;
}

const Copy = observer(({ open, onClose }: CopyProps) => {
  const model = useModel();
  const [repeat, setRepeat] = useState('1');

  const handleRepeat = (event: any) => {
    const { value } = event.target;
    setRepeat(value);
  };

  const handleCopy = () => {
    let currentTool = model.toolsController.getCurrentTool()
    let toolUuid = currentTool?.uuid
    if (toolUuid !== 'Copy') {
      currentTool?.stop()
    
      model.toolsController.activate('copy');
      const copyTool = model.toolsController.getCurrentTool() as CopyTool;
      copyTool.setRepeat(Number(repeat));
    }else{
      currentTool?.start()
    }
  };

  const handleClose = () => {
    const currentTool = model.toolsController.getCurrentTool();
    currentTool?.stop();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth={false}
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      draggable
      title="Copy"
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
            Repeat
          </Typography>
          <TextField
            value={repeat}
            onChange={handleRepeat}
            name="repeat"
            placeholder="Number of copies"
            fullWidth
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClose}
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
                color: 'white',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleCopy}
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
            Start
          </Button>
        </Box>
      </Stack>
    </Dialog>
  );
});

export default Copy;
