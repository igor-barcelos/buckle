import React, { ReactNode } from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  DialogProps as MuiDialogProps
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Draggable from 'react-draggable';
import Paper from '@mui/material/Paper';

interface DialogProps extends Omit<MuiDialogProps, 'title'> {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  draggable?: boolean;
  hideBackdrop?: boolean;
  disableEnforceFocus?: boolean;
  disableAutoFocus?: boolean;
  disableRestoreFocus?: boolean;
}

function DraggablePaper(props: any) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'xs',
  fullWidth = true,
  draggable = false,
  hideBackdrop = false,
  disableEnforceFocus = false,
  disableAutoFocus = false,
  disableRestoreFocus = false,
  ...rest
}) => {
  const PaperComponent = draggable ? DraggablePaper : undefined;

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperComponent={PaperComponent}
      hideBackdrop={hideBackdrop}
      disableEnforceFocus={disableEnforceFocus}
      disableAutoFocus={disableAutoFocus}
      disableRestoreFocus={disableRestoreFocus}
      sx={{
        pointerEvents: 'none',
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          padding: 0,
        },
        '& .MuiPaper-root': {
          pointerEvents: 'auto',
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: '#2d2d2d',
          borderRadius: '8px',
          border: '2px solid #1e1e1e',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          color: '#e0e0e0',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'fixed',
          top: '50px',
          right: '0px',
        }
      }}
      {...rest}
    >
      {title && (
        <DialogTitle
          id={draggable ? "draggable-dialog-title" : undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#2d2d2d',
            borderBottom: '2px solid #1e1e1e',
            py: 1,
            px: 2,
            cursor: draggable ? 'move' : 'default',
            pointerEvents: 'auto',
            m: 0,
          }}
        >
          <Typography
            sx={{
              color: '#e0e0e0',
              fontSize: '0.9rem',
              fontWeight: 400,
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            {title}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            size="small"
            sx={{
              color: '#b0b0b0',
              '&:hover': {
                color: '#e0e0e0',
                backgroundColor: '#3f3f3f',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent sx={{ p: 2, backgroundColor: '#2d2d2d', pointerEvents: 'auto' }}>
        {children}
      </DialogContent>
      {actions && (
        <DialogActions sx={{ pointerEvents: 'auto', p: 2, backgroundColor: '#2d2d2d', borderTop: '2px solid #1e1e1e' }}>
          {actions}
        </DialogActions>
      )}
    </MuiDialog>
  );
};

export default Dialog;
