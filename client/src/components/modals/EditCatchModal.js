import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, CircularProgress } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CloseIcon from "@mui/icons-material/Close";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { loadConfigForYear } from '../../config/masterConfig';

const EditCatchModal = (props) => {
  const { year } = useParams();
  const [day1, setDay1] = useState();
  const [day2, setDay2] = useState();
  const [today, setToday] = useState();
  const [length, setLength] = useState();
  const [girth, setGirth] = useState();
  const [weight, setWeight] = useState();
  const [points, setPoints] = useState();
  const [dateTime, setDateTime] = useState();
  const [catchPhoto, setCatchPhoto] = useState();
  const [catchPhotoUrl, setCatchPhotoUrl] = useState();
  const [speciesConfig, setSpeciesConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);  // New state to track submission
  const [isSubmitted, setIsSubmitted] = useState(false);    // New state to track successful submission

  useEffect(() => {
    const fetchConfigs = async () => {
      const config = await loadConfigForYear(year);
      if (config) {
        setDay1(props.startDate);
        setDay2(props.endDate);
        setToday(props.today);

        setLength(props.editInfo.length);
        setGirth(props.editInfo.girth);
        setWeight(props.editInfo.weight);
        setPoints(props.editInfo.points);
        setDateTime(props.editInfo.dateTime);
        setCatchPhoto(null);
        setCatchPhotoUrl(props.editInfo.catchPhoto);

        const speciesMatch = config.catchConfig.CONFIG_CATCHES_SPECIES_LIST.find(
          (species) => species.label === props.editInfo.species
        );
        setSpeciesConfig(speciesMatch || {});
      }
    };

    fetchConfigs();
  }, [props, year]);

  const handleClose = () => {
    props.close();
    setIsSubmitting(false);
    setIsSubmitted(false);
  };

  const delayRefresh = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const validateUserInput = () => {
    let inputIsValid = true;

    if (!dateTime && speciesConfig?.dateTimeIsRequired) {
      toast.warning("Please enter a date and time for the catch");
      inputIsValid = false;
    }
    if (speciesConfig?.lengthIsRequired && (isNaN(parseFloat(length)) || parseFloat(length) <= 0)) {
      toast.warning("Please enter a valid length greater than zero");
      inputIsValid = false;
    }
    if (speciesConfig?.girthIsRequired && (isNaN(parseFloat(girth)) || parseFloat(girth) <= 0)) {
      toast.warning("Please enter a valid girth greater than zero");
      inputIsValid = false;
    }
    if (speciesConfig?.weightIsRequired && (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0)) {
      toast.warning("Please enter a valid weight greater than zero");
      inputIsValid = false;
    }
    if (speciesConfig?.photoIsRequired && !catchPhotoUrl) {
      toast.warning("A photo is required");
      inputIsValid = false;
    }
    return inputIsValid;
  };

  const handleEdit = async () => {
    if (validateUserInput()) {
      setIsSubmitting(true); // Start submission

      try {
        let apiUrl = process.env.REACT_APP_NODE_ENV === "staging"
          ? process.env.REACT_APP_SERVER_URL_STAGING
          : process.env.REACT_APP_SERVER_URL_PRODUCTION;

        const formData = new FormData();
        formData.append("catchId", props.editInfo.catchId);
        formData.append("catchYear", props.catchYear);
        formData.append("dateTime", dateTime ? dayjs(dateTime).toISOString() : '');
        formData.append("length", length);
        formData.append("girth", girth);
        formData.append("weight", weight);
        formData.append("points", points);

        if (catchPhoto) {
          formData.append("catchPhoto", catchPhoto);
        }

        await fetch(`${apiUrl}/api/${year}/admin_edit_catch`, {
          method: 'POST',
          body: formData
        }).then(response => {
          if (response.ok) {
            toast.success('The catch was successfully updated! Redirecting...');
            setIsSubmitted(true); // Mark as submitted
            delayRefresh();
          } else {
            toast.error('Error while attempting to update the catch.');
            setIsSubmitting(false); // Reset submission state if failed
          }
        }).catch(error => {
          toast.error('There was an error while attempting to update the catch.');
          setIsSubmitting(false); // Reset submission state if failed
        });
      } catch (error) {
        console.log('Error editing the catch:', error);
        setIsSubmitting(false); // Reset submission state if failed
      }
    }
  };

  const handleDateTimeSelection = (event) => {
    setDateTime(event ? event.toISOString() : null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCatchPhoto(file);
      setCatchPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setCatchPhoto(null);
    setCatchPhotoUrl(null);
  };

  const handlePointsCalculation = (weightValue) => {
    if (speciesConfig?.pointsCalculationMethod === "weightRoundUp") {
      return Math.ceil(weightValue);
    } else if (speciesConfig?.pointsCalculationMethod === "weightExact") {
      return weightValue;
    } else {
      return Math.floor(weightValue);
    }
  };

  const handleWeightSelection = (event) => {
    const weightValue = parseFloat(event.target.value);
    setWeight(weightValue);
    setPoints(handlePointsCalculation(weightValue));
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <form onSubmit={(e) => { e.preventDefault(); }}>
        <DialogTitle>Edit {props.year} Catch<IconButton onClick={handleClose} style={{ float: 'right' }}><CloseIcon /></IconButton></DialogTitle>
        <DialogContent>
          <Stack spacing={2} margin={2}>
            
            <InputLabel><strong>Species: </strong>{props.editInfo.species}</InputLabel>
            <InputLabel><strong>Type: </strong>{props.editInfo.speciesType}</InputLabel>
            <InputLabel><strong>Caught By: </strong>{props.editInfo.teamName}</InputLabel>

            {/* DateTime */}
            {speciesConfig?.dateTimeIsRequired &&
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  id="edit-catch-date"
                  value={dayjs(dateTime)}
                  onChange={(e) => handleDateTimeSelection(e)}
                  minDate={dayjs(day1)}
                  maxDate={dayjs(day2)}
                />
              </LocalizationProvider>
            }

            {/* Length */}
            {speciesConfig?.lengthIsRequired &&
              <TextField
                type="number"
                label="Length (by 1/8 inch)"
                value={length || ''}
                onChange={(e) => setLength(e.target.value)}
                InputProps={{ inputProps: { step: 0.125, min: 0.125 } }}
              />
            }

            {/* Girth */}
            {speciesConfig?.girthIsRequired &&
              <TextField
                type="number"
                label="Girth (by 1/8 inch)"
                value={girth || ''}
                onChange={(e) => setGirth(e.target.value)}
                InputProps={{ inputProps: { step: 0.125, min: 0.125 } }}
              />
            }

            {/* Weight */}
            {speciesConfig?.weightIsRequired &&
              <TextField
                type="number"
                label="Weight (by 1/10 lb)"
                value={weight || ''}
                onChange={handleWeightSelection}
                InputProps={{ inputProps: { step: 0.1, min: 0.1 } }}
              />
            }

            {/* Photo */}
            {speciesConfig?.photoIsRequired &&
              <div>
                <input
                  accept="image/*"
                  type="file"
                  id="edit-catch-photo"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="edit-catch-photo">
                  <Button variant="contained" component="span">Upload Photo*</Button>
                </label>
                {catchPhotoUrl &&
                  <div style={{ width: '100px', height: '100px', marginTop: '10px' }}>
                    <img src={catchPhotoUrl} alt="Catch preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                    <Button onClick={handleRemoveImage}>Remove Photo</Button>
                  </div>
                }
              </div>
            }

            {/* Submit button */}
            {!isSubmitted ? (
              <Button
                color="primary"
                variant="contained"
                onClick={handleEdit}
                disabled={isSubmitting || isSubmitted}  // Disable during submission or after it's submitted
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}  // Show spinner while submitting
              >
                {isSubmitting ? "Submitting..." : "Update Catch Info"}
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

export default EditCatchModal;

