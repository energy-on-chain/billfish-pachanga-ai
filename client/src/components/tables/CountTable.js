import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid, GridToolbarQuickFilter } from '@mui/x-data-grid';
import { Tooltip, Box } from '@mui/material';
import { loadConfigForYear } from '../../config/masterConfig';
import CircularProgress from '@mui/material/CircularProgress';

// Custom Toolbar Component
function QuickSearchToolbar() {
  return (
    <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end' }}>
      <GridToolbarQuickFilter />
    </Box>
  );
}

function CountTable(props) {
  const { year } = useParams(); 
  const [style, setStyle] = useState();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [visibility, setVisibility] = useState({});
  const [scroll, setScroll] = useState({});
  const [initialState, setInitialState] = useState({});
  const [pageSizeOptions, setPageSizeOptions] = useState([100]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const loadedConfig = await loadConfigForYear(year);
        if (loadedConfig) {
          setConfig(loadedConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
      } finally {
        setLoading(false); // Stop the loading state
      }
    };

    loadConfigs();
  }, [year]);

  useEffect(() => {
    setStyle(props.style);
    setRows(props.rows);
    setColumns(props.columns);
    setVisibility(props.visibility);
    setScroll(props.scroll);
    setInitialState(props.initialState);
    setPageSizeOptions(props.pageSizeOptions);
  }, [props]);

  if (loading) {
    return <CircularProgress />; // Show a loader while config is being loaded
  }

  if (!config) {
    return <div>Error loading configuration</div>; // Handle case where config fails to load
  }

  return (
    <div style={style}>
      <DataGrid
        rows={rows || []}
        columns={columns || []}
        columnVisibilityModel={visibility}
        slots={{ toolbar: QuickSearchToolbar }}
        sx={{
          overflowX: 'auto',
          '.MuiDataGrid-row': {
            backgroundColor: 'white !important',
            fontSize: '16px',
          },
          '.MuiDataGrid-row.Mui-odd': {
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_ODD_ROW_BACKGROUND_COLOR + ' !important',
          },
          '.MuiDataGrid-columnHeaders': {
            justifyContent: 'center',
            textAlign: 'center',
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
          },
          '.MuiDataGrid-columnHeaderTitleContainer': {
            justifyContent: 'center',
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            fontSize: '16px',
            color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
            ".MuiSvgIcon-root": {
              color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
            }
          },
          '.MuiDataGrid-iconButtonContainer': {
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR + ' !important',
            color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
          },
          '& .super-app-theme--header': {
            justifyContent: 'center',
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            fontSize: '16px',
            color: 'white'
          },
          '& .MuiDataGrid-cell': {
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '16px',
            color: config.stylingConfig.CONFIG_STYLING_TABLE_CELL_TEXT_COLOR,
          },
        }}
        density='compact'
        hideFooter={props.hideFooter} // Hide footer if specified
        pagination={props.pagination} // Enable pagination if specified
        pageSize={props.pageSize || 100} // Set default page size
        rowsPerPageOptions={pageSizeOptions || [100]} // Page size options
        autoHeight
      />
    </div>
  );
}

export default CountTable;

