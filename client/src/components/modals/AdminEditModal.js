import React, { useState, useEffect } from 'react';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Select, MenuItem, Grid } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const AdminEditModal = (props) => {

  // STATE
  // FIXME: make these dynamic
  // const [teamName, setTeamName] = useState('');    
  // const [email, setEmail] = useState('');
  // const [phone, setPhone] = useState('');
  // const [hasCheckedIn, setHasCheckedIn] = useState('');
  // const [hasSonar, setHasSonar] = useState('');// STATE
  const [info, setInfo] = useState(null);

  // INITIALIZE
  useEffect(() => {
    console.log('In AdminEditModal component...');
    // FIXME: make these dynamic... detect if something is an email or phone number
    // setTeamName(props.editInfo['teamName']);
    // setEmail(props.editInfo['teamEmail']);
    // setPhone(props.editInfo['teamPhone']);
    // setHasCheckedIn(props.editInfo['hasCheckedIn']);
    // setHasSonar(props.editInfo['hasSonar']);
    setInfo(props.editInfo);
  }, [props.editInfo]);

  // HANDLERS
  const handleClose = () => {
    // FIXME: make these dynamic... detect if something is an email or phone number
    // setTeamName('');
    // setEmail('');
    // setPhone('');
    // setHasCheckedIn('');
    // setHasSonar('');
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

    // FIXME: NO ACTION FOR CHAT GPT HERE... I NEED TO DECIDE WHAT IS REQUIRED FOR EACH TYPE
    // if(!teamName) {
    //   toast.warning("Please enter a team (boat) name");
    //   inputIsValid = false;
    //   return false;
    // }

    if (!validateEmail(email)) {
      toast.warning('Please enter a valid email address.');
      inputIsValid = false;
      return false;
    }

    if (!validatePhone(phone)) {
      toast.warning('Please enter a valid phone number.');
      inputIsValid = false;
      return false;
    }

    return inputIsValid;
  }  

  const handleEdit = async () => {

    if (validateUserInput()) {

      try {

        // set environment
        let apiUrl = null;
        if (process.env.REACT_APP_NODE_ENV === "staging") {
          apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
        } else if (process.env.REACT_APP_NODE_ENV === "production") {
          apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
        }

        // select api endpoint
        let url;
        if (props.tableType === "Teams") {
          url = "admin_edit_team";
        } else if (props.tableType === "Catches") {
          url = "admin_edit_team";
        } else if (props.tableType === "Pots") {
          url = "admin_edit_pot";
        } else if (props.tableType === "Auction") {
          url = "admin_edit_auction_item";
        }
    
        // fetch
        await fetch(`${apiUrl}/api/${url}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            teamYear: props.teamYear,
            catchYear: props.catchYear,
            potYear: props.potYear,
            auctionYear: props.auctionYear,
            // FIXME: make these dynamic... detect if something is an email or phone number
            // teamId: props.editInfo.teamId,
            // teamName: teamName,
            // teamEmail: email,
            // teamPhone: phone,
            // hasCheckedIn: hasCheckedIn,
            // hasSonar: hasSonar
          })
        }).then(response => {
          if (response.ok) {
            toast.success('The team and associated anglers + catches were successfully updated! Redirecting...');
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
  }

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); handleClose(); } }>
        <DialogTitle>Edit Team Information<IconButton onClick={handleClose} style={{float:'right'}}><CloseIcon color="primary"></CloseIcon></IconButton></DialogTitle>
        <DialogContent>
          <Stack spacing={2} margin={2}>
            <InputLabel><strong>Team ID: </strong>  {props.editInfo['teamId']}</InputLabel>
            <InputLabel id="angler-list-label"><strong>Anglers Onboard ({props.editInfo["numAnglers"]} total):</strong></InputLabel>
                {props.editInfo["anglerList"].map((angler, index) => (
                  <InputLabel key={index} id={`angler-${index}`} style={{ fontWeight: 'normal' }}>
                    {angler.firstName} {angler.lastName}
                  </InputLabel>
                ))}
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
              onChange={(e) => setHasCheckedIn(e.target.value)}
              fullWidth
            >
              <MenuItem value={'Yes'}>Yes</MenuItem>
              <MenuItem value={'No'}>No</MenuItem>
            </Select>
            <InputLabel id="has-sonar-label">Using Sonar?</InputLabel>
            <Select
              labelId="has-sonar-label"
              value={hasSonar}
              onChange={(e) => setHasSonar(e.target.value)}
              fullWidth
            >
              <MenuItem value={'Yes'}>Yes</MenuItem>
              <MenuItem value={'No'}>No</MenuItem>
            </Select>
            <br/>
            <Button color="primary" variant="contained" onClick={handleEdit}>Update Team Info</Button>
          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AdminEditModal;

