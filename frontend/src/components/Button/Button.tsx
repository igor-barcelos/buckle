import { Button as MuiButton } from '@mui/material';

type ButtonProps = {
  onClick: () => void;
  label: string;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return (
    <MuiButton onClick={onClick} variant="contained" color="primary" 
    sx={{
      width: '100%',
    }}>
      {label}
    </MuiButton>
  );
};

export default Button;
