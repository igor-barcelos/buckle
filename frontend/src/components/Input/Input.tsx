import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';

type InputProps = {
  value: any;
  onChange: (value: any) => void;
  label?: string;
  placeholder?: string;
  type?: string;
  adornment?: string;
  name?: string;
  disabled?: boolean;
};

const Input = ({
  value,
  onChange,
  label,
  placeholder,
  type = 'text',
  adornment,
  name,
  disabled = false,
}: InputProps) => {
  const theme = useTheme();

  // direct RGBA values for disabled state:
  const DISABLED_BG = 'white';
  const DISABLED_BORDER = 'rgba(0, 0, 0, 0.38)';
  const DISABLED_TEXT = 'rgba(0, 0, 0, 0.38)';

  return (
    <TextField
      fullWidth
      name={name}
      value={value}
      onChange={(e) => onChange(e)}
      label={label}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
      InputProps={{
        endAdornment: adornment && (
          <InputAdornment position="end">
            <Typography
              sx={{
                color: disabled ? DISABLED_TEXT : theme.palette.primary.main,
              }}
            >
              {adornment}
            </Typography>
          </InputAdornment>
        ),
      }}
      sx={{
        // Outline & background
        '& .MuiOutlinedInput-root': {
          backgroundColor: disabled ? DISABLED_BG : 'white',
        },
        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
          borderColor: DISABLED_BORDER,
        },
        '& .MuiOutlinedInput-root fieldset': {
          borderColor: theme.palette.primary.main,
          borderRadius: '10px',
        },
        '& .MuiOutlinedInput-root:hover fieldset': {
          borderColor: theme.palette.primary.main,
        },
        '& .MuiOutlinedInput-root.Mui-focused fieldset': {
          borderColor: theme.palette.primary.main,
        },

        // Input text
        '& .MuiInputBase-input': {
          color: disabled ? DISABLED_TEXT : 'black',
          height: '1em',
        },
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: DISABLED_TEXT,
        },

        // Label
        '& .MuiInputLabel-root': {
          color: disabled ? DISABLED_TEXT : 'black',
          top: '-5px',
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: theme.palette.primary.main,
          top: '-5px',
        },
        '& .MuiInputLabel-root.Mui-disabled': {
          color: DISABLED_TEXT,
        },

        // Adornment container
        '& .MuiInputAdornment-root': {
          marginRight: 0,
        },
        '& .MuiInputAdornment-positionEnd': {
          color: disabled ? DISABLED_TEXT : theme.palette.primary.main,
        },
      }}
    />
  );
};

export default Input;
