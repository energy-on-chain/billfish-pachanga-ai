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
import { useTheme, useMediaQuery } from '@mui/material';

function AdminToolbar(props) {
  const { handleOpenAddModal, buttonLabel } = props;
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen size is mobile

  return (
    <GridToolbarContainer style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Conditionally show these buttons on tablet and desktop */}
        {!isMobile && (
          <>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
          </>
        )}
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
