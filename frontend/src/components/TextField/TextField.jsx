import React from 'react'
import {TextField as MuiTextField} from '@mui/material'

export default function TextField ({value, onChange, name, placeholder, type = 'text', size = 'small', fullWidth = true, ...props}) {
  return (
    <MuiTextField
      value={value}
      onChange={onChange}
      variant="outlined"
      name={name}
      placeholder={placeholder}
      type={type}
      size={size}
      fullWidth={fullWidth}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '32px',
          fontSize: '0.875rem',
          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          backgroundColor: '#ffffff !important',
          '&.Mui-focused fieldset': {
            borderColor: 'transparent', // Focus border color (change to your preference)
          },
        },
        '& .MuiInputBase-input': {
          backgroundColor: '#ffffff !important',
          color: '#333333 !important',
          textAlign: 'left !important',
          padding: '8px 12px !important',
          '&::placeholder': {
            color: '#999999 !important',
            opacity: 1,
          },
        }
      }}
      {...props}
    />
  )
}
