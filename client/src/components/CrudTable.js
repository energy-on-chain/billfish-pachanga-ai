import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

// import AdminAddModal from './modals/AdminAddModal';
// import AdminEditModal from './modals/AdminEditModal';
// import AdminDeleteModal from './modals/AdminDeleteModal';
import AdminToolbar from './toolbars/AdminToolbar';

import { 
  CONFIG_GENERAL_YEAR,
  CONFIG_FIREBASE_TEAMS_TABLE_NAME,    // Firebase
  CONFIG_FIREBASE_CATCHES_TABLE_NAME,
  CONFIG_FIREBASE_POTS_TABLE_NAME,
  CONFIG_FIREBASE_AUCTION_TABLE_NAME,
} from '../config';

function CrudTable(props) {

  // STATE - STYLING
  const [buttonLabel, setButtonLabel] = useState();
  const [style, setStyle] = useState();
  const [rows, setRows] = useState([]);
  const [tableProperties, setTableProperties] = useState([]);
  const [scroll, setScroll] = useState();
  const [initialState, setInitialState] = useState();
  const [pageSizeOptions, setPageSizeOptions] = useState();

  // STATE - DATA
  const [editInfo, setEditInfo] = useState();
  const [isEditModalOpen, setIsEditModalOpen] = useState();
  const [deleteInfo, setDeleteInfo] = useState();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState();

  // INITIALIZE
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {

    try {
      let updatedColumnList = props.columns.map(columnObject => { return { ...columnObject } });
      updatedColumnList.push(
        {
          field: 'actions',
          type: 'actions',
          headerName: 'Actions',
          headerClassName: 'super-app-theme--header',
          width: 100,
          cellClassName: 'actions',
          getActions: ({ id }) => {
            return [
              <GridActionsCellItem
                icon={<EditIcon />}
                label="Edit"
                className="textPrimary"
                onClick={() => handleEdit(id)}
                color="inherit"
              />,
              <GridActionsCellItem
                icon={<DeleteIcon />}
                label="Delete"
                onClick={() => handleDelete(id)}
                color="inherit"
              />,
            ];
          },
        }
      );

      // update state
      setButtonLabel(props.buttonLabel);
      setStyle(props.style);
      setTableProperties(props.setTableProperties);
      setScroll(props.scroll);
      setInitialState(props.initialState);
      setRows(props.rows);
      setPageSizeOptions(props.pageSizeOptions);

    } catch (error) {
      console.log('There was an error loading the data for the CRUD Table: ' + error);
    }
    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
  }

  // HELPERS
  const handleOpenAddModal = () => {props.openAddModal()};    // Add
  const handleCloseAddModal = () => {props.closeAddModal()};

  const openEditModal = () => {setIsEditModalOpen(true)};    // Edit
  const closeEditModal = () => {
    setEditInfo();
    setIsEditModalOpen(false);
  }
  const handleEdit = async (id) => {
    console.log("Selected row " + id + " to edit. The info is: " + props.rows[id])
    setEditInfo(props.rows[id]);
    openEditModal();
  }

  const openDeleteModal = () => {setIsDeleteModalOpen(true)};    // Delete
  const closeDeleteModal = () => {
    setDeleteInfo();
    setIsDeleteModalOpen(false);
  }
  const handleDelete = async (id) => {
    console.log("Selected row " + id + " to delete. The info is: " + props.rows[id])
    setDeleteInfo(props.rows[id]);
    openDeleteModal();
  }

  return (
    <div style={style}>

      {/* DELETE */}
      {/* { deleteInfo && 
        <AdminDeleteModal 
          tableStyle={props.tableStyle}
          deleteInfo={deleteInfo} 
          status={isDeleteModalOpen} 
          open={openDeleteModal} 
          close={closeDeleteModal} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_FIREBASE_AUCTION_TABLE_NAME} 
        />
      } */}

      {/* EDIT */}
      {/* { editInfo && 
        <AdminEditModal 
          tableStyle={props.tableStyle}
          today={props.today} 
          startDate={props.startDate}
          endDate={props.endDate} 
          editInfo={editInfo} 
          status={isEditModalOpen} 
          open={openEditModal} 
          close={closeEditModal} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_FIREBASE_AUCTION_TABLE_NAME} 
        />
      } */}

      <div style={style}>

        {/* ADD */}
        {/* <AdminAddModal 
          tableStyle={props.tableStyle}
          today={props.today} 
          startDate={props.startDate}
          endDate={props.endDate} 
          status={props.addStatus} 
          open={props.openAddModal} 
          close={props.closeAddModal}  
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_FIREBASE_AUCTION_TABLE_NAME} 
        /> */}

        {/* TABLE */}
        <DataGrid
          VerticalContentAlignment="center"
          rows={rows || []}
          // columns={columns || []}
          // columnVisibilityModel={visibility}
          sx={{
            overflowX: scroll,
            '.MuiDataGrid-row.Mui-odd': {
              backgroundColor: 'rgba(234, 234, 234)',
            },
            '.MuiDataGrid-columnHeaderTitleContainer': {
              backgroundColor: '#288DAF',
              color: 'white',
              fontSize: '16px',
              ".MuiSvgIcon-root": {
                color: "white",
              }
            },
            '& .super-app-theme--header': {
              backgroundColor: '#288DAF',
              color: 'white',
              fontSize: '16px',
            },
            '& .MuiDataGrid-cell': {
              fontSize: '16px',
            },
          }}
          initialState={initialState}
          pageSizeOptions={pageSizeOptions}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'Mui-even' : 'Mui-odd'
          }
          slots={{ toolbar: AdminToolbar }}
          slotProps={{
            toolbar: { handleOpenAddModal, handleCloseAddModal, buttonLabel },
          }}
        />
      </div>
    </div>
  );
}

export default CrudTable;

