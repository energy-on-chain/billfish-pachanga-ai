import React, { useState, useEffect } from 'react';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Select, MenuItem } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const EditTeamModal = (props) => {

  // STATE
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(null);
  const [originalImages, setOriginalImages] = useState({}); 
  const [newImages, setNewImages] = useState({}); 

  // INITIALIZE
  useEffect(() => {
    console.log('In EditTeamModal component...');
    console.log(props.editInfo);
    setTeamName(props.editInfo['teamName']);
    setEmail(props.editInfo['teamEmail']);
    setPhone(props.editInfo['teamPhone']);
    setHasCheckedIn(props.editInfo['hasCheckedIn']);
    initializeImages(props.editInfo); // Initialize image previews when modal opens
  }, [props.editInfo]);

  // HANDLERS
  const initializeImages = (data) => {
    const previews = {};
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string' && data[key].startsWith('https://storage.googleapis.com/')) {
        previews[key] = {
          file: null,    // images already stored on firebase are read only
          fieldName: key,
          url: data[key], // Store the image URL as a preview
          fileName: null,    // images already stored on firebase are read only
          fileExtension: null    // images already stored on firebase are read only
        }
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
    props.close();
  }

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  }

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

    let inputIsValid = true;

    if(!teamName) {
      toast.warning("Please enter a team name.");
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
          fileName: fieldName,  // Store the new filename without extension
          fileExtension: fileExtension, // Store the file extension separately
        },
      }));
    }
  };

  const handleEdit = async () => {
    if (validateUserInput()) {
      try {
        let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
          ? process.env.REACT_APP_SERVER_URL_STAGING
          : process.env.REACT_APP_SERVER_URL_PRODUCTION;

        const formData = new FormData();
        formData.append('catchYear', props.catchYear);
        formData.append('teamYear', props.teamYear);
        formData.append('teamId', props.editInfo.teamId);
        formData.append('teamName', teamName);
        formData.append('teamEmail', email);
        formData.append('teamPhone', phone);
        formData.append('hasCheckedIn', JSON.stringify(hasCheckedIn)); // Append as a string, then convert back on the server side

        // Append new images to form data
        console.log('newImages:', newImages)
        Object.keys(newImages).forEach((fieldName) => {
          console.log(fieldName);
          formData.append('newImages', newImages[fieldName].file);
        });

        await fetch(`${apiUrl}/api/admin_edit_team`, {
          method: 'POST',
          body: formData, // Send form data with images and other data
        }).then(response => {
          if (response.ok) {
            toast.success('The team and associated data were successfully updated! Redirecting...');
            delayRefresh();
          } else {
            return response.json().then(data => {
              throw new Error(data.error || 'Unknown error');
            });
          }
        }).catch(error => {
          toast.error('There was an error while attempting to update the team: ' + error.message);
        });

      } catch (error) {
        console.log('There was an error while attempting to edit this database entry: ' + error);
      }
    }
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); handleClose(); } }>
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
                <label htmlFor={`upload-button-${fieldName}`} style={{ cursor: 'pointer', display: 'inline-block', background: '#d3d3d3', color: 'black', padding: '10px 20px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)', marginRight: '10px' }}>
                  Replace {fieldName}
                </label>
                <input
                  id={`upload-button-${fieldName}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageChange(e, fieldName)}
                />
                { newImages[fieldName] ? (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={newImages[fieldName].url}
                      alt={`${fieldName} Preview`}
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginRight: '10px' }}
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={originalImages[fieldName].url}
                      alt={`${fieldName} Preview`}
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginRight: '10px' }}
                    />
                  </div>
                )}
              </div>
            ))}

            <br/>
            <Button color="primary" variant="contained" onClick={handleEdit}>Update Team Info</Button>
          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default EditTeamModal;

