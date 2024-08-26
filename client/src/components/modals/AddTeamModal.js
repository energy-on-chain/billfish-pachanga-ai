import React, { useState, useEffect } from 'react';
import { InputLabel, Select, MenuItem, Button, FormControl, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, FormControlLabel, Checkbox, Autocomplete } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from 'react-toastify';

import {
  CONFIG_FIREBASE_TEAMS_TABLE_NAME,
  CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST,
  CONFIG_GENERAL_LINK_TO_TOURNAMENT_RULES,
  CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION,
  CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS,
  CONFIG_REGISTRATION_EARLYBIRD_FEE,
  CONFIG_REGISTRATION_NORMAL_FEE,
  CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS,    
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_STRING_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_INT_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_BOOLEAN_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_DROPDOWN_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_IMAGE_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_STRING_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_INT_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_BOOLEAN_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_DROPDOWN_FIELDS,
  CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_IMAGE_FIELDS,
} from '../../config';

import 'react-toastify/dist/ReactToastify.css';

const AddTeamModal = (props) => {

  const [teamNameOptions, setTeamNameOptions] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [registrationFee, setRegistrationFee] = useState(0);
  const [isEarlybird, setIsEarlybird] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isValidInput, setIsValidInput] = useState(false);
  const [requiredStringFields, setRequiredStringFields] = useState({});
  const [requiredIntFields, setRequiredIntFields] = useState({});
  const [requiredBooleanFields, setRequiredBooleanFields] = useState({});
  const [requiredDropdownFields, setRequiredDropdownFields] = useState({});
  const [nonRequiredStringFields, setNonRequiredStringFields] = useState({});
  const [nonRequiredIntFields, setNonRequiredIntFields] = useState({});
  const [nonRequiredBooleanFields, setNonRequiredBooleanFields] = useState({});
  const [nonRequiredDropdownFields, setNonRequiredDropdownFields] = useState({});
  const [requiredImageUploads, setRequiredImageUploads] = useState({});
  const [imageUploads, setImageUploads] = useState({});
  const [addOnQuantities, setAddOnQuantities] = useState({});

  useEffect(() => {
    
    // Assess earlybird registration condition
    if (CONFIG_REGISTRATION_HAS_EARLYBIRD_REGISTRATION) {
      let now = new Date();
      let localTime = now.getTime() - (now.getTimezoneOffset() * 60000);

      if ((CONFIG_REGISTRATION_EARLYBIRD_CUTOFF_IN_LOCAL_TIME_IN_MS - localTime) > 0) {
        setRegistrationFee(CONFIG_REGISTRATION_EARLYBIRD_FEE);
        setIsEarlybird(true);
      } else {
        setRegistrationFee(CONFIG_REGISTRATION_NORMAL_FEE);
        setIsEarlybird(false);
      }
    } else {
      setRegistrationFee(CONFIG_REGISTRATION_NORMAL_FEE);
      setIsEarlybird(false);
    }

    // Fetch past team names from server
    if (CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST.length > 0) {
      const fetchTeamNames = async () => {
        try {
          const response = await fetch('/api/registration-get-past-team-name-list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              teamTableNameList: CONFIG_REGISTRATION_PAST_TEAMS_TABLES_FOR_AUTOCOMPLETE_NAME_LIST,
            })
          });
          const data = await response.json();
          setTeamNameOptions(data.teamNames);
        } catch (error) {
          console.error("Error fetching team names:", error);
        }
      };

      fetchTeamNames();

    // Initialize add-on quantities to zero
    const initialAddOnQuantities = {};
    Object.keys(CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS).forEach((key) => {
      initialAddOnQuantities[key] = 0;
    });
    setAddOnQuantities(initialAddOnQuantities);
    }

    // Initialize required and non-required boolean fields to false
    const initialRequiredBooleanFields = {};
    CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_BOOLEAN_FIELDS.forEach((field) => {
      initialRequiredBooleanFields[field] = false;
    });
    setRequiredBooleanFields(initialRequiredBooleanFields);

    const initialNonRequiredBooleanFields = {};
    CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_BOOLEAN_FIELDS.forEach((field) => {
      initialNonRequiredBooleanFields[field] = false;
    });
    setNonRequiredBooleanFields(initialNonRequiredBooleanFields);

  }, []);

  const delayRefresh = () => {
    setTimeout(() => {
      console.log('Delaying page refresh...');
      window.location.reload();
    }, 2000);
  }

  const handleClose = () => {
    setTeamName('');
    setIsChecked(false);
    setIsValidInput(false);
    setRequiredStringFields({});
    setRequiredIntFields({});
    setRequiredBooleanFields({});
    setRequiredDropdownFields({});
    setNonRequiredStringFields({});
    setNonRequiredIntFields({});
    setNonRequiredBooleanFields({});
    setNonRequiredDropdownFields({});
    setRequiredImageUploads({});
    setImageUploads({});
    setAddOnQuantities({});
    props.close();
  }

  const validateUserInput = () => {
    let isValid = true;

    if (!teamName) {
        toast.warning("Please enter a team name");
        setIsValidInput(false);
        isValid = false;
    }

    if (!isChecked && !props.isAdmin) {
        toast.warning("Please read and agree to the event rules.");
        setIsValidInput(false);
        isValid = false;
    }

    // Validate required string fields
    Object.keys(requiredStringFields).forEach((fieldName) => {
        if (!requiredStringFields[fieldName]) {
            toast.warning(`Please fill in the required field: ${fieldName}`);
            isValid = false;
        }
    });

    // Validate required int fields
    Object.keys(requiredIntFields).forEach((fieldName) => {
        const value = requiredIntFields[fieldName];
        if (value === undefined || value === null || value < 0 || isNaN(value)) {
            toast.warning(`Please enter a valid number for ${fieldName}`);
            isValid = false;
        }
    });

    // Validate required boolean fields
    Object.keys(requiredBooleanFields).forEach((fieldName) => {
        if (requiredBooleanFields[fieldName] === undefined) {
            toast.warning(`Please fill in the required field: ${fieldName}`);
            isValid = false;
        }
    });

    // Validate required dropdown fields
    Object.keys(requiredDropdownFields).forEach((fieldName) => {
        if (!requiredDropdownFields[fieldName]) {
            toast.warning(`Please select an option for ${fieldName}`);
            isValid = false;
        }
    });

    // Validate required images
    CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_IMAGE_FIELDS.forEach((fieldName) => {
        if (!requiredImageUploads[fieldName]) {
            toast.warning(`Please upload the required image: ${fieldName}`);
            isValid = false;
        }
    });

    // Validate add-on quantities against their maximum quantity
    Object.keys(addOnQuantities).forEach((addOn) => {
      const quantity = addOnQuantities[addOn];
      const maxQty = CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].maximumQty;

      if (quantity > maxQty) {
        toast.warning(`The quantity for ${addOn} exceeds the maximum allowed (${maxQty}).`);
        isValid = false;
      }
    });

    // Set final validity state
    setIsValidInput(isValid);
    return isValid;
};

  const onChangeTeamName = (e, newValue) => {
    setTeamName(newValue || e.target.value);
  }

  const handleRequiredFieldChange = (e, type, fieldName) => {
    let value;

    switch (type) {
        case 'boolean':
            value = e.target.checked;
            setRequiredBooleanFields((prevFields) => ({
                ...prevFields,
                [fieldName]: value,
            }));
            break;
        case 'int':
            value = parseInt(e.target.value, 10);
            setRequiredIntFields((prevFields) => ({
                ...prevFields,
                [fieldName]: value,
            }));
            break;
        case 'string':
            value = e.target.value;
            setRequiredStringFields((prevFields) => ({
                ...prevFields,
                [fieldName]: value,
            }));
            break;
        case 'dropdown':
            value = e.target.value;
            setRequiredDropdownFields((prevFields) => ({
                ...prevFields,
                [fieldName]: value,
            }));
            break;
        default:
            break;
    }
  };

  const handleNonRequiredFieldChange = (e, type, fieldName) => {
      let value;

      switch (type) {
          case 'boolean':
              value = e.target.checked;
              setNonRequiredBooleanFields((prevFields) => ({
                  ...prevFields,
                  [fieldName]: value,
              }));
              break;
          case 'int':
              value = parseInt(e.target.value, 10);
              setNonRequiredIntFields((prevFields) => ({
                  ...prevFields,
                  [fieldName]: value,
              }));
              break;
          case 'string':
              value = e.target.value;
              setNonRequiredStringFields((prevFields) => ({
                  ...prevFields,
                  [fieldName]: value,
              }));
              break;
          case 'dropdown':
              value = e.target.value;
              setNonRequiredDropdownFields((prevFields) => ({
                  ...prevFields,
                  [fieldName]: value,
              }));
              break;
          default:
              break;
      }
  };

  const handleRequiredImageChange = (e, fieldName) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const newFile = new File([file], fieldName, {
        type: file.type,
      });
  
      setRequiredImageUploads((prevImages) => ({
        ...prevImages,
        [fieldName]: {
          file: newFile,
          fieldName: fieldName,
          url: URL.createObjectURL(newFile),  // Create an object URL for the preview
          fileName: fieldName,  // Store the new filename without extension
          fileExtension: fileExtension
        },
      }));
    }
  };

  const handleRemoveRequiredImage = (fieldName) => {
    setRequiredImageUploads((prevImages) => {
      const updatedImages = { ...prevImages };
      delete updatedImages[fieldName];
      return updatedImages;
    });
    document.getElementById(`upload-button-${fieldName}`).value = '';
  };

  const handleImageChange = (e, fieldName) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.'));
      const newFile = new File([file], fieldName, {
        type: file.type,
      });
  
      setImageUploads((prevImages) => ({
        ...prevImages,
        [fieldName]: {
          file: newFile,
          fieldName: fieldName,
          url: URL.createObjectURL(newFile),
          fileName: fieldName,  // Store the new filename without extension
          fileExtension: fileExtension
        },
      }));
    }
  };

  const handleRemoveImage = (fieldName) => {
    setImageUploads((prevImages) => {
      const updatedImages = { ...prevImages };
      delete updatedImages[fieldName];
      return updatedImages;
    });
    document.getElementById(`upload-button-${fieldName}`).value = '';
  };

  const handleAddOnQuantityChange = (e, addOn) => {
    const quantity = parseInt(e.target.value, 10) || 0;
    setAddOnQuantities((prevQuantities) => ({
      ...prevQuantities,
      [addOn]: quantity,
    }));
  };

  const calculateTotalFee = () => {
    let total = registrationFee;
    Object.keys(addOnQuantities).forEach((addOn) => {
      total += addOnQuantities[addOn] * CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].price;
    });
    return total;
  };

  const handlePayment = async () => {
    console.log('In handlePayment...')
    let apiUrl = null;
    if (process.env.REACT_APP_NODE_ENV === "staging") {
        apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
    } else if (process.env.REACT_APP_NODE_ENV === "production") {
        apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
    }

    let metaDataObject = {
        teamTableName: CONFIG_FIREBASE_TEAMS_TABLE_NAME,
        teamName: teamName,
        registrationFee: registrationFee,
        isEarlybird: isEarlybird,
        totalFeePaidAtCheckout: calculateTotalFee(),
        hasCheckedIn: false,
        requiredStringFields,
        requiredIntFields,
        requiredBooleanFields,
        requiredDropdownFields,
        requiredImageFields: CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_IMAGE_FIELDS,
        nonRequiredStringFields,
        nonRequiredIntFields,
        nonRequiredBooleanFields,
        nonRequiredDropdownFields,
        nonRequiredImageFields: CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_IMAGE_FIELDS,
        addOnQuantities,
        addOnProperties: CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS,
    }
    console.log('metaDataObject: ');
    console.log(metaDataObject);

    const formData = new FormData();
    formData.append('metaDataObject', JSON.stringify(metaDataObject));

    console.log('requiredImageUploads:', requiredImageUploads);
    Object.keys(requiredImageUploads).forEach((fieldName) => {
      console.log(fieldName);
      formData.append('requiredImageUploads', requiredImageUploads[fieldName].file);
    });

    console.log('imageUploads:', imageUploads)
    Object.keys(imageUploads).forEach((fieldName) => {
      console.log(fieldName);
      formData.append('imageUploads', imageUploads[fieldName].file);
    });

    if (props.isAdmin) {    // register as admin, non-payment case

      fetch(`${apiUrl}/api/admin_add_team`, {
        method: 'POST',
        body: formData,
      }).then(res => {
        if (res.ok) {
          toast.success("Successfully added a new team! Page refreshing...");
          delayRefresh();
        } else {
          toast.error("Error while attempting to save team to database as administrator. Please try again or contact site administrator.");
        }
      })

    } else {

      fetch(`${apiUrl}/api/registration-checkout-session`, {
        method: 'POST',
        body: formData,
      }).then(res => {
          if (res.ok) {
              return res.json();
          } else {
              return res.json().then(json => Promise.reject(json));
          }
      }).then(({ url }) => {
          window.location = url;
      }).catch(e => {
          console.error(e.error);
      });

    }

}
  
  const handleFormSubmission = () => {
    if (validateUserInput()) {
      handlePayment();
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="xl">
      <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); this.handleClose(); }}>
        {props.isAdmin ? (
          <DialogTitle>Register a New Team as Admin<IconButton onClick={handleClose} style={{ float: 'right' }}><CloseIcon color="primary"></CloseIcon></IconButton></DialogTitle>
        ) : (
          <DialogTitle>Register a New Team<IconButton onClick={handleClose} style={{ float: 'right' }}><CloseIcon color="primary"></CloseIcon></IconButton></DialogTitle>
        )}
        <DialogContent>
          <Stack xs spacing={2} margin={2}>
            <InputLabel id="team-label"><strong>Required Information</strong></InputLabel>
            <Autocomplete
              id="team-name-autocomplete"
              key="team-name-autocomplete-key"
              required
              options={teamNameOptions}
              value={teamName}
              onInputChange={onChangeTeamName} // Handling typing in input
              onChange={onChangeTeamName} // Handling selection from dropdown
              renderInput={(params) => <TextField {...params} variant="outlined" label="Team name" placeholder='Team name' />}
              freeSolo
            />

            {/* Render additional required fields */}
            {CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_STRING_FIELDS.map((field, index) => (
              <TextField
                key={`required-string-${index}`}
                required
                label={field}
                type="text"
                variant="outlined"
                onChange={(e) => handleRequiredFieldChange(e, 'string', field)}
              />
            ))}
            {CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_INT_FIELDS.map((field, index) => (
              <TextField
                key={`required-int-${index}`}
                required
                label={field}
                type="number"
                variant="outlined"
                onChange={(e) => handleRequiredFieldChange(e, 'int', field)}
                inputProps={{ min: 0 }}
              />
            ))}
            {CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_BOOLEAN_FIELDS.map((field, index) => (
              <FormControlLabel
                key={`required-boolean-${index}`}
                control={
                  <Checkbox
                    onChange={(e) => handleRequiredFieldChange(e, 'boolean', field)}
                  />
                }
                label={field}
              />
            ))}
            {Object.keys(CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_DROPDOWN_FIELDS).map((fieldName, index) => (
              <FormControl key={`required-dropdown-${index}`} fullWidth>
                <InputLabel>{fieldName}</InputLabel>
                <Select
                  label={fieldName}
                  onChange={(e) => handleRequiredFieldChange(e, 'dropdown', fieldName)}
                >
                  {CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_DROPDOWN_FIELDS[fieldName].map((option, optIndex) => (
                    <MenuItem key={optIndex} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            {CONFIG_REGISTRATION_ADDITIONAL_REQUIRED_IMAGE_FIELDS.map((fieldName, index) => (
              <div key={`required-image-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor={`upload-button-${fieldName}`} style={{ cursor: 'pointer', display: 'inline-block', background: '#d3d3d3', color: 'black', padding: '10px 20px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)', marginRight: '10px' }}>
                  Upload {fieldName}*
                </label>
                <input
                  id={`upload-button-${fieldName}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleRequiredImageChange(e, fieldName)}
                />
                {requiredImageUploads[fieldName] && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={requiredImageUploads[fieldName].url}
                      alt={`${fieldName} Preview`}
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginRight: '10px' }}
                    />
                    <IconButton size="small" onClick={() => handleRemoveRequiredImage(fieldName)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}

            {/* Render additional non-required fields */}
            {(
              (CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_STRING_FIELDS.length > 0) ||
              (CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_INT_FIELDS.length > 0) ||
              (CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_BOOLEAN_FIELDS.length > 0) ||
              (CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_IMAGE_FIELDS.length > 0) ||
              (Object.keys(CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_DROPDOWN_FIELDS).length > 0)
            ) &&
              <InputLabel id="additional-required-fields-label"><strong>Optional Information</strong></InputLabel>
            }
            {CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_STRING_FIELDS.map((field, index) => (
              <TextField
                key={`non-required-string-${index}`}
                label={field}
                variant="outlined"
                onChange={(e) => handleNonRequiredFieldChange(e, 'string', field)}
              />
            ))}
            {CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_INT_FIELDS.map((field, index) => (
              <TextField
                key={`non-required-int-${index}`}
                label={field}
                type="number"
                variant="outlined"
                onChange={(e) => handleNonRequiredFieldChange(e, 'int', field)}
                inputProps={{ min: 0 }}
              />
            ))}
            {CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_BOOLEAN_FIELDS.map((field, index) => (
              <FormControlLabel
                key={`non-required-boolean-${index}`}
                control={
                  <Checkbox
                    onChange={(e) => handleNonRequiredFieldChange(e, 'boolean', field)}
                  />
                }
                label={field}
              />
            ))}
            {Object.keys(CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_DROPDOWN_FIELDS).map((fieldName, index) => (
              <FormControl key={`non-required-dropdown-${index}`} fullWidth>
                <InputLabel>{fieldName}</InputLabel>
                <Select
                  label={fieldName}
                  onChange={(e) => handleNonRequiredFieldChange(e, 'dropdown', fieldName)}
                >
                  {CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_DROPDOWN_FIELDS[fieldName].map((option, optIndex) => (
                    <MenuItem key={optIndex} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
            {CONFIG_REGISTRATION_ADDITIONAL_NON_REQUIRED_IMAGE_FIELDS.map((fieldName, index) => (
              <div key={`non-required-image-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <label htmlFor={`upload-button-${fieldName}`} style={{ cursor: 'pointer', display: 'inline-block', background: '#d3d3d3', color: 'black', padding: '10px 20px', borderRadius: '4px', textAlign: 'center', border: '1px solid #ccc', boxShadow: '2px 2px 5px rgba(0, 0, 0, 0.1)', marginRight: '10px' }}>
                  Upload {fieldName}
                </label>
                <input
                  id={`upload-button-${fieldName}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={(e) => handleImageChange(e, fieldName)}
                />
                {imageUploads[fieldName] && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src={imageUploads[fieldName].url}
                      alt={`${fieldName} Preview`}
                      style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover', marginRight: '10px' }}
                    />
                    <IconButton size="small" onClick={() => handleRemoveImage(fieldName)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>
            ))}

            {/* Render additional paid add on fields */}
            {(
              (Object.keys(CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS).length > 0)
            ) &&
              <InputLabel id="additional-paid-add-on-fields-label"><strong>Add-Ons</strong></InputLabel>
            }
            {Object.keys(CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS).map((addOn, index) => (
              <div key={`add-on-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <br/>
                <TextField
                  label={`${addOn} (${formatCurrency(CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].price)} each${CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].maximumQty > 0 ? `, max ${CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].maximumQty}` : ''})`}
                  type="number"
                  variant="outlined"
                  onChange={(e) => handleAddOnQuantityChange(e, addOn)}
                  inputProps={{ min: 0, max: CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].maximumQty }}
                  style={{ flex: 1 }}
                />
              </div>
            ))}

            <InputLabel id="total-fee-label-id" key="total-fee">
              <strong>Your Total Fee: {formatCurrency(calculateTotalFee())}</strong>
            </InputLabel>
            <InputLabel id="team-registration-fee-id" key="team-registration-fee">
              Registration {isEarlybird ? "(Earlybird)" : ""}: {formatCurrency(registrationFee)}
            </InputLabel>
            {Object.keys(addOnQuantities).map((addOn, index) => (
              <InputLabel id={`add-on-summary-${index}`} key={`add-on-summary-${index}`}>
                {addOn} ({addOnQuantities[addOn]}): {formatCurrency(addOnQuantities[addOn] * CONFIG_REGISTRATION_ADDITIONAL_PAID_ADD_ON_FIELDS[addOn].price)}
              </InputLabel>
            ))}
            { !props.isAdmin && 
              <FormControlLabel id="rule-checkbox-id" key="rules-checkbox-key" control={<Checkbox color="primary" onChange={(e) => { setIsChecked(e.target.checked) }}></Checkbox>} label={
                <div>
                  <span>I have read and understand </span>
                  <a href={CONFIG_GENERAL_LINK_TO_TOURNAMENT_RULES} target="_blank" rel="noopener noreferrer"> the rules.</a>
                </div>
              }></FormControlLabel>
            }
            {props.isAdmin ? (
              <Button color="primary" variant="contained" onClick={handleFormSubmission}>Register team (with no online payment)</Button>
            ) : (
              <Button color="primary" variant="contained" disabled={!isChecked} onClick={handleFormSubmission}>Go to payment</Button>
            )}
          </Stack>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default AddTeamModal;

