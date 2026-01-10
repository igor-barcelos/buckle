import { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import Draggable from 'react-draggable';
import { Close } from '@mui/icons-material';
import Benchmarks from './Benchmarks/Benchmarks';
import Help from './Help/Help';

interface DocsProps {
  open: boolean;
  onClose: () => void;
}

function DraggablePaper(props: any) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
      defaultPosition={{ x: 0, y: 0 }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const Docs = ({ open, onClose }: DocsProps) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      PaperComponent={DraggablePaper}
      PaperProps={{
        sx: {
          backgroundColor: '#e8e8e8',
          borderRadius: '8px',
          border: '2px solid #b0b0b0',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
          width: '400px',
          maxWidth: '400px',
          maxHeight: '50vh',
          pointerEvents: 'auto',
          position: 'fixed',
          top: '126px',
          left: '300px',
          margin: 0,
        },
      }}
      sx={{
        pointerEvents: 'none',
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: 0,
        },
        '& .MuiPaper-root': {
          pointerEvents: 'auto',
          position: 'fixed !important',
          top: '135px !important',
          left: '300px !important',
          margin: 0,
          width: '400px !important',
          maxWidth: '400px !important',
        },
      }}
    >
      <DialogTitle
        id="draggable-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#e8e8e8',
          borderBottom: '2px solid #b0b0b0',
          py: 1,
          px: 2,
          cursor: 'move',
        }}
      >
        <Typography
          sx={{
            color: '#333',
            fontSize: '0.9rem',
            fontWeight: 400,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Documentation
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#555',
            '&:hover': {
              color: '#000',
              backgroundColor: 'rgba(0, 0, 0, 0.08)',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, backgroundColor: '#e8e8e8', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(80vh - 60px)' }}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#e8e8e8',
          }}
        >
          {/* Tabs */}
          <Box sx={{ borderBottom: '1px solid #b0b0b0', backgroundColor: '#e8e8e8' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              sx={{
                minHeight: 'auto',
                '& .MuiTab-root': {
                  minHeight: 'auto',
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  fontWeight: 500,
                  color: '#555',
                  '&.Mui-selected': {
                    color: '#333',
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#555',
                  height: 2,
                },
              }}
            >
              <Tab label="Benchmarks" />
              <Tab label="Help" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {currentTab === 0 && <Benchmarks />}
            {currentTab === 1 && <Help />}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default Docs;
