import React, { useState, useEffect } from 'react';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';  // Import dayjs for date-time formatting

const DeleteModal = (props) => {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    setInfo(props.deleteInfo);
    console.log("In DeleteModal, here are the props.tableProperties...");
    console.log(props.tableProperties);
  }, [props.deleteInfo]);

  const delayRefresh = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDateTime = (value) => {
    return dayjs(value).format('MM/DD/YYYY hh:mm A');
  };

  const handleClose = () => {
    props.close();
  }

  const handleDelete = async () => {
    try {
      let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
        ? process.env.REACT_APP_SERVER_URL_STAGING
        : process.env.REACT_APP_SERVER_URL_PRODUCTION;

      if (props.tableType === "Teams") {
        const response = await fetch(`${apiUrl}/api/admin_delete_team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            teamId: info.teamId,
            teamYear: props.teamYear,
            catchYear: props.catchYear,
            potYear: props.potYear,
            auctionYear: props.auctionYear
          })
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        toast.success('The team was successfully deleted! Redirecting...');
        delayRefresh();
      } else if (props.tableType === "Catches") {
        // FIXME: add catches functionality
      } else if (props.tableType === "Pots") {
        // FIXME: add pots functionality
      } else if (props.tableType === "Auction") {
        // FIXME: add auction functionality
      }
    } catch (error) {
      console.log('There was an error while attempting to delete this database entry: ' + error);
      toast.error('There was an error while attempting to delete the team. Page will refresh now. Please try again.');
    }
  }

  // Helper function to convert camelCase to normal word style
  const formatLabel = (camelCaseLabel) => {
    return camelCaseLabel
      .replace(/([A-Z])/g, ' $1')  // Add space before capital letters
      .replace(/^./, str => str.toUpperCase());  // Capitalize the first letter
  };

  return (
    <div>
      {info &&
        <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
          <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); }}>
            <DialogTitle>
              Delete {props.year} {props.tableType}
              <IconButton onClick={handleClose} style={{ float: 'right' }}><CloseIcon color="primary"></CloseIcon></IconButton>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} margin={2}>
                {/* Check if tableProperties is defined and not empty */}
                {props.tableProperties && props.tableProperties.length > 0 
                  ? props.tableProperties
                      .filter(property => property.isVisible)  // Show only visible fields
                      .map((property, index) => {
                        let value = info[property.field];

                        // Handle Add-On Charges for "Teams" table style
                        if (props.tableType === "Teams" && property.isAddOnCharge) {
                          value = value?.quantityPurchased || '0';  // Extract quantityPurchased for add-ons
                        }

                        // Format currency fields
                        if (property.isCurrency) {
                          value = formatCurrency(value);
                        }

                        // Format date-time fields
                        if (property.isDateTime) {
                          value = formatDateTime(value);
                        }

                        return (
                          <InputLabel key={index}>
                            <strong>{formatLabel(property.field)}:</strong> {String(value)}
                          </InputLabel>
                        );
                      })
                  : <InputLabel>No data available to display.</InputLabel>
                }
                <br />
                <InputLabel style={{ fontWeight: 'bold', color: 'red' }}>
                  Are you sure? Associated data will also be deleted.
                </InputLabel>
                <Button color="primary" variant="contained" onClick={handleDelete}>
                  Yes, Delete
                </Button>
              </Stack>
            </DialogContent>
          </form>
        </Dialog>
      }
    </div>
  );
};

export default DeleteModal;

