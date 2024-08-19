import React, { useState, useEffect } from 'react';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const AdminDeleteModal = (props) => {
  
  // STATE
  const [info, setInfo] = useState(null);

  // INITIALIZE
  useEffect(() => {
    console.log('In AdminDeleteModal component...');
    setInfo(props.deleteInfo);
  }, [props.deleteInfo]);

  // HELPERS
  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  }

  const handleClose = () => {
    props.close();
  }

  const handleDelete = async () => {

    try {

      // select environment
      let apiUrl = null;
      if (process.env.REACT_APP_NODE_ENV === "staging") {
        apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
      } else if (process.env.REACT_APP_NODE_ENV === "production") {
        apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
      }

      // select api endpoint
      let url;
      if (props.tableType === "Teams") {
        url = "admin_delete_team";
      } else if (props.tableType === "Catches") {
        url = "admin_delete_team";
      } else if (props.tableType === "Pots") {
        url = "admin_delete_pot";
      } else if (props.tableType === "Auction") {
        url = "admin_delete_auction_item";
      }

      // fetch
      const response = await fetch(`${apiUrl}/api/${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: info.teamId, // FIXME: need to extract the corresponding "id" field for this...
          teamYear: props.teamYear,
          catchYear: props.catchYear,
          potYear: props.potYear,
          auctionYear: props.auctionYear,
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast.success(`The ${props.tableType} database entry was successfully deleted! Redirecting...`);
      delayRefresh();
    } catch (error) {
      console.log(`There was an error while attempting to delete this ${props.tableType} database entry: ` + error);
      toast.error(`There was an error while attempting to delete this ${props.tableType} database entry. Page will refresh now. Please try again.`);
    }
  }

  return (
    <div>
      { info &&
        <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
          <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>

            <DialogTitle>Delete {props.year} {props.tableStyle} Database Entry<IconButton onClick={handleClose} style={{float:'right'}}><CloseIcon color="primary"></CloseIcon></IconButton></DialogTitle>
            <DialogContent>
              <Stack spacing={2} margin={2}>

                {/* Dynamically rendering all key-value pairs */}
                {Object.keys(info).map((key) => (
                  <InputLabel key={key} id={`${key}-label`}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {info[key].toString()}
                  </InputLabel>
                ))}

                <br/>
                <InputLabel style={{ fontWeight: 'bold', color: 'red' }}>Are you sure? Associated information will also be deleted.</InputLabel>
                <Button color="primary" variant="contained" onClick={handleDelete}>Yes, Delete</Button>

              </Stack>
            </DialogContent>
          </form>
        </Dialog>
      }
    </div>
  );
};

export default AdminDeleteModal;


