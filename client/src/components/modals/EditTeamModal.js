import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Select, MenuItem, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const EditTeamModal = (props) => {

  // STATE
  const { year } = useParams();
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(null);
  const [originalImages, setOriginalImages] = useState({}); 
  const [newImages, setNewImages] = useState({}); 
  const [duplicateNameList, setDuplicateNameList] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const [isSubmitted, setIsSubmitted] = useState(false); // Track if form was submitted

  // INITIALIZE
  useEffect(() => {
    fetchData();
    setTeamName(props.editInfo['teamName']);
    setEmail(props.editInfo['teamEmail']);
    setPhone(props.editInfo['teamPhone']);
    setHasCheckedIn(props.editInfo['hasCheckedIn']);
    initializeImages(props.editInfo); // Initialize image previews when modal opens
  }, [props.editInfo]);

  const fetchData = async () => {
    try {
      let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
        ? process.env.REACT_APP_SERVER_URL_STAGING
        : process.env.REACT_APP_SERVER_URL_PRODUCTION;

      // Fetch current year's team names for duplicate check
      const response = await fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName: `teams${year}` }), // Fetching the current year team list
      });

      const data = await response.json();
      const currentYearTeamNames = Object.keys(data).map(teamKey => data[teamKey].teamName); // Assuming team names are under 'teamName'

      // Set the list of duplicate names for validation
      setDuplicateNameList(currentYearTeamNames);
    } catch (error) {
      console.error("Error fetching team names:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // HANDLERS
  const initializeImages = (data) => {
    const previews = {};
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if (typeof value === 'string' && value.startsWith('https://storage.googleapis.com/')) {
        previews[key] = {
          file: null,
          fieldName: key,
          url: value,
          fileName: null,
          fileExtension: null,
        };
      }
    });
  
    const nonRequiredImageFields = props?.editInfo?.nonRequiredImageFields || [];
    nonRequiredImageFields.forEach((field) => {
      if (!previews[field]) {
        previews[field] = {
          file: null,
          fieldName: field,
          url: '',
          fileName: null,
          fileExtension: null,
        };
      }
    });
  
    setOriginalImages(previews);
  };

  const handleClose = () => {
    setTeamName('');
    setEmail('');
    setPhone('');
    setHasCheckedIn(null);
    setOriginalImages({});
    setNewImages({});
    setDuplicateNameList([]);
    setIsSubmitting(false);
    setIsSubmitted(false);
    props.close();
  };

  const delayRefresh = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

  const validatePhone = (phone) => {
    return phone.match(
      /^(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/
    );
  };

  const validateUserInput = () => {
    if (isLoading) {
      toast.warning("Please wait while the team data is loading.");
      return false;
    }

    let inputIsValid = true;

    if(!teamName) {
      toast.warning("Please enter a team name.");
      inputIsValid = false;
      return false;
    }

    // Check for duplicate team names, but ignore if it's the original name
    if (teamName !== props.editInfo['teamName'] && duplicateNameList.includes(teamName)) {
      toast.warning("This team name is already registered. Please choose another name.");
      inputIsValid = false;
      return false;
    }

    if (!validateEmail(email)) {
      toast.warning('Please enter a valid email address (e.g. person@email.com)');
      inputIsValid = false;
      return false;
    }

    if (!validatePhone(phone)) {
      toast.warning('Please enter a valid phone number (e.g. 123-456-7890, +1 123-456-7890, etc.)');
      inputIsValid = false;
      return false;
    }

    return inputIsValid;
  };

  const handleImageChange = (e, fieldName) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const newFile = new File([file], fieldName, {
        type: file.type,
      });
  
      setNewImages((prevImages) => ({
        ...prevImages,
        [fieldName]: {
          file: newFile,
          fieldName: fieldName,
          url: URL.createObjectURL(newFile),
          fileName: fieldName,
          fileExtension: fileExtension,
        },
      }));
    }
  };

  const handleEdit = async () => {
    if (validateUserInput()) {
      setIsSubmitting(true); // Set submitting state
      try {
        let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
          ? process.env.REACT_APP_SERVER_URL_STAGING
          : process.env.REACT_APP_SERVER_URL_PRODUCTION;

        const formData = new FormData();
        formData.append('potYear', props.potYear);
        formData.append('catchYear', props.catchYear);
        formData.append('teamYear', props.teamYear);
        formData.append('teamId', props.editInfo.teamId);
        formData.append('teamName', teamName);
        formData.append('teamEmail', email);
        formData.append('teamPhone', phone);
        formData.append('hasCheckedIn', JSON.stringify(hasCheckedIn));

        Object.keys(newImages).forEach((fieldName) => {
          formData.append('newImages', newImages[fieldName].file);
        });

        await fetch(`${apiUrl}/api/${year}/admin_edit_team`, {
          method: 'POST',
          body: formData,
        }).then(response => {
          if (response.ok) {
            toast.success('The team and associated data were successfully updated! Redirecting...');
            setIsSubmitted(true); // Mark as submitted
            delayRefresh();
          } else {
            return response.json().then(data => {
              throw new Error(data.error || 'Unknown error');
            });
          }
        }).catch(error => {
          toast.error('There was an error while attempting to update the team: ' + error.message);
          setIsSubmitting(false); // Reset submitting state
        });

      } catch (error) {
        console.log('There was an error while attempting to edit this database entry: ' + error);
        setIsSubmitting(false); // Reset submitting state
      }
    }
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={(e) => { e.preventDefault(); handleClose(); }}>
        <DialogTitle>Edit Team Information<IconButton onClick={handleClose} style={{float:'right'}}><CloseIcon color="primary"></CloseIcon></IconButton></DialogTitle>
        <DialogContent>
          <Stack spacing={2} margin={2}>
            <InputLabel><strong>ID:</strong> {props.editInfo['teamId']}</InputLabel>

            <TextField
              label="Team Name"
              variant="outlined"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Phone"
              variant="outlined"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              required
            />

            <InputLabel id="has-checked-in-label">Has Checked-In?</InputLabel>
            <Select
              labelId="has-checked-in-label"
              value={hasCheckedIn}
              onChange={(e) => setHasCheckedIn(e.target.value === 'true')}
              fullWidth
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>

            <br/>

            {Object.keys(originalImages).map((fieldName, index) => (
              <div key={`non-required-image-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor={`upload-button-${fieldName}`} style={{ cursor: 'pointer', background: '#d3d3d3', padding: '10px 20px', borderRadius: '4px', marginRight: '10px' }}>
                  {originalImages[fieldName]?.url ? `Replace ${fieldName}` : `Upload ${fieldName}`}
                </label>
                <input
                  id={`upload-button-${fieldName}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageChange(e, fieldName)}
                />
                { newImages[fieldName] ? (
                  <img
                    src={newImages[fieldName].url}
                    alt={`${fieldName} Preview`}
                    style={{ maxWidth: '100px', maxHeight: '100px', marginRight: '10px' }}
                  />
                ) : originalImages[fieldName]?.url ? (
                  <img
                    src={originalImages[fieldName].url}
                    alt={`${fieldName} Preview`}
                    style={{ maxWidth: '100px', maxHeight: '100px', marginRight: '10px' }}
                  />
                ) : (
                  <div>No image uploaded yet</div>
                )}
              </div>
            ))}

            
            
            {/* Submit button */}
            {!isSubmitted ? (
              <Button
                color="primary"
                variant="contained"
                onClick={handleEdit}
                disabled={isSubmitting || isSubmitted} // Disable if submitting or already submitted
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            ) : (
              <h3>Submitted!</h3>
            )}



          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default EditTeamModal;

