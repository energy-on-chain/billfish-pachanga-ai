import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Tooltip } from '@mui/material';

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
            backgroundColor: '#288DAF',  
          },
          // Ensure search and filter icons section gets the correct color
          '.MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'center',
            backgroundColor: '#288DAF',  // Set your desired background color
            fontSize: '16px',
            color: 'white',
          },
          // Correct class to target the filter/search icons background
          '.MuiDataGrid-iconButtonContainer': {
            backgroundColor: '#288DAF !important',  // Ensure it's applied with `!important`
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
            backgroundColor: '#288DAF',
            fontSize: '16px',
            color: 'white'
          },
          '& .MuiDataGrid-cell': {
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '16px',
          },
        }}
        density='compact'
        hideFooter={props.hideFooter} // Hide footer if specified
        pagination={props.pagination} // Enable pagination if specified
        pageSize={props.pageSize || 100} // Set default page size
        rowsPerPageOptions={props.pageSizeOptions || [100]} // Page size options
        // disableColumnMenu
        autoHeight
      />
    </div>
  );
}

export default CountTable;

