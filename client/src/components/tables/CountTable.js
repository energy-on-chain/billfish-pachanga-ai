import React, { useState, useEffect } from 'react';
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Tooltip, Box } from '@mui/material';

import { 
  CONFIG_STYLING_LEADERBOARD_TITLE_TEXT_COLOR,
  CONFIG_STYLING_LEADERBOARD_SUBTITLE_TEXT_COLOR, 
  CONFIG_STYLING_LEADERBOARD_SUBTITLE_FONT_STYLE,
  CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
  CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
  CONFIG_STYLING_TABLE_ODD_ROW_BACKGROUND_COLOR,
  CONFIG_STYLING_TABLE_CELL_TEXT_COLOR,
} from '../../config/stylingConfig';

// Custom Toolbar Component
function QuickSearchToolbar() {
  return (
    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <GridToolbarQuickFilter />
    </Box>
  );
}

function CountTable(props) {   
  const [style, setStyle] = useState();
  const [rows, setRows] = useState();
  const [columns, setColumns] = useState();
  const [visibility, setVisibility] = useState();
  const [scroll, setScroll] = useState();
  const [initialState, setInitialState] = useState();
  const [pageSizeOptions, setPageSizeOptions] = useState();

  useEffect(() => {
    setStyle(props.style);
    setRows(props.rows);
    setColumns(props.columns);
    setVisibility(props.visibility);
    setScroll(props.scroll);
    setInitialState(props.initialState);
    setPageSizeOptions(props.pageSizeOptions);
  }, []);

  return (
    <div style={style}>
      <DataGrid
        rows={props.rows || []}
        columns={props.columns || []}
        columnVisibilityModel={props.visibility}
        slots={{ toolbar: QuickSearchToolbar }}
        sx={{
          overflowX: 'auto',
          '.MuiDataGrid-row': {
            backgroundColor: 'white !important',
            fontSize: '16px',
          },
          '.MuiDataGrid-row.Mui-odd': {
            backgroundColor: 'white !important',
          },
          // Set the background color of the entire column header
          '.MuiDataGrid-columnHeaders': {
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            color: CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
          },
          // Ensure search and filter icons section gets the correct color
          '.MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'center',
            backgroundColor: CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,  // Set your desired background color
            fontSize: '16px',
            color: CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
            ".MuiSvgIcon-root": {
              color: CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
            }
          },
          // Correct class to target the filter/search icons background
          '.MuiDataGrid-iconButtonContainer': {
            backgroundColor: CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR + ' !important',  // Ensure it's applied with `!important`
            color: CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
          },
          '& .MuiDataGrid-cell': {
            justifyContent: 'center',  
            textAlign: 'center',
            fontSize: '16px',
          },
          // Change the color of the icons themselves (filter/search buttons)
          '.MuiSvgIcon-root': {
            // color: 'white !important',  // Ensure icon color is white
          },
          '& .super-app-theme--header': {
            justifyContent: 'center',
            backgroundColor: CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            fontSize: '16px',
            color: 'white'
          },
          '& .MuiDataGrid-cell': {
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '16px',
            color: CONFIG_STYLING_TABLE_CELL_TEXT_COLOR,
          },
        }}
        density='compact'
        hideFooter={props.hideFooter} // Hide footer if specified
        pagination={props.pagination} // Enable pagination if specified
        pageSize={props.pageSize || 100} // Set default page size
        rowsPerPageOptions={props.pageSizeOptions || [100]} // Page size options
        autoHeight
      />
    </div>
  );
}

export default CountTable;
