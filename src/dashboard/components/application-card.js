import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TextField } from '@mui/material';
import '../styles/framework-dashboard.css';


export default function ApplicationCard(props) {

  const handleCopySSH = () => {
    navigator.clipboard.writeText(props.sshKey)
  }

  return (
    <Card sx={{ maxWidth: 345 }}  className='app-card' >
      <CardMedia
        component="img"
        height="140"
        src={require("../../resources/sgx-logo.png")}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
           Application name : {props.applicationName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            Virtual Machine IP : {props.virtualMachineIp}
        </Typography>
        <Typography variant="body2" color="text.secondary">
            SSH Connection username : {props.sshUsername}
        </Typography>
        <TextField disabled size='small' className='ssh-field'></TextField>
        <Button onClick={handleCopySSH} startIcon={<ContentCopyIcon className='ssh-copy-icon' size='large'/>}/>
      </CardContent>
    </Card>
  );
}