import { Typography as MuiTypography } from '@mui/material';

const Typography = ({ children, sx = {}, ...props }) => {
  return (
    <MuiTypography
      sx={{
        fontSize: '0.75rem',
        color: '#555',
        mb: 0.5,
        fontWeight: 500,
        fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiTypography>
  );
};

export default Typography;
