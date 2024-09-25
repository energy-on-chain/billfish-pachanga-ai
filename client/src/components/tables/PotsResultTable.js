import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs'; // Ensure you have dayjs installed for date formatting
import './LeaderboardResultTable.css';
import { loadConfigForYear } from '../../config/masterConfig'; // Import the dynamic config loader

function PotsResultTable(props) {
  const { year } = useParams();
  const [config, setConfig] = useState(null);

  // Load config dynamically based on the year
  useEffect(() => {
    const loadConfigs = async () => {
      const loadedConfig = await loadConfigForYear(year);
      setConfig(loadedConfig);
    };

    loadConfigs();
  }, [year]);

  if (!config) {
    return <div>Loading...</div>; // Loader while configuration is being fetched
  }

  // Find the column labeled 'payout' if it exists
  const payoutColumn = props.columns.find((col) => col.field === 'payout');

  // Calculate total payout if the payout column exists
  const totalPayout = props.rows[0]?.totalPayout || 0;

  // Format the total payout as US currency
  const formattedTotalPayout = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPayout);

  // Modify columns to apply the valueFormatter dynamically
  const formattedColumns = props.columns.map((col) => {
    if (col.isDateTime) {
      return {
        ...col,
        valueFormatter: (params) => dayjs(params).format('MMMM Do, YYYY @ hh:mm A'),
      };
    } else if (col.isCurrency) {
      return {
        ...col,
        valueFormatter: (params) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(params),
      };
    }
    return col;
  });

  return (
    <div style={{ ...props.style, overflowX: 'auto' }}>
      <h1 style={{ fontSize: '30px', color: config.stylingConfig.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR, marginBottom: '20px' }}>
        {props.title} 
        {totalPayout > 0 && (
          <span style={{ fontSize: '30px', marginLeft: '10px' }}>
            - ({formattedTotalPayout} total)
          </span>
        )}
        {props.subtitle && (
          <span style={{ fontSize: '24px', fontStyle: config.stylingConfig.CONFIG_STYLING_POTS_SUBTITLE_FONT_STYLE, fontWeight: 'lighter', marginLeft: '10px', color: config.stylingConfig.CONFIG_STYLING_POTS_SUBTITLE_TEXT_COLOR }}>
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
          '.MuiDataGrid-columnHeaderTitleContainer': {
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            fontSize: '16px',
            color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
            '.MuiSvgIcon-root': {
              color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
            }
          },
          '& .super-app-theme--header': {
            backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
            fontSize: '16px',
            color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
          },
          '& .MuiDataGrid-cell': {
            fontSize: '16px',
            color: config.stylingConfig.CONFIG_STYLING_TABLE_CELL_TEXT_COLOR,
          },
        }}
        hideFooter={true}
        density='compact'
        getRowClassName={(params) => {
          const payoutValue = params.row[payoutColumn?.field] || 0;
          return payoutValue > 0 ? 'winner-row' : 'loser-row';
        }}
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

export default PotsResultTable;

