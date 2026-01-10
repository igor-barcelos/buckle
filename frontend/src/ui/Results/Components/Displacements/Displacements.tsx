import { Box } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
} from '@mui/x-data-grid';
import { useModel } from '../../../../model/Context';

interface DisplacementData {
  id: number;
  x: number;
  y: number;
  z: number;
  displacements: {
    ux: number;
    uy: number;
    uz: number;
    rx: number;
    ry: number;
    rz: number;
  };
}

interface DisplacementsProps {
  data?: DisplacementData[];
}

const Displacements = () => {
  const model = useModel()

  const rows: GridRowsProp = model.output?.nodes?.map((item : DisplacementData) => ({
    label : model.nodes.find((node: any) => node.id === item.id)?.name || '',
    id: item.id,
    x: item.x,
    y: item.y,
    z: item.z,
    ux: item.displacements.ux,
    uy: item.displacements.uy,
    uz: item.displacements.uz,
    rx: item.displacements.rx,
    ry: item.displacements.ry,
    rz: item.displacements.rz,
  }));

  const columns: GridColDef[] = [
    {
      field: 'label',
      headerName: 'Node',
      width: 100,
      type: 'number',
    },
    {
      field: 'x',
      headerName: 'X (m)',
      width: 80,
      type: 'number',
    },
    {
      field: 'y',
      headerName: 'Y (m)',
      width: 80,
      type: 'number',
    },
    {
      field: 'z',
      headerName: 'Z (m)',
      width: 80,
      type: 'number',
    },
    {
      field: 'ux',
      headerName: 'Ux (m)',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => value?.toFixed(5) || '0',
    },
    {
      field: 'uy',
      headerName: 'Uy (m)',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => value?.toFixed(5) || '0',
    },
    {
      field: 'uz',
      headerName: 'Uz (m)',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => value?.toFixed(5) || '0',
    },
    {
      field: 'rx',
      headerName: 'Rx (rad)',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => value?.toFixed(5) || '0',
    },
    {
      field: 'ry',
      headerName: 'Ry (rad)',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => value?.toFixed(5) || '0',
    },
    {
      field: 'rz',
      headerName: 'Rz (rad)',
      width: 100,
      type: 'number',
      valueFormatter: (value: number) => value?.toFixed(5) || '0',
    },
  ];

  return (
    <Box sx={{ height: '420px', width: '100%', backgroundColor: '#e8e8e8' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        hideFooterSelectedRowCount
        pagination
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        localeText={{
          MuiTablePagination: {
            labelRowsPerPage: 'Nodes per page',
          },
        }}
        sx={{
          height: '420px',
          width: '100%',
          backgroundColor: '#ffffff',
          border: '2px solid #b0b0b0',
          '& .MuiDataGrid-virtualScroller': {
            overflowX: 'hidden !important',
          },
          '& .MuiDataGrid-virtualScrollerContent': {
            overflowX: 'hidden !important',
          },
          '& .MuiDataGrid-main': {
            backgroundColor: '#ffffff',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#e8e8e8 !important',
            borderBottom: '2px solid #b0b0b0',
            color: '#000000',
            fontSize: '0.75rem',
            fontWeight: 700,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#e8e8e8 !important',
            borderRight: '1px solid #b0b0b0',
            color: '#000000 !important',
            '&:last-child': {
              borderRight: 'none',
            },
            '&:focus': {
              backgroundColor: '#e8e8e8 !important',
            },
            '&:focus-within': {
              backgroundColor: '#e8e8e8 !important',
            },
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            color: '#000000 !important',
            fontWeight: 700,
          },
          '& .MuiDataGrid-cell': {
            color: '#000000',
            fontSize: '0.75rem',
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            borderBottom: '1px solid #c0c0c0',
            borderRight: '1px solid #e0e0e0',
            '&:focus': {
              outline: 'none',
            },
            '&:focus-within': {
              outline: 'none',
            },
          },
          '& .MuiDataGrid-row': {
            backgroundColor: '#ffffff',
            '&:nth-of-type(even)': {
              backgroundColor: '#f5f5f5',
            },
            '&:hover': {
              backgroundColor: '#e0e0e0 !important',
            },
            '&.Mui-selected': {
              backgroundColor: '#d0d0d0 !important',
              '&:hover': {
                backgroundColor: '#d0d0d0 !important',
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid #b0b0b0',
            backgroundColor: '#e8e8e8',
            color: '#000000',
            overflow: 'hidden',
            overflowX: 'hidden',
          },
          '& .MuiTablePagination-root': {
            color: '#000000',
            fontSize: '0.75rem',
            fontWeight: 500,
            fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            overflow: 'hidden',
            overflowX: 'hidden',
            width: '100%',
          },
          '& .MuiIconButton-root': {
            color: '#333333',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.12)',
              color: '#000000',
            },
          },
          '& .MuiDataGrid-selectedRowCount': {
            color: '#000000',
            fontWeight: 500,
          },
          '& .MuiDataGrid-scrollbar': {
            '& .MuiDataGrid-scrollbar--vertical': {
              '& .MuiDataGrid-scrollbar--thumb': {
                backgroundColor: '#c0c0c0',
                '&:hover': {
                  backgroundColor: '#999999',
                },
              },
            },
            '& .MuiDataGrid-scrollbar--horizontal': {
              '& .MuiDataGrid-scrollbar--thumb': {
                backgroundColor: '#c0c0c0',
                '&:hover': {
                  backgroundColor: '#999999',
                },
              },
            },
          },
          '& ::-webkit-scrollbar': {
            width: '12px',
            height: '12px',
          },
          '& ::-webkit-scrollbar-track': {
            backgroundColor: '#e8e8e8',
          },
          '& ::-webkit-scrollbar-thumb': {
            backgroundColor: '#c0c0c0',
            borderRadius: '6px',
            '&:hover': {
              backgroundColor: '#999999',
            },
          },
        }}
      />
    </Box>
  );
};

export default Displacements;
