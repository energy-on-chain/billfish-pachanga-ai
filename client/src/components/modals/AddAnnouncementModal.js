import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddAnnouncementModal = (props) => {
  const { year } = useParams();
  const [subject, setSubject] = useState('');
  const [hyperlink, setHyperlink] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);  // Track if form is being submitted
  const [isSubmitted, setIsSubmitted] = useState(false);    // Track if form was successfully submitted

  useEffect(() => {}, []);

  const handleClose = () => {
    setSubject('');
    setHyperlink('');
    setMessage('');
    setIsSubmitting(false);
    setIsSubmitted(false);
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

    setIsSubmitting(true);  // Start submission

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

      const response = await fetch(`${apiUrl}/api/${year}/admin_add_announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newAnnouncement,
          announcementYear: `announcements${year}`, // Pass announcementYear
        }),
      });

      if (response.ok) {
        toast.success("Announcement created successfully.");
        setIsSubmitted(true);  // Mark as submitted
        delayRefresh();
      } else {
        toast.error("Error creating announcement.");
        setIsSubmitting(false);  // Reset submission state if failed
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      toast.error("Error creating announcement.");
      setIsSubmitting(false);  // Reset submission state if failed
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
          
          {/* Submit button */}
          {!isSubmitted ? (
            <Button
              color="primary"
              variant="contained"
              onClick={handleCreateAnnouncement}
              disabled={isSubmitting || isSubmitted}  // Disable during submission or after it's submitted
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}  // Show spinner while submitting
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          ) : (
            <h3>Submitted!</h3>
          )}

        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default AddAnnouncementModal;

