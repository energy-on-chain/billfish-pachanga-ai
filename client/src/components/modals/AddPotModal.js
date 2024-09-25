import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { InputLabel, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, TextField, FormControlLabel, Checkbox, Autocomplete } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loadConfigForYear } from '../../config/masterConfig';

const AdminAddPotModal = (props) => {

  const { year } = useParams();
  const [config, setConfig] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track if the form has been submitted

  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [registeredTeamList, setRegisteredTeamList] = useState([]);
  const [registeredTeamNameList, setRegisteredTeamNameList] = useState([]);
  const [teamIsSelected, setTeamIsSelected] = useState(false);
  const [teamId, setTeamId] = useState();
  const [teamName, setTeamName] = useState();
  const [boardSelections, setBoardSelections] = useState([]);
  const [isValidInput, setIsValidInput] = useState(false);

  // INITIALIZE
  useEffect(() => {
    fetchConfigAndData(); // Load config and fetch data
  }, [year]);  // add tabName as a dependency to re-fetch when the tab changes

  const fetchConfigAndData = async () => {

    try {
      const loadedConfig = await loadConfigForYear(year); // Load the config dynamically
      setConfig(loadedConfig); // Set the loaded configuration

      const apiUrl = process.env.REACT_APP_NODE_ENV === 'production'
        ? process.env.REACT_APP_SERVER_URL_PRODUCTION
        : process.env.REACT_APP_SERVER_URL_STAGING;

      // Get registered (eligible) teams
      fetch(`${apiUrl}/api/${year}/admin_get_database_list`, {    
        method: 'POST',    
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tableName: `teams${year}`})
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
        });
  
        setRegisteredTeamList(tempList);
        setRegisteredTeamNameList(tempNameList);
        setIsLoaded(true);

      });

    } catch (error) {
      console.log('There was an error loading initial data from the server in the admin add pots component: ' + error);
    }
  };

  const delayRefresh = () => {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleClose = () => {
    setIsValidInput(false);
    setIsLoaded(false);
    setTeamId();
    setTeamName();
    setTeamIsSelected(false);
    setBoardSelections([]);
    setRegisteredTeamList([]);
    setRegisteredTeamNameList([]);
    setIsSubmitting(false);
    setIsSubmitted(false); // Reset isSubmitted state on close
    props.close();
  };

  const validateUserInput = () => {

    if (!teamId || !teamName) {
      toast.warning("Please select a team.");
      return false;
    }

    if (boardSelections.length === 0) {
      toast.warning("Please select at least one pot.");
      return false;
    }

    setIsValidInput(true);
    return true;
  };

  const handleFormSubmission = async () => {
    if (validateUserInput()) {
      setIsSubmitting(true);

      let apiUrl = null;
      if (process.env.REACT_APP_NODE_ENV === "staging") {
        apiUrl = process.env.REACT_APP_SERVER_URL_STAGING;
      } else if (process.env.REACT_APP_NODE_ENV === "production") {
        apiUrl = process.env.REACT_APP_SERVER_URL_PRODUCTION;
      }
  
      // Check for duplicate teamId in the current potYear collection
      try {
        const checkDuplicateResponse = await fetch(`${apiUrl}/api/${year}/admin_add_pot_check_for_duplicate_entries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            potYear: `pots${year}`,
            teamId,
          }),
        });
  
        const duplicateData = await checkDuplicateResponse.json();
  
        if (duplicateData.exists) {
          toast.warning('This team has already been added to the pot for the selected year.');
          setIsSubmitting(false);
          return; // Stop the submission if a duplicate entry is found
        }
      } catch (error) {
        console.error('Error checking for duplicate teamId:', error);
        toast.error('Error checking for duplicate entry. Please try again.');
        setIsSubmitting(false);
        return; // Stop further execution if there's an error in duplicate check
      }
  
      let formData = {
        potYear: `pots${year}`,  // Pot year
        teamId,
        teamName,
      };
  
      // Add board selections
      const allBoardSelections = config?.potsConfig?.CONFIG_POTS_BOARD_LIST.map((boardObj) => {
        const boardName = Object.keys(boardObj)[0];
        const selectedBoard = boardSelections.find(selection => selection.board === boardName);
  
        // If the board is selected, keep its data, otherwise add it with empty potList and totalFee 0
        return selectedBoard || {
          board: boardName,
          potList: [],
          totalFee: 0,
        };
      });
      formData["boardSelections"] = allBoardSelections;
  
      // Add total fees for each board
      allBoardSelections.forEach((selection) => {
        const boardFeeKey = `total${selection.board.replace(/ /g, '')}Fee`;
        formData[boardFeeKey] = selection.totalFee;
      });
  
      try {
        fetch(`${apiUrl}/api/${year}/admin_add_pot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',  // Ensures we're sending JSON
          },
          body: JSON.stringify(formData),  // Stringify the entire JSON data
        })
          .then((res) => {
            if (res.ok) {
              toast.success('Successfully added new pot entry! Page refreshing...');
              setIsSubmitted(true); // Set the submission as complete to hide the button
              delayRefresh();
            }
          })
          .catch((e) => {
            console.error(e);
            toast.error('Error while attempting to save pot entry to the database. Please try again or contact the site administrator.');
            delayRefresh();
            handleClose();
          })
          .finally(() => {
            setIsSubmitting(false); // Reset submission state
          });
      } catch (e) {
        console.log('There was an error while attempting to save the pot entry to the database:', e);
        setIsSubmitting(false); // Reset submission state
      }
    } else {
      console.log('Input was not valid or there was an error');
      setIsSubmitting(false); // Reset submission state
    }
  };
  
  // HANDLERS
  const handleTeamSelection = (event, value) => {
    setTeamId(value["teamKey"]);
    setTeamName(value["teamData"]["teamName"]);
    setTeamIsSelected(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const handleBoardSelection = (boardName, isSelected) => {
    const newSelections = [...boardSelections];
    const pots = config?.potsConfig?.CONFIG_POTS_BOARD_LIST.find(board => board[boardName])[boardName];
    const totalFee = pots.reduce((acc, pot) => acc + pot.amount, 0);
  
    const currentBoardIndex = newSelections.findIndex(selection => selection.board === boardName);
  
    if (isSelected) {
      // If the board isn't selected yet, add all pots for the board
      if (currentBoardIndex === -1) {
        newSelections.push({
          board: boardName,
          potList: pots.map(pot => pot.title),
          totalFee,
        });
      } else {
        // If the board is partially selected, add the remaining pots
        const currentBoard = newSelections[currentBoardIndex];
        currentBoard.potList = pots.map(pot => pot.title); // Select all pots
        currentBoard.totalFee = totalFee;
        newSelections[currentBoardIndex] = currentBoard;
      }
    } else {
      // Unselect all pots for this board
      newSelections.splice(currentBoardIndex, 1);
    }
  
    setBoardSelections(newSelections);
  };
  
  const handlePotSelection = (boardName, potTitle, isSelected, potAmount) => {
    const newSelections = [...boardSelections];
    const currentBoardIndex = newSelections.findIndex(selection => selection.board === boardName);
    let currentBoard = newSelections[currentBoardIndex] || {
      board: boardName,
      potList: [],
      totalFee: 0,
    };
  
    if (isSelected) {
      if (!currentBoard.potList.includes(potTitle)) {
        currentBoard.potList.push(potTitle);
        currentBoard.totalFee += potAmount;
      }
    } else {
      currentBoard.potList = currentBoard.potList.filter(pot => pot !== potTitle);
      currentBoard.totalFee -= potAmount;
  
      // If all pots are unselected, remove the board from the selections
      if (currentBoard.potList.length === 0) {
        newSelections.splice(currentBoardIndex, 1);
      }
    }
  
    if (currentBoard.potList.length > 0 && currentBoardIndex === -1) {
      newSelections.push(currentBoard);
    } else if (currentBoard.potList.length > 0) {
      newSelections[currentBoardIndex] = currentBoard;
    }
  
    setBoardSelections(newSelections);
  }; 

  return (
    <Dialog open={props.status} onClose={handleClose} fullWidth maxWidth="sm">
      <form action="/" method="POST" onSubmit={(e) => { e.preventDefault(); alert('Submitted form!'); handleClose(); }}>
        <DialogTitle>Add {props.year} Pot Entry<IconButton onClick={handleClose} style={{ float: 'right' }}><CloseIcon color="primary"></CloseIcon></IconButton></DialogTitle>
        <DialogContent>
          <Stack spacing={2} margin={2}>

            {/* Select team */}
            <InputLabel required id="angler-label">Select team</InputLabel>
            {!isLoaded ? (
                <CircularProgress/>
              ) : (
                <Autocomplete
                  disablePortal
                  id="select-angler-autocomplete-box"
                  options={registeredTeamNameList}
                  renderInput={(params) => <TextField {...params} label="Team name"/>}
                  onChange={handleTeamSelection}
                />
              )
            }            

            {/* Select pots */}
            {config?.potsConfig?.CONFIG_POTS_BOARD_LIST.map((boardObj, boardIndex) => {
              const boardName = Object.keys(boardObj)[0];
              const pots = boardObj[boardName];
              const isBoardSelected = boardSelections.find(selection => selection.board === boardName);
              const selectedPots = isBoardSelected ? isBoardSelected.potList : [];

              return (
                <div key={boardIndex}>
                  <InputLabel>{boardName} Pots</InputLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPots.length === pots.length}
                        indeterminate={selectedPots.length > 0 && selectedPots.length < pots.length}
                        onChange={(e) => handleBoardSelection(boardName, e.target.checked)}
                      />
                    }
                    label="Select All"
                  />
                  {pots.map((pot, potIndex) => (
                    <FormControlLabel
                      key={potIndex}
                      control={
                        <Checkbox
                          checked={selectedPots.includes(pot.title)}
                          onChange={(e) =>
                            handlePotSelection(boardName, pot.title, e.target.checked, pot.amount)
                          }
                        />
                      }
                      label={`${pot.title}`}
                    />
                  ))}
                </div>
              );
            })}

            {/* Tally fee(s) */}
            <div>
              <h3>Total Fees: {formatCurrency(boardSelections.reduce((acc, selection) => acc + selection.totalFee, 0))}</h3>
              {boardSelections.map((boardSelection, index) => (
                <div key={index}>
                  <h4>{formatCurrency(boardSelection.totalFee)} in {boardSelection.board} Pots</h4>
                </div>
              ))}
            </div>

            {/* Submit button */}
            {!isSubmitted ? (
              <Button
                color="primary"
                variant="contained"
                disabled={boardSelections.length === 0 || isSubmitting}
                onClick={handleFormSubmission}
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

export default AdminAddPotModal;

