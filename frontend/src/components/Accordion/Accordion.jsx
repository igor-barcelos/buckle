import React from 'react';
import {
  Accordion as MuiAccordion,
  AccordionSummary,
  AccordionDetails,
  Typography
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const Accordion = ({ 
  title, 
  children, 
  defaultExpanded = false,
  sx = {},
  titleSx = {},
  contentSx = {},
  ...props 
}) => {
  return (
    <MuiAccordion
      defaultExpanded={defaultExpanded}
      sx={{
        mt: 1,
        width: '100%',
        boxShadow: 'none',
        // border: '1px solid #e0e0e0',
        // '&:before': {
        //   display: 'none',
        // },
        // '&.Mui-expanded': {
        //   margin: '8px 0',
        // },
        ...sx
      }}
      {...props}
    >
      <AccordionSummary
        expandIcon={<ExpandMore sx={{ color: 'black' }} />}
        sx={{
          backgroundColor: 'white',
          width: '100%',
          padding: 0,
          minHeight: '36px',
          '&.Mui-expanded': {
            minHeight: '36px',
          },
          '& .MuiAccordionSummary-content': {
            margin: '0px 0',
            width: '100%',
            '&.Mui-expanded': {
              margin: '0px 0',
            }
          },
          ...titleSx
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: '#333333',
            fontSize: '0.8rem',
            width: '100%'
          }}
        >
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          padding: 0,
          backgroundColor: '#ffffff',
          ...contentSx
        }}
      >
        {children}
      </AccordionDetails>
    </MuiAccordion>
  );
};

export default Accordion;
