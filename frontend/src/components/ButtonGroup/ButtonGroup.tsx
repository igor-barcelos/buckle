import * as React from 'react';
import {
  Button,
  ButtonGroup as MuiButtonGroup
} from '@mui/material';
import { useState } from 'react';

interface ButtonGroupProps {
  list: {
    value: number;
    label: string;
  }[];
  selected: number;
  onChange: (value: number) => void;
}


const ButtonGroup = ({ list, onChange , selected }: ButtonGroupProps) => {


  return (
    <MuiButtonGroup 
      color="primary"
    >
      {list.map((item, index) => (
        <Button key={index} onClick={() => onChange(item.value)} variant={selected === item.value ? 'contained' : 'outlined'}>
          {item.label}
        </Button>
      ))}
    </MuiButtonGroup>
  );
}

export default ButtonGroup;