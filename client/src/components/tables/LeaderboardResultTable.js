import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs'; // Ensure you have dayjs installed for date formatting
import './LeaderboardResultTable.css';

function LeaderboardResultTable(props) {
  // Modify columns to apply the valueFormatter dynamically
  const formattedColumns = props.columns.map((col) => {
    if (col.isDateTime) {
      return {
        ...col,
        valueFormatter: (value) => dayjs(value).format('MMMM Do, YYYY @ hh:mm A'),
      };
    }
    return col;
  });

  return (
    <div style={{ ...props.style, overflowX: 'auto' }}>
      <h1 style={{ fontSize: '30px', color: 'black', marginBottom: '20px' }}>
        {props.title} 
        {props.subtitle && (
          <span style={{ fontSize: '24px', fontStyle: 'italic', fontWeight: 'lighter', marginLeft: '10px', color: 'red' }}>
            ({props.subtitle})
          </span>
        )}
      </h1>
      <DataGrid
        rows={props.rows || []}
        columns={formattedColumns}
        columnVisibilityModel={props.visibility}
        sx={{
          overflowX: 'auto',
          '.MuiDataGrid-row.Mui-odd': {
            backgroundColor: 'rgba(234, 234, 234)',
            fontSize: '16px',
          },
          '.MuiDataGrid-columnHeaderTitleContainer': {
            backgroundColor: '#288DAF',
            fontSize: '16px',
            color: 'white',
            ".MuiSvgIcon-root": {
              color: "white",
            }
          },
          '& .super-app-theme--header': {
            backgroundColor: '#288DAF',
            fontSize: '16px',
            color: 'white'
          },
          '& .MuiDataGrid-cell': {
            fontSize: '16px',
          },
        }}
        hideFooter={true}
        density='compact'
        getRowClassName={(params) =>
          params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd'
        }
        disableColumnMenu
        disableColumnFilter
        disableColumnSelector
        disableColumnSorting
      />
      <br />
      <br />
    </div>
  );
}

export default LeaderboardResultTable;

