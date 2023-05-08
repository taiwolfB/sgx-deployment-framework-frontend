import { useEffect, useState } from 'react';
import { Container, Button, TextField, Link, Grid, Box, Typography, Tooltip, FormGroup, Input, IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput} from '@mui/material';
import '../styles/auth-component.css';
import { authorize, isAuthorized } from '../api/auth-api';
import { HOST } from '../../hosts';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router';

function AuthComponent() {
  
  const [openAzurePopup, setOpenAzurePopup] = useState(false);
  const [deviceCode, setDeviceCode] = useState("");
  const [showTenantId, setShowTenantId] = useState(false);
  const [showSubscriptionId, setShowSubscriptionId] = useState(false);
  const navigate = useNavigate();

  const handleClickShowTenantId= () =>  {
    setShowTenantId(!showTenantId);
  }

  const handleClickShowSubscriptionId= () => {
    setShowSubscriptionId(!showSubscriptionId);
  }

  const changePopupState = () => {
    setOpenAzurePopup(!openAzurePopup)
  }

  const handleLogin = async () => {
    let authDto = {
      "subscriptionId": document.getElementById('azure-subscription-id').value,
      "tenantId": document.getElementById('azure-tenant-id').value,
    };
    let response = await authorize(authDto);
    
    if (localStorage.getItem("loggedInUser") !== '' && localStorage.getItem("userPrincipalName") !== '') {
      navigate('/dashboard')
    }
  }
  
  const handleOpenSocket = () => {

    var sock = new SockJS(HOST.backend_api_websocket_device_code);
    
    sock.onopen = function() {
        console.log('open socket');
    };

    sock.onmessage = function(e) {
        sock.close();
    };

    sock.onclose = function() {
        console.log('close');
    };

    
    var stompcli = Stomp.over(sock);
    stompcli.connect({}, function (frame) {
        stompcli.subscribe("/azure/device-code-provider", function (webSocketResponse) {
          window.open(JSON.parse(webSocketResponse.body).url);
          setDeviceCode(JSON.parse(webSocketResponse.body).deviceCode);
        });
    });
  }


  useEffect(() => {
    handleOpenSocket();
  }, [])

  return (
    <Container className = 'welcome-page-container'>
      {/* <Typography component = 'div' variant = 'h3'>
        A framework for safe deployments of Intel SGX Applications
      </Typography> * */}
      <Container className = 'login-container'>
        <img className = 'login-image' src={require('../../resources/deployment.png')}/>
        <Box className = 'form-box'>
          <Typography component = 'h1' variant = 'h5'>
            Please choose your desired cloud provider
          </Typography>
          <div className = 'form' >
            <Button className='logo-button' onClick={changePopupState}>
              <img className="logo-img" src={require("../../resources/azure-logo.png")}/>
            </Button>
            <Tooltip title="At this point, the only cloud provider which supports Confidential Computing(Intel SGX) platforms is Microsoft Azure.">
              <span>
                <Button className='logo-button' disabled>
                <img className="logo-img" src={require("../../resources/aws-logo.png")}/>
                </Button>
              </span>
            </Tooltip>
            <Tooltip title="At this point, the only cloud provider which supports Confidential Computing(Intel SGX) platforms is Microsoft Azure.">
              <span>
                <Button className='logo-button' disabled>
                  <img className="logo-img" src={require("../../resources/google-cloud-logo.png")}/>
                </Button>
              </span>
            </Tooltip>
          </div>
        </Box>
        {
              openAzurePopup && 
                <FormGroup>
                  <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                    <InputLabel htmlFor="azure-subscription-id">Azure Subscription Id</InputLabel>
                    <OutlinedInput
                        id="azure-subscription-id"
                        type={showSubscriptionId ? 'text' : 'password'}
                        value="3509478a-02c5-4d60-9e10-9ef8a91f9fe6"
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowSubscriptionId}
                              edge="end"
                            >
                              {showSubscriptionId ? <VisibilityOff /> : <Visibility/>}
                            </IconButton>
                          </InputAdornment>
                          }
                        label="Password">
                    </OutlinedInput>
                  </FormControl>
                  <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                    <InputLabel htmlFor="azure-tenant-id">Azure Tenant Id</InputLabel>
                    <OutlinedInput
                        id="azure-tenant-id"
                        value="9f558ccc-b781-4dd7-aefe-fb3db49503c9"
                        type={showTenantId ? 'text' : 'password'}
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowTenantId}
                              edge="end"
                            >
                              {showTenantId ? <VisibilityOff /> : <Visibility/>}
                            </IconButton>
                          </InputAdornment>
                          }
                        label="Password">
                    </OutlinedInput>
                  </FormControl>
              <Button className='custom-button' onClick={handleLogin}>Login</Button>
              {
                deviceCode !== "" && 
                  <span>
                    <span>Please input the code {deviceCode}</span>
                    <br/>
                    <span>and follow the Azure login process.</span>
                  </span>
              }
              </FormGroup>
          }
      </Container>
    </Container>
  );
}

export default AuthComponent;
