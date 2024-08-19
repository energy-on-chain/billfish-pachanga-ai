import * as React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport
} from '@mui/x-data-grid';

function AdminToolbar(props) {

  const { handleOpenAddModal, handleCloseAddModal, buttonLabel } = props;

  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
      <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
        {buttonLabel}
      </Button>
    </GridToolbarContainer>
  );
}

export default AdminToolbar;

