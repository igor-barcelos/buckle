import { useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, IconButton, Button, Checkbox } from '@mui/material';
import { Close } from '@mui/icons-material';
import TextField from '../../../components/TextField/TextField';

interface ElasticProps {
  bc: {
    dx: string;
    dy: string;
    dz: string;
    rx: string;
    ry: string;
    rz: string;
    fix_dx: boolean;
    fix_dy: boolean;
    fix_dz: boolean;
    fix_rx: boolean;
    fix_ry: boolean;
    fix_rz: boolean;
  };
  onChange: (field: string, value: string) => void;
  onFixedChange: (field: string, fixed: boolean) => void;
}

const Elastic = ({ bc, onChange, onFixedChange }: ElasticProps) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleFixedChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onFixedChange(field, e.target.checked);
  };

  const props = [
    { label: 'UX', field: 'dx', getValue: () => bc.dx, getFixed: () => bc.fix_dx, unit: 'kN/m' },
    { label: 'UY', field: 'dy', getValue: () => bc.dy, getFixed: () => bc.fix_dy, unit: 'kN/m' },
    { label: 'UZ', field: 'dz', getValue: () => bc.dz, getFixed: () => bc.fix_dz, unit: 'kN/m' },
    { label: 'RX', field: 'rx', getValue: () => bc.rx, getFixed: () => bc.fix_rx, unit: 'kNm/rad' },
    { label: 'RY', field: 'ry', getValue: () => bc.ry, getFixed: () => bc.fix_ry, unit: 'kNm/rad' },
    { label: 'RZ', field: 'rz', getValue: () => bc.rz, getFixed: () => bc.fix_rz, unit: 'kNm/rad' },
  ];

  return (
    <>
      <Box>
        <Typography
          sx={{
            fontSize: '0.75rem',
            color: '#b0b0b0',
            mb: 0.5,
            fontWeight: 500,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          Elastic Stiffness
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleOpen}
          fullWidth
          sx={{
            backgroundColor: '#ffffff',
            color: '#555',
            borderColor: '#b0b0b0',
            fontSize: '0.75rem',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#f5f5f5',
              borderColor: '#999',
            },
          }}
        >
          Edit Stiffness Values
        </Button>
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth={false}
        PaperProps={{
          sx: {
            backgroundColor: '#e8e8e8',
            borderRadius: '8px',
            border: '2px solid #b0b0b0',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
            width: '350px',
            maxWidth: '480px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#e8e8e8',
            borderBottom: '2px solid #b0b0b0',
            py: 1,
            px: 2,
          }}
        >
          <Typography
            sx={{
              color: '#333',
              fontSize: '0.9rem',
              fontWeight: 500,
              fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            }}
          >
            Elastic Stiffness
          </Typography>
          <IconButton
            onClick={handleClose}
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
        <DialogContent sx={{ p: 2, backgroundColor: '#e8e8e8' }}>
          <Paper
            variant="outlined"
            sx={{
              border: '1px solid #b0b0b0',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
              width: '100%',
            }}
          >
            <Table size="small" sx={{ display: 'table', width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#333',
                      backgroundColor: '#e8e8e8',
                      borderBottom: '2px solid #b0b0b0',
                      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      py: 1,
                      px: 1.5,
                    }}
                  >
                    DOF
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#333',
                      backgroundColor: '#e8e8e8',
                      borderBottom: '2px solid #b0b0b0',
                      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      py: 1,
                      px: 1.5,
                    }}
                  >
                    Fixed
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#333',
                      backgroundColor: '#e8e8e8',
                      borderBottom: '2px solid #b0b0b0',
                      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      py: 1,
                      px: 1.5,
                    }}
                  >
                    Value
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#333',
                      backgroundColor: '#e8e8e8',
                      borderBottom: '2px solid #b0b0b0',
                      fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      py: 1,
                      px: 1.5,
                    }}
                  >
                    Unit
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.map((prop) => {
                  const value = prop.getValue();
                  const fixed = prop.getFixed();
                  return (
                    <TableRow
                      key={prop.field}
                      sx={{
                        '&:last-child td': {
                          borderBottom: 'none',
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: '0.75rem',
                          color: '#555',
                          fontWeight: 500,
                          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          borderRight: '1px solid #e0e0e0',
                          py: 1,
                          px: 1.5,
                        }}
                      >
                        {prop.label}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          borderRight: '1px solid #e0e0e0',
                          py: 1,
                          px: 1.5,
                        }}
                      >
                        <Checkbox
                          checked={fixed}
                          onChange={handleFixedChange(prop.field)}
                          size="small"
                          sx={{
                            color: '#555',
                            '&.Mui-checked': {
                              color: '#555',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 0.5,
                          px: 1.5,
                          borderRight: '1px solid #e0e0e0',
                        }}
                      >
                        <TextField
                          value={value}
                          onChange={handleChange}
                          name={prop.field}
                          placeholder="0"
                          fullWidth
                          disabled={fixed}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: fixed ? '#f5f5f5' : '#ffffff',
                              height: '32px',
                              '& fieldset': {
                                borderColor: '#b0b0b0',
                              },
                              '&:hover fieldset': {
                                borderColor: '#999',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#555',
                              },
                              '&.Mui-disabled': {
                                backgroundColor: '#f5f5f5',
                              },
                            },
                            '& .MuiInputBase-input': {
                              color: '#333',
                              textAlign: 'left',
                              padding: '6px 12px',
                              fontSize: '0.875rem',
                              '&::placeholder': {
                                color: '#999',
                              },
                              '&.Mui-disabled': {
                                color: '#999',
                              },
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: '0.75rem',
                          color: '#555',
                          fontWeight: 500,
                          fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                          py: 1,
                          px: 1.5,
                        }}
                      >
                        {prop.unit}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Elastic;

