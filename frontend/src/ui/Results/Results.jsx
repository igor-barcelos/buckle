import React, { memo, useState } from 'react';
import {
  Box,
} from '@mui/material';
import { useModel } from '../../model/Context';
import Dialog from '../../components/Dialog/Dialog';
import Select from '../../components/Select/Select';
import Displacements from './Components/Displacements/Displacements';
import Diagrams from './Components/Diagrams/Diagrams';

const Results = ({open, onClose}) => {
  const model = useModel()
  const [selectedType, setSelectedType] = useState('Diagrams');
  const tabData = [
    {
      label: 'Diagrams',
      outputs: [
        {
          type : 'Forces',
          label : 'Forces',
          options : [
            {
              value : 'N' , label : 'N'
            },
            {
              value : 'Vy' , label : 'Vy'
            },
            {
              value : 'Vz' , label : 'Vz'
            },
          ]
        },
        {
          type : 'Moments',
          label : 'Moments',
          options : [
            {
              value : 'T' , label : 'T'
            },
            {
              value : 'My' , label : 'My'
            },
            {
              value : 'Mz' , label : 'Mz'
            },
          ]
        }
      ]
    },
    {
      label: 'Reactions',
      outputs: [
        {
          type : 'Reactions',
          label : 'Reactions',
          options : [
            {
              value : 'RFx' , label : 'Fx'
            },
            {
              value : 'RFy' , label : 'Fy'
            },
            {
              value : 'RFz' , label : 'Fz'
            },
            {
              value : 'RMx' , label : 'Mx'
            },
            {
              value : 'RMy' , label : 'My'
            },
            {
              value : 'RMz' , label : 'Mz'
            },
          ]
        }
      ]
    }
  ]

  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
  };

  const viewOptions = [
    { id: 'Diagrams', name: 'Diagrams' },
    { id: 'Displacements', name: 'Displacements' }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth={false}
      draggable
      hideBackdrop
      disableEnforceFocus
      disableAutoFocus
      disableRestoreFocus
      title="Results"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 'auto', maxWidth: 'calc(100vw - 40px)' }}>
        <Box sx={{ mb: 2, width: '300px' }}>
          <Select
            list={viewOptions}
            value={selectedType}
            onChange={handleTypeChange}
            label="View Type"
            size="small"
          />
        </Box>
        {selectedType === 'Displacements' && (
          <Box sx={{ width: '100%', overflow: 'auto' }}>
            <Displacements />
          </Box>
        )}
        {selectedType === 'Diagrams' && (
          <Box sx={{ width: '100%', p: 2, overflowY: 'auto', maxHeight: '500px' }}>
            <Diagrams />
          </Box>
        )}
      </Box>
    </Dialog>
  )
}

export default Results