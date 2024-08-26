import React, {useState, useEffect } from 'react';
import { InputLabel, Grid, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CloseIcon from "@mui/icons-material/Close"
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

import {
  CONFIG_CATCHES_ROUND_POINTS_DOWN, 
} from '../../config';

const EditCatchModal = (props) => {

  const [day1, setDay1] = useState();
  const [day2, setDay2] = useState();
  const [today, setToday] = useState();
  const [length, setLength] = useState();
  const [girth, setGirth] = useState();
  const [weight, setWeight] = useState();
  const [species, setSpecies] = useState();
  const [speciesType, setSpeciesType] = useState();
  const [points, setPoints] = useState();
  const [dateTime, setDateTime] = useState();
  const [catchId, setCatchId] = useState();

  useEffect(() => {
    console.log('In EditCatchModal component...');
    console.log(props.editInfo);
    setDay1(props.startDate);
    setDay2(props.endDate);
    setToday(props.today);
    setLength(props.editInfo['length']);
    setGirth(props.editInfo['girth']);
    setWeight(props.editInfo['weight']);
    setSpecies(props.editInfo['species']);
    setSpeciesType(props.editInfo['speciesType']);
    setPoints(props.editInfo['points']);
    setDateTime(props.editInfo['dateTime']);
    console.log(props);
  }, []);

  const handleClose = () => {
    setDay1();
    setDay2();
    setToday();
    setLength();
    setGirth();
    setWeight();
    setSpecies();
    setSpeciesType();
    setPoints();
    props.close();
  }

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  }

  const validateUserInput = () => {

    let inputIsValid = true;

    console.log('here are the validation values:')
    console.log(length + ', ' + weight + ', ' + girth + ', ' + dateTime);

    if(!dateTime) {
      toast.warning("Please enter a date and time for the catch");
      inputIsValid = false;
      return false;
    } 

    if (props.editInfo['speciesType'] === "Meatfish" && length <= 0) {
      toast.warning("Please enter a length greater than zero for the catch");
      inputIsValid = false;
      return false;
    }

    if (props.editInfo['speciesType'] === "Meatfish" && girth <= 0) {
      toast.warning("Please enter a girth greater than zero for the catch");
      inputIsValid = false;
      return false;
    }

    if (props.editInfo['speciesType'] === "Meatfish" && weight <= 0) {
      toast.warning("Please enter a weight greater than zero for the catch");
      inputIsValid = false;
      return false;
    }

    if (inputIsValid) {
      return true;
    } else {
      return false;
    }

  }  

  const handleEdit = async () => {

    if (validateUserInput()) {

      try {
        let apiUrl = null;
        if (process.env.REACT_APP_NODE_ENV === "staging") {
          apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
        } else if (process.env.REACT_APP_NODE_ENV === "production") {
          apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
        }

      let points = 0;
      if (props.editInfo.speciesType === "Catch & Release") {
        points = props.editInfo.points;
      } else if (props.editInfo.speciesType === "Meatfish") {
        if (CONFIG_CATCHES_ROUND_POINTS_DOWN) {
          points = Math.floor(weight);
        } else {
          points = Math.ceil(weight);
        }
      }
    
      await fetch(`${apiUrl}/api/admin_edit_catch`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          catchYear: props.catchYear,
          catchId: props.editInfo['catchId'],
          dateTime: dateTime,
          length: length,
          girth: girth,
          weight: weight,
          points: points
        })
      }).then(response => {
        toast.success('The catch was successfully updated! Redirecting...');
        delayRefresh(); 
      }).catch(error => {
        toast.error('There was an error while attempting to update the catch. Page will refresh now. Please try again.');
      })

    } catch (error) {
      console.log('There was an error while attempting to edit this database entry: ' + error);
    }
  }
}

  const handleDateTimeSelection = (event) => {
    setDateTime(event.$d);
  }

  const handleLengthSelection = (event) => {
    setLength(event.target.value);
  }

  const handleGirthSelection = (event) => {
    setGirth(event.target.value);
  }

  const handleWeightSelection = (event) => {
    setWeight(event.target.value);
    setPoints(Math.floor(event.target.value));
  }

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>
        <DialogTitle>Edit {props.year} Catch<IconButton onClick={handleClose} style={{float:'right'}}><CloseIcon color="primary"></CloseIcon></IconButton>  </DialogTitle>
        <DialogContent>
            <Stack spacing={2} margin={2}>
              <InputLabel id="species-label"><strong>Species: </strong>  {props.editInfo['species']}</InputLabel>
              <InputLabel id="species-type-label"><strong>Type: </strong>  {props.editInfo['speciesType']}</InputLabel>
              <InputLabel id="points-label"><strong>Points: </strong>  {props.editInfo['points']}</InputLabel>
              { speciesType === "Catch & Release" && 
                <div>
                  <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                    <InputLabel id="edit-date-time"><strong>Date & Time</strong></InputLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker 
                        required 
                        // disablePast 
                        id={"select-catch-date-"} 
                        timeSteps={{ minutes: 1 }}
                        minDate={dayjs(day1)} 
                        maxDate={dayjs(day2)} 
                        value={dayjs(dateTime)}
                        onChange={(e) => handleDateTimeSelection(e)}/>
                    </LocalizationProvider>
                  </Grid>
                </div>
              }

              { speciesType === "Meatfish" &&
                <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
                  <InputLabel id="edit-length"><strong>Length (by 1/8 in.)</strong></InputLabel>
                  <TextField 
                    type="number"
                    id={"edit-length"}
                    InputProps={{
                        inputProps: { 
                            step: 0.125, min: 0.125 
                        }
                    }}
                    value={length}
                    // label="Length (by 1/8 in.)"
                    onChange={(e) => handleLengthSelection(e)}
                  />
                  <br/>
                  <br/>
                  <InputLabel id="edit-girth"><strong>Girth (by 1/8 in.)</strong></InputLabel>
                  <TextField 
                    type="number"
                    id={"select-catch-girth-"}
                    InputProps={{
                        inputProps: { 
                            step: 0.125, min: 0.125 
                        }
                    }}
                    value={girth}
                    // label="Girth (by 1/8 in.)"
                    onChange={(e) => handleGirthSelection(e)}
                  />
                  <br/>
                  <br/>
                  <InputLabel id="edit-weight"><strong>Weight (by 1/10 lb.)</strong></InputLabel>
                  <TextField 
                    type="number"
                    id={"select-catch-weight-"}
                    InputProps={{
                        inputProps: { 
                            step: 0.1, min: 0.1 
                        }
                    }}
                    value={weight}
                    // label="Weight (by 1/10 lb)"
                    onChange={(e) => handleWeightSelection(e)}
                  />
                </Grid>
              }
              <br/>
              <Button color="primary" variant="contained" onClick={handleEdit}>Update Catch Info</Button>
            </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default EditCatchModal;

