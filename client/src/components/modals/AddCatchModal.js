import React, {useState, useEffect } from 'react';
import { InputLabel, Select, MenuItem, Divider, Button, Grid, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, Autocomplete} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CloseIcon from "@mui/icons-material/Close"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  CONFIG_FIREBASE_CATCHES_TABLE_NAME,
  CONFIG_CATCHES_SPECIES_LIST,
  CONFIG_CATCHES_ROUND_POINTS_DOWN, 
} from '../../config';

const AddCatchModal = (props) => {

  const [day1, setDay1] = useState();
  const [day2, setDay2] = useState();
  const [today, setToday] = useState();

  const [teamId, setTeamId] = useState();
  const [teamName, setTeamName] = useState();
  const [numCatches, setNumCatches] = useState(0);
  const [teamIsSelected, setTeamIsSelected] = useState(false);
  const [registeredTeamList, setRegisteredTeamList] = useState([]);
  const [registeredTeamNameList, setRegisteredTeamNameList] = useState([]);
  const [catchData, setCatchData] = useState([]);
  const [speciesList, setSpeciesList] = useState([]);

  useEffect(() => {

    let apiUrl = null;
    if (process.env.REACT_APP_NODE_ENV === "staging") {
      apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
    } else if (process.env.REACT_APP_NODE_ENV === "production") {
      apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
    }

    fetch(`${apiUrl}/api/admin_get_database_list`, {    // FIXME: create thsi endpoint
      method: 'POST',    
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({table: props.teamYear})
    })
    .then(res => res.json())
    .then(data => {
      var tempList = [];
      var tempNameList = [];
      Object.keys(data).map((teamKey, i) => {
        let tempObject = {};
        let tempNameObject = {};
        tempObject[teamKey] = data[teamKey]
        tempNameObject["teamKey"] = teamKey;
        tempNameObject["teamData"] = data[teamKey];
        tempNameObject["label"]= data[teamKey].teamName;
        tempList.push(tempObject);
        tempNameList.push(tempNameObject);
      })

      setRegisteredTeamList(tempList);
      setRegisteredTeamNameList(tempNameList);
      setToday(props.today);
      setDay1(props.startDate);
      setDay2(props.endDate);
      setSpeciesList(CONFIG_CATCHES_SPECIES_LIST);

    })
    .catch(e => {
      console.error(e.error);
    })

  }, []);

  const handleClose = () => {
    setRegisteredTeamList([]);
    setTeamId();
    setTeamName();
    setTeamId();
    setTeamIsSelected(false);
    setNumCatches(0);
    setCatchData([]);
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

    catchData.map((entry, i) => {

      if(!entry["teamId"]) {
        toast.warning("Please select a team for catch#" + (i+1));
        inputIsValid = false;
        return false;
      }
      
      if(!entry["species"]) {
        toast.warning("Please select a species for catch#" + (i+1));
        inputIsValid = false;
        return false;
      }

      if(!entry["dateTime"]) {
        toast.warning("Please enter a date and time for catch#" + (i+1));
        inputIsValid = false;
        return false;
      } 

      if(isNaN(parseInt(entry["length"]))) {
        toast.warning("Please enter a length greater than zero for catch#" + (i+1));
        inputIsValid = false;
        return false;
      } 

      if(isNaN(parseInt(entry["girth"]))) {
        toast.warning("Please enter a girth greater than zero for catch#" + (i+1));
        inputIsValid = false;
        return false;
      } 

      if(isNaN(parseInt(entry["weight"]))) {
        toast.warning("Please enter a weight greater than zero for catch#" + (i+1));
        inputIsValid = false;
        return false;
      } 

    })

  if (inputIsValid) {
    return true;
  } else {
    return false;
  }

}  

  const handleChangeNumberOfCatches = (e) => {
    setNumCatches(e.target.value);
    if (e.target.value > 0) {
      const catchDataList = [];
      for (let i=0; i<e.target.value; i++) {
        catchDataList.push(
          {
            id: i,
            teamId: teamId,
            teamName: teamName,
            speciesType: "",
            species: "",
            dateTime: "",
            length: "",
            girth: "",
            weight: "",
            points: "",
          }
        )
      }
      setCatchData(catchDataList);
    } else {
      setCatchData([]);
    }
  }

  const handleTeamSelection = (event, value) => {
    setTeamId(value["teamKey"]);
    setTeamName(value["teamData"]["teamName"]);
    setTeamIsSelected(true);
  }

  const handleSpeciesSelection = (event, value) => {

    let newCatchData = [...catchData];
    let index = parseInt(event.target.id.replace("select-angler-species-box-", "")[0]);

    if (value["category"] === "Catch & Release") {

      newCatchData[index].species = value["label"];
      newCatchData[index].speciesType = value["category"];
      newCatchData[index].length = 0;
      newCatchData[index].girth = 0;
      newCatchData[index].weight = 0;
      speciesList.forEach(species => {
        if (species.label === value["label"]) {
          newCatchData[index].points = species.points;
        };
      });

    } else if (value["category"] === "Meatfish") {

      newCatchData[index].species = value["label"];
      newCatchData[index].speciesType = value["category"];
      newCatchData[index].dateTime = today;

    }

    setCatchData(newCatchData)
  }

  const handleDateTimeSelection = (index, event) => {
    console.log('handleDateSelection...');
    let newCatchData = [...catchData];
    newCatchData[index].dateTime = event.$d;
    setCatchData(newCatchData);
  }

  const handleLengthSelection = (index, event) => {
    console.log('handleLengthSelection...');
    let newCatchData = [...catchData];
    newCatchData[index].length = event.target.value;
    setCatchData(newCatchData);
  }

  const handleGirthSelection = (index, event) => {
    console.log('handleGirthSelection...');
    let newCatchData = [...catchData];
    newCatchData[index].girth = event.target.value;
    setCatchData(newCatchData);
  }

  const handleWeightSelection = (index, event) => {
    console.log('handleWeightSelection...');
    let newCatchData = [...catchData];
    newCatchData[index].weight = event.target.value;
    if (CONFIG_CATCHES_ROUND_POINTS_DOWN) {
      newCatchData[index].points = Math.floor(event.target.value);
    } else {
      newCatchData[index].points = Math.ceil(event.target.value);
    }
    setCatchData(newCatchData);
  }

  const addCatches = () => {
    return catchData.map((element, index) => (
      <div>
        <br/>
        <Divider>
          <InputLabel id={"catch-" + index}>Catch #{index + 1}</InputLabel>
        </Divider>
        <br/>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
            <Autocomplete
              disablePortal
              id={"select-angler-species-box-" + index}
              options={speciesList}
              groupBy={(option) => option.category}
              renderInput={(params) => <TextField {...params} label="Select species"/>}
              onChange={handleSpeciesSelection}
            />
          </Grid>
        </Grid>
        <br/>
          { catchData[index].speciesType === "Catch & Release" && 
            <div>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker 
                      required 
                      // disablePast 
                      id={"select-catch-date-" + index} 
                      timeSteps={{ minutes: 1 }}
                      minDate={dayjs(day1)} 
                      maxDate={dayjs(day2)} 
                      onChange={(e) => handleDateTimeSelection(index, e)}/>
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </div>
          }

        { catchData[index].speciesType === "Meatfish" &&
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
              <TextField 
                    type="number"
                    id={"select-catch-weight-" + index}
                    InputProps={{
                        inputProps: { 
                            step: 0.1, min: 0.1 
                        }
                    }}
                    label="Weight (by 1/10 lb)"
                    onChange={(e) => handleWeightSelection(index, e)}
                />
            </Grid>
            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
              <TextField 
                  type="number"
                  id={"select-catch-length-" + index}
                  InputProps={{
                      inputProps: { 
                          step: 0.125, min: 0.125 
                      }
                  }}
                  label="Length (by 1/8 inch)"
                  onChange={(e) => handleLengthSelection(index, e)}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={4} lg={4} xl={4}>
              <TextField 
                    type="number"
                    id={"select-catch-girth-" + index}
                    InputProps={{
                        inputProps: { 
                            step: 0.125, min: 0.125 
                        }
                    }}
                    label="Girth (by 1/8 inch)"
                    onChange={(e) => handleGirthSelection(index, e)}
                />
            </Grid>
          </Grid>
        }

        <br/>
      </div>
    ))
  }

  const handleCreateCatches = () => {
    if ( validateUserInput() ) {
      console.log('Input validated! Writing to catch database now...')

      const catchDataString = JSON.stringify(catchData);

      let apiUrl = null;
      if (process.env.REACT_APP_NODE_ENV === "staging") {
        apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
      } else if (process.env.REACT_APP_NODE_ENV === "production") {
        apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
      }
  
      fetch(`${apiUrl}/api/admin_add_catch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          catchData: catchDataString,
          catchYear: props.catchYear
        })
      }).then(res => {
        if (res.ok) {
          toast.success("Successfully added " + numCatches + " catches! Page refreshing...");
          handleClose();
          delayRefresh();
        }
      }).catch(e => {
        console.error(e.error)
        toast.error("Error while attempting to save catches to database. Please try again or contact site administrator.");
        delayRefresh();
        handleClose();
      })
    } else {
      console.log("Input was not valid or there was an error")
    }
  }
  

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="xl">
      <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); this.handleClose(); } }>
        <DialogTitle>Add {props.year} Catches<IconButton onClick={handleClose} style={{float:'right'}}><CloseIcon color="primary"></CloseIcon></IconButton>  </DialogTitle>
        <DialogContent>
            <Stack xs spacing={2} margin={2}>
              <InputLabel required id="angler-label">Select team</InputLabel>
              <Autocomplete
                disablePortal
                id="select-angler-autocomplete-box"
                options={registeredTeamNameList}
                renderInput={(params) => <TextField {...params} label="Team name"/>}
                onChange={handleTeamSelection}
              />

              { teamIsSelected &&
                <div>
                  <InputLabel required id="num-catches-label">Select number of catches to add</InputLabel>
                  <Select labelId="num-catches-label" id="num-catches" value={numCatches} onChange={(e) => handleChangeNumberOfCatches(e)}>
                    <MenuItem value={"0"}>0</MenuItem>
                    <MenuItem value={"1"}>1</MenuItem>
                    <MenuItem value={"2"}>2</MenuItem>
                    <MenuItem value={"3"}>3</MenuItem>
                    <MenuItem value={"4"}>4</MenuItem>
                    <MenuItem value={"5"}>5</MenuItem>
                    <MenuItem value={"6"}>6</MenuItem>
                    <MenuItem value={"7"}>7</MenuItem>
                    <MenuItem value={"8"}>8</MenuItem>
                    <MenuItem value={"9"}>9</MenuItem>
                    <MenuItem value={"10"}>10</MenuItem>
                  </Select>
                  { catchData.length ? (
                    <div>
                      {addCatches()}
                    </div>
                  ) : null
                  }
                </div>
              }

              {(teamIsSelected && numCatches > 0) ? (
                <Button disabled={false} color="primary" variant="contained" onClick={handleCreateCatches}>Submit</Button>
              ) : (
                <Button disabled={true} color="primary" variant="contained" onClick={handleCreateCatches}>Submit</Button>
              )
              }

            </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddCatchModal;

