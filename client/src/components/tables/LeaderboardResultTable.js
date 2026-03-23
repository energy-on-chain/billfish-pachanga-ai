import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import './LeaderboardResultTable.css';
import { loadConfigForYear } from '../../config/masterConfig';

function MobileCardList({ rows, columns, config }) {
  if (!rows || rows.length === 0) return null;

  const [placeCol, teamCol, ...restCols] = columns;

  const formatValue = (col, row) => {
    const val = row[col.field];
    if (col.isDateTime) return val ? dayjs(val).format('MMM D @ h:mm A') : '—';
    return val ?? '—';
  };

  return (
    <div className="mobile-card-list">
      {rows.map((row) => (
        <div key={row.id} className="mobile-result-card">
          <div
            className="mobile-card-rank"
            style={{ backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR, color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR }}
          >
            {row[placeCol?.field] ?? '—'}
          </div>
          <div className="mobile-card-body">
            <div className="mobile-card-team" style={{ color: config.stylingConfig.CONFIG_STYLING_TABLE_CELL_TEXT_COLOR }}>
              {row[teamCol?.field] ?? '—'}
            </div>
            {restCols.length > 0 && (
              <div className="mobile-card-stats">
                {restCols.map((col) => (
                  <div key={col.field} className="mobile-card-stat">
                    <span className="mobile-card-label">{col.headerName}</span>
                    <span className="mobile-card-value" style={{ color: config.stylingConfig.CONFIG_STYLING_TABLE_CELL_TEXT_COLOR }}>
                      {formatValue(col, row)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardResultTable(props) {
  const { year } = useParams();
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const loadConfigs = async () => {
      const loadedConfig = await loadConfigForYear(year);
      setConfig(loadedConfig);
    };
    loadConfigs();
  }, [year]);

  if (!config) return <div>Loading...</div>;

  const formattedColumns = props.columns.map((col) => {
    if (col.isDateTime) {
      return { ...col, valueFormatter: (params) => dayjs(params).format('MMMM Do, YYYY @ hh:mm A') };
    }
    return col;
  });

  return (
    <div style={{ ...props.style, overflowX: (props.isMobile || props.useCards) ? 'hidden' : 'auto' }}>
      <h1 style={{ fontSize: '26px', color: config.stylingConfig.CONFIG_STYLING_LEADERBOARD_TITLE_TEXT_COLOR, marginBottom: '16px' }}>
        {props.title}
        {props.subtitle && (
          <span style={{ fontSize: '22px', fontStyle: config.stylingConfig.CONFIG_STYLING_LEADERBOARD_SUBTITLE_FONT_STYLE, fontWeight: 'lighter', marginLeft: '10px', color: config.stylingConfig.CONFIG_STYLING_LEADERBOARD_SUBTITLE_TEXT_COLOR }}>
            ({props.subtitle})
          </span>
        )}
      </h1>

      {(props.isMobile || props.useCards) ? (
        <MobileCardList rows={props.rows} columns={props.columns} config={config} />
      ) : (
        <DataGrid
          rows={props.rows || []}
          columns={formattedColumns}
          columnVisibilityModel={props.visibility}
          sx={{
            overflowX: 'auto',
            '.MuiDataGrid-row.Mui-odd': {
              backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_ODD_ROW_BACKGROUND_COLOR,
              fontSize: '16px',
            },
            '.MuiDataGrid-columnHeaderTitleContainer': {
              backgroundColor: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_BACKGROUND_COLOR,
              fontSize: '16px',
              color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR,
              '.MuiSvgIcon-root': { color: config.stylingConfig.CONFIG_STYLING_TABLE_HEADER_TEXT_COLOR },
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
          hideFooter
          density="compact"
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd'
          }
          disableColumnMenu
          disableColumnFilter
          disableColumnSelector
          disableColumnSorting
        />
      )}
      <br />
      <br />
    </div>
  );
}

export default React.memo(LeaderboardResultTable);
