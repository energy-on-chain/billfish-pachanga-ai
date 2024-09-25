import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditAnnouncementModal = (props) => {
  const { year } = useParams();
  const [subject, setSubject] = useState(props.editInfo?.subject || '');
  const [hyperlink, setHyperlink] = useState(props.editInfo?.hyperlink || '');
  const [message, setMessage] = useState(props.editInfo?.subtitle || '');
  const [isSubmitting, setIsSubmitting] = useState(false);  // Track if form is being submitted
  const [isSubmitted, setIsSubmitted] = useState(false);    // Track if form was successfully submitted

  useEffect(() => {
    console.log('Editing announcement:', props.editInfo);
  }, [props.editInfo]);

  const handleClose = () => {
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

  const handleEdit = async () => {
    if (!validateUserInput()) return;

    setIsSubmitting(true);  // Start submission

    try {
      let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
        ? process.env.REACT_APP_SERVER_URL_STAGING
        : process.env.REACT_APP_SERVER_URL_PRODUCTION;

      const updatedAnnouncement = {
        announcementId: props.editInfo.announcementId,
        type: props.editInfo.type,
        title: props.editInfo.title,
        subtitle: message,
        subject: subject,
        points: props.editInfo.points,
        timestamp: props.editInfo.timestamp,
        hyperlink: hyperlink,
      };

      const response = await fetch(`${apiUrl}/api/${year}/admin_edit_announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedAnnouncement,
          announcementYear: props.announcementYear, // Pass announcementYear
        }),
      });

      if (response.ok) {
        toast.success('Announcement updated successfully!');
        setIsSubmitted(true);  // Mark as submitted
        delayRefresh();
      } else {
        toast.error('Error updating announcement.');
        setIsSubmitting(false);  // Reset submission state if failed
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast.error('Error updating announcement.');
      setIsSubmitting(false);  // Reset submission state if failed
    }
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Edit {props.year} Announcement
        <IconButton onClick={handleClose} style={{ float: 'right' }}>
          <CloseIcon />
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
              onClick={handleEdit}
              disabled={isSubmitting || isSubmitted}  // Disable during submission or after it's submitted
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}  // Show spinner while submitting
            >
              {isSubmitting ? "Submitting..." : "Update Announcement"}
            </Button>
          ) : (
            <h3>Submitted!</h3>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default EditAnnouncementModal;

