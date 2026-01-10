import React, { memo, useState } from 'react';
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Typography,
  FormControlLabel,
  Grid,
  Select,
  MenuItem,
  FormControl
} from '@mui/material';
import { Close } from '@mui/icons-material';
import Checkbox from '@mui/material/Checkbox';
import Draggable from 'react-draggable';
import { useModel } from '../../model/Context';
import GridHelper from './GridHelper/GridHelper';
import { observer } from 'mobx-react-lite';

function DraggablePaper(props) {
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

const Settings = ({open, onClose}) => {
  const model = useModel()
  console.log('MODEL VISI', model?.visibility)
  const [selectedType, setSelectedType] = useState('Visibility');

  const snapOptions = {
    grid : { label : 'Grid' , value : 'onGrid' , enabled : true },
    nodes : { label : 'Nodes' , value : 'onNode', enabled : false }
  }

  const visibilityOptions = {
    nodes : { label: 'Nodes', value: 'nodes' },
    nodeLabels : { label: 'Node Labels', value: 'nodeLabels' },
    members : { label: 'Members', value: 'members'},
    memberLabels : { label: 'Member Labels', value: 'memberLabels', },
    sections: { label: 'Sections', value: 'sections' }
  }

  const handleChangeSnap = (e) => {
    const {name, checked} = e.target
    switch (name) {
      case 'nodes':
        model.snapper.toggleOnNode()
        break;
      case 'grid':
        model.snapper.toggleOnGrid()
        break;
      default:
        break;
    }
  }

  const handleChangeVisibility = (e) => {
    const {name, checked} = e.target
    
    switch (name) {
      case 'nodes':
        model.visibility.showOrHideNodes(checked)
        break;
      case 'nodeLabels' : 
        model.visibility.showOrHideNodeLabels(checked)
        break;
      case 'members':
        model.visibility.showOrHideMembers(checked)
        break;
      case 'memberLabels':
        model.visibility.showOrHideMemberLabels(checked)
        break;
      case 'sections':
        model.visibility.showOrHideSections(checked)
        break;
      default:
        break;
    }
  }

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth={false}
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
          width: '250px',
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
        <FormControl size="small" sx={{ width: '100%' }}>
          <Select
            value={selectedType}
            onChange={handleTypeChange}
            size="small"
            sx={{
              backgroundColor: '#ffffff',
              height: '32px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#b0b0b0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#999',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#555',
              },
              '& .MuiSelect-select': {
                py: 0,
                px: '12px',
                fontSize: '0.875rem',
                color: '#333',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #b0b0b0',
                  '& .MuiMenuItem-root': {
                    fontSize: '0.875rem',
                    color: '#333',
                    '&:hover': {
                      backgroundColor: '#e8e8e8',
                    },
                    '&.Mui-selected': {
                      backgroundColor: '#d0d0d0',
                    },
                  },
                },
              },
            }}
          >
            <MenuItem value="Visibility">Visibility</MenuItem>
            <MenuItem value="Grid">Grid</MenuItem>
            {/* <MenuItem value="Snapping">Snapping</MenuItem> */}
          </Select>
        </FormControl>
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
      <DialogContent sx={{ p: 2, backgroundColor: '#e8e8e8', overflow: 'hidden' }}>
         {
          selectedType === 'Visibility' && 
            (
              Object.keys(visibilityOptions).map((key) => {
                const option = visibilityOptions[key]
                return(
                  <Grid container alignItems='center' justifyContent='space-between' key={key}> 
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: '#555',
                          mb: 0.5,
                          fontWeight: 500,
                          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}
                      >
                        {option.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={model?.visibility[key] || false}
                            onChange={(e) => handleChangeVisibility(e)}
                            size="small"
                            name={option.value}
                            sx={{
                              color: '#b0b0b0',
                              '&.Mui-checked': {
                                color: '#555',
                              },
                            }}
                          />
                        }
                        label=""
                        sx={{ margin: 0 }}
                      />
                    </Grid>
                  </Grid>
                )
              })
            )
         }
         {
          selectedType === 'Snapping' && 
            (
              Object.keys(snapOptions).map((key) => {
                const option = snapOptions[key]
                return(
                  <Grid container alignItems='center' justifyContent='space-between' key={key}> 
                    <Grid item xs={6}>
                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          color: '#555',
                          mb: 0.5,
                          fontWeight: 500,
                          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}
                      >
                        {option.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <FormControlLabel
                        key={option.value}
                        control={
                          <Checkbox
                            checked={model?.snapper[key] || false}
                            onChange={(e) => handleChangeSnap(e)}
                            size="small"
                            name={option.value}
                            sx={{
                              color: '#b0b0b0',
                              '&.Mui-checked': {
                                color: '#555',
                              },
                            }}
                          />
                        }
                        label=""
                        sx={{ margin: 0 }}
                      />
                    </Grid>
                  </Grid>
                )
              })
            )
         }
         {
          selectedType === 'Grid' && 
          (
            <GridHelper />
          )
         }
      </DialogContent>
    </Dialog>
  )
}

export default observer(Settings)
