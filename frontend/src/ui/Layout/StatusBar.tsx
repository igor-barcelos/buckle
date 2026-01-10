import { Box, Typography, Chip } from '@mui/material';
import { FiberManualRecord as DotIcon } from '@mui/icons-material';
import { useModel } from '../../model/Context';
import { observer } from 'mobx-react-lite';

const StatusBar = () => {
  const model = useModel();
  return (
    <Box
      sx={{
        height: '42px',
        backgroundColor: '#2d2d2d',
        borderTop: '2px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        fontSize: '0.75rem',
        boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#ffffff',
            fontWeight: 500,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          X: {model?.pointerCoords.x.toFixed(2)} Y: {model?.pointerCoords.y.toFixed(2)} Z: {model?.pointerCoords.z.toFixed(2)}
        </Typography>
      </Box>
    </Box>
  );
};

export default observer(StatusBar);

