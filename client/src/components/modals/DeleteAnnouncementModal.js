import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, InputLabel } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeleteAnnouncementModal = (props) => {
  const [announcementInfo, setAnnouncementInfo] = useState(props.deleteInfo);

  useEffect(() => {
    console.log('Deleting announcement:', props.deleteInfo);
    setAnnouncementInfo(props.deleteInfo);
  }, [props.deleteInfo]);

  const handleClose = () => {
    props.close();
  };

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  };

  const handleDelete = async () => {
    try {
      let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
        ? process.env.REACT_APP_SERVER_URL_STAGING
        : process.env.REACT_APP_SERVER_URL_PRODUCTION;

      const response = await fetch(`${apiUrl}/api/admin_delete_announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: announcementInfo.announcementId,
          announcementYear: props.announcementYear, // Pass announcementYear
        }),
      });

      if (response.ok) {
        toast.success('Announcement deleted successfully.');
        delayRefresh();
      } else {
        toast.error('Error deleting announcement.');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement.');
    }
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Delete Announcement
        <IconButton onClick={handleClose} style={{ float: 'right' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} margin={2}>
          <InputLabel><strong>Subject:</strong> {announcementInfo?.subject}</InputLabel>
          <InputLabel><strong>Hyperlink:</strong> {announcementInfo?.hyperlink}</InputLabel>
          <InputLabel><strong>Message:</strong> {announcementInfo?.subtitle}</InputLabel>
          <Button color="primary" variant="contained" onClick={handleDelete}>
            Yes, Delete This Announcement
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAnnouncementModal;

