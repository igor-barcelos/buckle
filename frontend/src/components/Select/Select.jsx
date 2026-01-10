import {
  Select as MuiSelect,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const truncateText = (text, maxLength = 20) => {
  if (text.length <= maxLength) return text;
  const start = text.substring(0, 10);
  const end = text.substring(text.length - 7);
  return `${start}...${end}`;
};

const Select = ({ onChange, list, value, label, size = 'small' }) => {
  return (
    <>
      <MuiSelect
        label={label}
        value={value}
        onChange={onChange}
        size="small"
        fullWidth
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
        {list?.map((item, index) => (
          <MenuItem key={index} value={item.id}>
            {truncateText(item.name)}
          </MenuItem>
        ))}
      </MuiSelect>
    </>
  )
}

export default Select;