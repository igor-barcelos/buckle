import { useState } from 'react';
import {
  Box,
  Button,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowsProp,
  GridActionsCellItem,
  GridRowId,
  GridRowModesModel,
  GridRowModes,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { useModel } from '../../../model/Context';
import { ElasticIsotropicMaterial } from '../../../types';

interface MaterialsProps {
  open: boolean;
  onClose: () => void;
  selectedMaterial?: ElasticIsotropicMaterial | null;
}

const Materials = observer(({}: MaterialsProps) => {
  const model = useModel();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  
  const rows: GridRowsProp = model?.materials.map((material) => ({
    id: material.id,
    name: material.name || '',
    E: material.E,
    nu: material.nu,
    rho: material.rho || 0,
  })) || [];

  const handleAdd = () => {
    const newMaterial: ElasticIsotropicMaterial = {
      id: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER) % 0x80000000,
      name: `Material ${model.materials.length + 1}`,
      E: 200e9, // Default steel
      nu: 0.3,
      rho: 7850,
    };
    model.materials.push(newMaterial);
  };

  const handleDelete = (id: GridRowId) => () => {
    const index = model.materials.findIndex((m) => m.id === id);
    if (index !== -1) {
      model.materials.splice(index, 1);
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = (row: GridRowModel) => {
    const material = model.materials.find((m) => m.id === row.id);
    if (material) {
      material.name = row.name || material.name;
      material.E = Number(row.E);
      material.nu = Number(row.nu);
      material.rho = Number(row.rho) || undefined;
    }
    return row;
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 150,
      flex: 1,
      editable: true,
    },
    {
      field: 'E',
      headerName: 'E (Pa)',
      width: 120,
      editable: true,
      valueFormatter: (value: number) => {
        if (value == null) return '';
        return value.toExponential(2);
      },
    },
    {
      field: 'nu',
      headerName: 'ν',
      width: 80,
      editable: true,
    },
    {
      field: 'rho',
      headerName: 'ρ (kg/m³)',
      width: 110,
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const onEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (onEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: '#4caf50',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              sx={{
                color: '#f44336',
              }}
              onClick={handleCancelClick(id)}
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDelete(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: '100%', width: '100%', p: 2, backgroundColor: '#000000', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={handleAdd}
          sx={{
            minWidth: 'auto',
            width: '30px',
            height: '30px',
            padding: 0,
            borderRadius: '50%',
            borderColor: '#ffffff',
            color: '#ffffff',
            '&:hover': {
              borderColor: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <AddIcon sx={{ fontSize: 14 }} />
        </Button>
      </Box>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        disableRowSelectionOnClick
        disableColumnSelector
        disableColumnFilter
        disableColumnMenu
        hideFooterSelectedRowCount
        localeText={{
          MuiTablePagination: {
            labelRowsPerPage: 'Materials for page',
          },
        }}
      />
    </Box>
  );
});

export default Materials;

