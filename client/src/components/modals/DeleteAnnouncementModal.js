import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, InputLabel, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeleteAnnouncementModal = (props) => {
  const { year } = useParams();
  const [announcementInfo, setAnnouncementInfo] = useState(props.deleteInfo);
  const [isSubmitting, setIsSubmitting] = useState(false);  // Track if form is being submitted
  const [isSubmitted, setIsSubmitted] = useState(false);    // Track if form was successfully submitted

  useEffect(() => {
    console.log('Deleting announcement:', props.deleteInfo);
    setAnnouncementInfo(props.deleteInfo);
  }, [props.deleteInfo]);

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

  const handleDelete = async () => {
    setIsSubmitting(true);  // Start submission

    try {
      let apiUrl = import.meta.env.VITE_NODE_ENV === "staging"
        ? import.meta.env.VITE_SERVER_URL_STAGING
        : import.meta.env.VITE_SERVER_URL_PRODUCTION;

      const response = await fetch(`${apiUrl}/api/${year}/admin_delete_announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: announcementInfo.announcementId,
          announcementYear: props.announcementYear, // Pass announcementYear
        }),
      });

      if (response.ok) {
        toast.success('Announcement deleted successfully.');
        setIsSubmitted(true);  // Mark as submitted
        delayRefresh();
      } else {
        toast.error('Error deleting announcement.');
        setIsSubmitting(false);  // Reset submission state if failed
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Error deleting announcement.');
      setIsSubmitting(false);  // Reset submission state if failed
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

          {/* Submit button */}
          {!isSubmitted ? (
            <Button
              color="primary"
              variant="contained"
              onClick={handleDelete}
              disabled={isSubmitting || isSubmitted}  // Disable during submission or after it's submitted
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}  // Show spinner while submitting
            >
              {isSubmitting ? "Submitting..." : "Yes, Delete This Announcement"}
            </Button>
          ) : (
            <h3>Submitted!</h3>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAnnouncementModal;

