import * as React from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';

function AdminToolbar(props) {
  const { handleOpenAddModal, buttonLabel } = props;

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Align these items to the left */}
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
        <Button color="primary" startIcon={<AddIcon />} onClick={handleOpenAddModal}>
          {buttonLabel}
        </Button>
      </div>
      <div>
        {/* Align this item to the right */}
        <GridToolbarQuickFilter />

      </div>
    </GridToolbarContainer>
  );
}

export default AdminToolbar;

