import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddAnnouncementModal = (props) => {
  const [subject, setSubject] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {}, []);

  const handleClose = () => {
    setSubject('');
    setHyperlink('');
    setMessage('');
    props.close();
  };

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  };

  const validateUserInput = () => {
    if (!subject) {
      toast.error("Subject cannot be empty.");
      return false;
    }
    if (!message) {
      toast.error("Message cannot be empty.");
      return false;
    }
    return true;
  };

  const handleCreateAnnouncement = async () => {
    if (!validateUserInput()) return;

    try {
      let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
        ? process.env.REACT_APP_SERVER_URL_STAGING
        : process.env.REACT_APP_SERVER_URL_PRODUCTION;

      const newAnnouncement = {
        type: "Announcement",
        title: "-",
        subtitle: message,
        points: "-",
        timestamp: dayjs().toISOString(), // Add timestamp
        subject,
        hyperlink,
      };

      const response = await fetch(`${apiUrl}/api/admin_add_announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAnnouncement,
          announcementYear: props.announcementYear, // Pass announcementYear
        }),
      });

      if (response.ok) {
        toast.success("Announcement created successfully.");
        delayRefresh();
      } else {
        toast.error("Error creating announcement.");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Error creating announcement.");
    }
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="xl">
      <DialogTitle>
        Add {props.year} Announcement
        <IconButton onClick={handleClose} style={{ float: 'right' }}>
          <CloseIcon color="primary" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} margin={2}>
          <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} fullWidth />
          <TextField label="Hyperlink" value={hyperlink} onChange={(e) => setHyperlink(e.target.value)} fullWidth />
          <TextField label="Message" value={message} onChange={(e) => setMessage(e.target.value)} multiline rows={4} fullWidth />
          <Button color="primary" variant="contained" onClick={handleCreateAnnouncement}>
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnnouncementModal;

