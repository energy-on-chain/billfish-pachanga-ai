import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import './LeaderboardResultTable.css';
import { loadConfigForYear } from '../../config/masterConfig';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val ?? 0);

function MobileCardList({ rows, columns, config }) {
  if (!rows || rows.length === 0) return null;

  const payoutCol = columns.find((c) => c.isCurrency);
  const [placeCol, teamCol, ...restCols] = columns;

  const formatValue = (col, row) => {
    const val = row[col.field];
    if (col.isDateTime) return val ? dayjs(val).format('MMM D @ h:mm A') : '—';
    if (col.isCurrency) return formatCurrency(val);
    return val ?? '—';
  };

  const payoutField = payoutCol?.field;

  return (
    <div className="mobile-card-list">
      {rows.map((row) => {
        const isWinner = payoutField && (row[payoutField] ?? 0) > 0;
        return (
          <div key={row.id} className={`mobile-result-card${isWinner ? ' mobile-result-card--winner' : ''}`}>
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
                      <span
                        className="mobile-card-value"
                        style={{
                          color: col.isCurrency && isWinner
                            ? '#00a86b'
                            : config.stylingConfig.CONFIG_STYLING_TABLE_CELL_TEXT_COLOR,
                          fontWeight: col.isCurrency && isWinner ? 700 : undefined,
                        }}
                      >
                        {formatValue(col, row)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PotsResultTable(props) {
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

  const payoutColumn = props.columns.find((col) => col.field === 'payout');
  const totalPayout = props.rows[0]?.totalPayout || 0;
  const formattedTotalPayout = formatCurrency(totalPayout);

  const formattedColumns = props.columns.map((col) => {
    if (col.isDateTime) {
      return { ...col, valueFormatter: (params) => dayjs(params).format('MMMM Do, YYYY @ hh:mm A') };
    } else if (col.isCurrency) {
      return { ...col, valueFormatter: (params) => formatCurrency(params) };
    }
    return col;
  });

  return (
    <div style={{ ...props.style, overflowX: 'auto' }}>
      <h1 style={{ fontSize: '26px', color: config.stylingConfig.CONFIG_STYLING_POTS_TITLE_TEXT_COLOR, marginBottom: '16px' }}>
        {props.title}
        {totalPayout > 0 && (
          <span style={{ fontSize: '22px', marginLeft: '10px' }}>
            - ({formattedTotalPayout} total)
          </span>
        )}
        {props.subtitle && (
          <span style={{ fontSize: '20px', fontStyle: config.stylingConfig.CONFIG_STYLING_POTS_SUBTITLE_FONT_STYLE, fontWeight: 'lighter', marginLeft: '10px', color: config.stylingConfig.CONFIG_STYLING_POTS_SUBTITLE_TEXT_COLOR }}>
            ({props.subtitle})
          </span>
        )}
      </h1>

      {props.isMobile ? (
        <MobileCardList rows={props.rows} columns={props.columns} config={config} />
      ) : (
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
          getRowClassName={(params) => {
            const payoutValue = params.row[payoutColumn?.field] || 0;
            return payoutValue > 0 ? 'winner-row' : 'loser-row';
          }}
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

export default React.memo(PotsResultTable);
