import React, {useState} from 'react';
import {Grid, Paper, Avatar, TextField, Checkbox, FormControlLabel, Button} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

const Login = (props) => {

  const paperStyle = {padding: 20, height: 400, width: 350, margin: 20};
  const avatarStyle = {backgroundColor: '#1876D1'};

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    props.handleLogin(e, email, password);
  }

  return (
    <Grid>
      <Paper variant='elevation' elevation={10} style={paperStyle}>
        <Grid align='center'>
          <Avatar style={avatarStyle}>
            <LockOutlined></LockOutlined>
          </Avatar>
        </Grid>
        <br/>
        <h2>Administrator Login</h2>
        <br/>
        <TextField 
          variant="outlined" label='Email' placeholder="Enter admin email" fullWidth required onChange={(e) => setEmail(e.target.value)}></TextField>
        <br/>
        <br/>
        <TextField variant="outlined" label='Password' placeholder="Enter admin password" fullWidth required type='password' onChange={(e) => setPassword(e.target.value)}></TextField>
        <br/>
        <br/>
        <br/>
        <Button type="submit" color="primary" variant="contained" fullWidth onClick={handleLogin} >Sign In</Button>
      </Paper>
    </Grid>
  )
} 

export default Login;

