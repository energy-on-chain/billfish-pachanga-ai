import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, InputLabel, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from 'react-toastify';

const DeletePotModal = (props) => {
  const { year } = useParams();
  const { potId, teamId, teamName, totalPotFee, boardSelections } = props.deleteInfo || {};
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if the form is submitted

  const handleClose = () => {
    props.close();
    setIsSubmitting(false); // Reset submission state when closing
    setIsSubmitted(false);  // Reset isSubmitted state when closing
  };

  const delayRefresh = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleDelete = async () => {
    setIsSubmitting(true); // Set the form as submitting
    let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
      ? process.env.REACT_APP_SERVER_URL_STAGING
      : process.env.REACT_APP_SERVER_URL_PRODUCTION;

    try {
      const response = await fetch(`${apiUrl}/api/${year}/admin_delete_pot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ potId: potId, potYear: props.potYear }),
      });

      if (response.ok) {
        toast.success('Pot entry deleted successfully!');
        setIsSubmitted(true); // Set the form as submitted after success
        delayRefresh(); // Refresh the page after the delete action
      } else {
        throw new Error('Error deleting the pot entry.');
      }
    } catch (error) {
      toast.error('Error deleting pot entry.');
    } finally {
      setIsSubmitting(false); // Reset the isSubmitting state
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Delete Pot Entry
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <InputLabel id="team-id-label"><strong>Team ID:</strong>  {teamId}</InputLabel>
          <InputLabel id="team-name-label"><strong>Team Name:</strong>  {teamName}</InputLabel>
          
          <InputLabel id="total-fee-label"><strong>Total Fee:</strong>  {formatCurrency(totalPotFee)}</InputLabel>
          {boardSelections && boardSelections.map((board, index) => (
            <div key={index}>
              <InputLabel>({board.board}: {formatCurrency(board.totalFee)})</InputLabel>
            </div>
          ))}

          {/* Delete button: hides if submitted, shows spinner if submitting */}
          {!isSubmitted ? (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleDelete}
              disabled={isSubmitting} // Disable the button while submitting
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Deleting..." : "Delete Pot Entry"}
            </Button>
          ) : (
            <h3>Submitted!</h3>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePotModal;

