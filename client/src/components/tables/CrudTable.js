import React, { useState, useEffect } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import dayjs from 'dayjs';

import AddTeamModal from '../modals/AddTeamModal';
import EditTeamModal from '../modals/EditTeamModal';
import DeleteTeamModal from '../modals/DeleteTeamModal';

import AddCatchModal from '../modals/AddCatchModal';
import EditCatchModal from '../modals/EditCatchModal';
import DeleteCatchModal from '../modals/DeleteCatchModal';

import AddAnnouncementModal from '../modals/AddAnnouncementModal';
import EditAnnouncementModal from '../modals/EditAnnouncementModal';
import DeleteAnnouncementModal from '../modals/DeleteAnnouncementModal';

import AdminToolbar from '../toolbars/AdminToolbar';

import defaultNoImage from '../../images/defaultNoImage.png';

import {
  CONFIG_GENERAL_YEAR,
  CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME,    // Firebase
  CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME,
  CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME,
} from '../../config/generalConfig';

import { 
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS,
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES,
  CONFIG_ADMIN_TABLE_PROPERTIES_FOR_ANNOUNCEMENTS,
} from '../../config/adminConfig';

function CrudTable(props) {

  // STATE - STYLING
  const [buttonLabel, setButtonLabel] = useState();
  const [style, setStyle] = useState();
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [tableProperties, setTableProperties] = useState([]);
  const [scroll, setScroll] = useState();
  const [initialState, setInitialState] = useState();
  const [pageSizeOptions, setPageSizeOptions] = useState();
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // STATE - DATA
  const [editInfo, setEditInfo] = useState();
  const [isEditModalOpen, setIsEditModalOpen] = useState();
  const [deleteInfo, setDeleteInfo] = useState();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState();

  // INITIALIZE
  useEffect(() => {

    let rawColumns;
    if (props.tableType === "Teams") {
      rawColumns = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_TEAMS;
    } else if (props.tableType === "Catches") {
      rawColumns = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_CATCHES;
    } else if (props.tableType === "Announcements") {
      rawColumns = CONFIG_ADMIN_TABLE_PROPERTIES_FOR_ANNOUNCEMENTS;
    }

    loadAllData(rawColumns);

  }, []);

  const loadAllData = async (rawColumns) => {

    try {

      // Parse columns
      const updatedColumnList = rawColumns.map(columnObject => {
        const updatedColumn = { ...columnObject };

        // Set visibility
        setColumnVisibilityModel(prev => ({
          ...prev,
          [columnObject.field]: columnObject.isVisible
        }));

        // Set width
        const screenWidth = window.innerWidth;
        if (screenWidth <= 750) { // Mobile width
          updatedColumn.width = columnObject.width || 150; // Set width
          delete updatedColumn.flex; // Ensure no flex property on mobile
        } else if (screenWidth <= 1024) { // Tablet width
          updatedColumn.width = columnObject.width || 200; // Set width
          delete updatedColumn.flex; // Ensure no flex property on tablet
        } else { // Desktop and larger
          updatedColumn.flex = columnObject.flex || 1; // Set flex
          delete updatedColumn.width; // Ensure no width property on desktop
        }

        // Apply value formatters
        if (columnObject.isImage) {
          updatedColumn.renderCell = (params) => {
            const imageUrl = params.value || defaultNoImage; // Fallback to defaultNoImage if no image is available
        
            return (
              <img
                src={imageUrl}
                alt="Thumbnail"
                style={{ width: '50px', height: '50px', objectFit: 'cover' }} // Thumbnail size
                onError={(e) => {
                  // In case there's an error loading the image, fall back to the default image
                  e.target.src = defaultNoImage;
                }}
              />
            );
          };
        }

        if (columnObject.isDateTime) {
          updatedColumn.valueFormatter = (value) => {
            return dayjs(value).format('hh:mm A, MMM Do YYYY'); 
          };
        }

        if (columnObject.isCurrency) {
          updatedColumn.valueFormatter = (value) => {
            if (value == null) return ''; // Check if value is null or undefined
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD', // You can replace 'USD' with the desired currency code
            }).format(value);
          };
        }

        if (columnObject.isAddOnCharge) {
          updatedColumn.valueFormatter = (value) => {
            if (value == null) return ''; // Check if value is null or undefined
            return value.quantityPurchased;
          };
        }
        
        if (columnObject.isAddOnCharge && columnObject.isCurrency) {
          updatedColumn.valueFormatter = (value) => {
            if (value == null) return ''; // Check if value is null or undefined
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD', // You can replace 'USD' with the desired currency code
            }).format(value.price);
          };
        }

        return updatedColumn;
      });

      // Add actions column
      updatedColumnList.push({
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
      });

      // Update state
      setButtonLabel(props.buttonLabel);
      setStyle(props.style);
      setTableProperties(props.tableProperties);
      setScroll(props.scroll);
      setInitialState(props.initialState);
      setRows(props.rows);
      setColumns(updatedColumnList);
      setPageSizeOptions(props.pageSizeOptions);

    } catch (error) {
      console.log('There was an error loading the data for the CRUD Table: ' + error);
    }

    setIsDeleteModalOpen(false);
    setIsEditModalOpen(false);
  };

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
      { (deleteInfo && props.tableType === "Teams") && 
        <DeleteTeamModal 
          tableType={props.tableType}
          tableProperties={tableProperties}
          deleteInfo={deleteInfo} 
          status={isDeleteModalOpen} 
          open={openDeleteModal} 
          close={closeDeleteModal} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
          announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
        />
      }
      { (deleteInfo && props.tableType === "Catches") && 
        <DeleteCatchModal 
          tableType={props.tableType}
          tableProperties={tableProperties}
          deleteInfo={deleteInfo} 
          status={isDeleteModalOpen} 
          open={openDeleteModal} 
          close={closeDeleteModal} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
          announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
        />
      }
      { (deleteInfo && props.tableType === "Announcements") && 
        <DeleteAnnouncementModal 
          tableType={props.tableType}
          tableProperties={tableProperties}
          deleteInfo={deleteInfo} 
          status={isDeleteModalOpen} 
          open={openDeleteModal} 
          close={closeDeleteModal} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
          announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
        />
      }

      {/* EDIT */}
      { (editInfo && props.tableType === "Teams") && 
        <EditTeamModal 
          tableType={props.tableType}
          tableProperties={tableProperties}
          editInfo={editInfo} 
          status={isEditModalOpen} 
          open={openEditModal} 
          close={closeEditModal} 
          startDate={props.startDate}
          endDate={props.endDate} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
          announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
        />
      }
      { (editInfo && props.tableType === "Catches") && 
        <EditCatchModal 
          tableType={props.tableType}
          tableProperties={tableProperties}
          editInfo={editInfo} 
          status={isEditModalOpen} 
          open={openEditModal} 
          close={closeEditModal} 
          startDate={props.startDate}
          endDate={props.endDate} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
          announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
        />
      }
      { (editInfo && props.tableType === "Announcements") && 
        <EditAnnouncementModal 
          tableType={props.tableType}
          tableProperties={tableProperties}
          editInfo={editInfo} 
          status={isEditModalOpen} 
          open={openEditModal} 
          close={closeEditModal} 
          startDate={props.startDate}
          endDate={props.endDate} 
          year={CONFIG_GENERAL_YEAR} 
          teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
          catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
          potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
          auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
          announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
        />
      }

      <div style={style}>

        {/* ADD */}
        { (props.tableType === "Teams") && 
          <AddTeamModal 
            isAdmin={true}
            tableStyle={props.tableStyle}
            today={props.today} 
            startDate={props.startDate}
            endDate={props.endDate} 
            status={props.addStatus} 
            open={props.openAddModal} 
            close={props.closeAddModal}  
            year={CONFIG_GENERAL_YEAR} 
            teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
            catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
            potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
            auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
            announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
          />
        }
        { (props.tableType === "Catches") && 
          <AddCatchModal 
            isAdmin={true}
            tableStyle={props.tableStyle}
            today={props.today} 
            startDate={props.startDate}
            endDate={props.endDate} 
            status={props.addStatus} 
            open={props.openAddModal} 
            close={props.closeAddModal}  
            year={CONFIG_GENERAL_YEAR} 
            teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
            catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
            potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
            auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
            announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
          />
        }
        { (props.tableType === "Announcements") && 
          <AddAnnouncementModal 
            isAdmin={true}
            tableStyle={props.tableStyle}
            today={props.today} 
            startDate={props.startDate}
            endDate={props.endDate} 
            status={props.addStatus} 
            open={props.openAddModal} 
            close={props.closeAddModal}  
            year={CONFIG_GENERAL_YEAR} 
            teamYear={CONFIG_GENERAL_FIREBASE_TEAMS_TABLE_NAME} 
            catchYear={CONFIG_GENERAL_FIREBASE_CATCHES_TABLE_NAME} 
            potYear={CONFIG_GENERAL_FIREBASE_POTS_TABLE_NAME} 
            auctionYear={CONFIG_GENERAL_FIREBASE_AUCTION_TABLE_NAME} 
            announcementYear={CONFIG_GENERAL_FIREBASE_ANNOUNCEMENTS_TABLE_NAME}
          />
        }

        {/* TABLE */}
        <DataGrid
          VerticalContentAlignment="center"
          rows={rows || []}
          columns={columns || []}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
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

