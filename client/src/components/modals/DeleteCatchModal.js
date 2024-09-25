import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const DeleteCatchModal = (props) => {
  const { year } = useParams();
  const [catchInfo, setCatchInfo] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);  // New state to track submission
  const [isSubmitted, setIsSubmitted] = useState(false);    // New state to track successful submission

  useEffect(() => {
    console.log('In DeleteCatchModal component...');
    setCatchInfo(props.deleteInfo);
  }, [props.deleteInfo]);

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  };

  const handleClose = () => {
    props.close();
    setIsSubmitting(false);  // Reset state
    setIsSubmitted(false);   // Reset state
  };

  const handleDelete = async () => {
    setIsSubmitting(true); // Start submission

    try {
      let apiUrl = null;
      if (process.env.REACT_APP_NODE_ENV === "staging") {
        apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
      } else if (process.env.REACT_APP_NODE_ENV === "production") {
        apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
      }

      const response = await fetch(`${apiUrl}/api/${year}/admin_delete_catch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catchYear: props.catchYear,
          catchId: props.deleteInfo.catchId
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast.success('The catch was successfully deleted! Redirecting...');
      setIsSubmitted(true);  // Mark as submitted
      delayRefresh();
    } catch (error) {
      console.log('There was an error while attempting to delete this database entry: ' + error);
      toast.error('There was an error while attempting to delete the catch. Page will refresh now. Please try again.');
      setIsSubmitting(false); // Reset submission state if failed
    }
  };

  const formatLocalDateTime = (utcDateTime) => {
    const dateObj = new Date(utcDateTime);
    const localDate = dateObj.toLocaleDateString(); // Convert to local date string
    const localTime = dateObj.toLocaleTimeString(); // Convert to local time string
    return { localDate, localTime };
  };

  return (
    <div>
    { catchInfo &&
      <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
        <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); }}>
          <DialogTitle>Delete {props.year} Catch<IconButton onClick={handleClose} style={{float:'right'}}><CloseIcon color="primary" /></IconButton></DialogTitle>
          <DialogContent>
              <Stack spacing={2} margin={2}>
                <div>
                  <InputLabel id="catch-id-label"><strong>Catch ID:</strong>  {catchInfo["catchId"]}</InputLabel>
                  <InputLabel id="species-label"><strong>Species:</strong>  {catchInfo["species"]}</InputLabel>
                  <InputLabel id="species-type-label"><strong>Type:</strong>  {catchInfo["speciesType"]}</InputLabel>
                  <InputLabel id="name-label"><strong>Team:</strong>  {catchInfo["teamName"]}</InputLabel>
                  <InputLabel id="length-label"><strong>Length:</strong>  {catchInfo["length"]} in</InputLabel>
                  <InputLabel id="girth-label"><strong>Girth:</strong>  {catchInfo["girth"]} in</InputLabel>
                  <InputLabel id="weight-label"><strong>Weight:</strong>  {catchInfo["weight"]} lbs</InputLabel>
                  <InputLabel id="points-label"><strong>Points:</strong>  {catchInfo["points"]}</InputLabel>
                  <InputLabel id="date-label"><strong>Date Entered:</strong>  {formatLocalDateTime(catchInfo["dateTime"]).localDate}</InputLabel>
                  <InputLabel id="time-label"><strong>Time Entered:</strong>  {formatLocalDateTime(catchInfo["dateTime"]).localTime}</InputLabel>
                </div>
                <br/>
                
                {/* Submit button */}
                {!isSubmitted ? (
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={handleDelete}
                    disabled={isSubmitting || isSubmitted}  // Disable during submission or after it's submitted
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : null}  // Show spinner while submitting
                  >
                    {isSubmitting ? "Submitting..." : "Yes, Delete This Catch"}
                  </Button>
                ) : (
                  <h3>Submitted!</h3>
                )}
              </Stack>
          </DialogContent>
        </form>
      </Dialog>
    }
  </div>
  );
};

export default DeleteCatchModal;

