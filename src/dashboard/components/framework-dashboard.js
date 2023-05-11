import { useEffect, useState, useRef } from 'react';
import { Container, Button, TextField, Link, Grid, Box, Typography, Tooltip, FormGroup, Input, IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput} from '@mui/material';
import '../styles/framework-dashboard.css';
import { isAuthorized } from '../../auth/api/auth-api'
import { HOST } from '../../hosts';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate  } from 'react-router';
import ResponsiveAppBar from '../../navbar/component/navbar';
import { deploy, uploadApplication } from '../api/framework-dashboard-api';

function FrameworkDashboard() {
 
  const [logReceived, setLogReceived] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [renderNewDeployment, setRenderNewDeployment] = useState(true);
  const [renderDeployedApplications, setRenderDeployedApplications] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInput = useRef(null)
  const sock = new SockJS(HOST.backend_api_websocket_deployment_logs);
  const navigate = useNavigate();
  
  const handleOpenSocket = () => {

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
        stompcli.subscribe("/azure/deployment-logs", function (webSocketResponse) {
          setLogReceived(logReceived => [...logReceived, JSON.parse(webSocketResponse.body).message] );
        });
    });
  }

  const handleStartDeployment = async () => {
     const formData = new FormData();
     formData.append('file', selectedFile);
     const buffer = await selectedFile.arrayBuffer();
     let byteArray = new Int8Array(buffer);
     const base64String = btoa(String.fromCharCode(...new Uint8Array(byteArray)));
     const fileUploadDto = {
      "encodedByteArray": base64String,
      "applicationName":  document.getElementById("app-name-id").value,
     }
    let resp = await uploadApplication(fileUploadDto);

    const deployDto = {
      applicationName: document.getElementById("app-name-id").value,
    }
    deploy(deployDto);
  }

  useEffect(() => {
    const isAuthorizedWrapper = async () => {
      let authDto = {
        "subscriptionId": "",
        "tenantId": "",
        "loggedInUser": localStorage.getItem("loggedInUser"),
        "userPrincipalName": localStorage.getItem("userPrincipalName"),
      }
      let resp = await isAuthorized(authDto, setIsLoggedIn, navigate);
    }
    
    isAuthorizedWrapper();
    handleOpenSocket();
    setIsLoaded(true);
  }, [isLoaded, isLoggedIn])

  return (
      isLoaded && isLoggedIn &&
      <Box>
        <ResponsiveAppBar 
          setRenderNewDeployment={setRenderNewDeployment}
          setRenderDeployedApplications={setRenderDeployedApplications}
          >
        </ResponsiveAppBar>
        {
          renderNewDeployment && 
          <div className='background-container'>
            <FormGroup>
              <Typography>Please input your compiled .exe.</Typography>
              <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <InputLabel htmlFor="app-name-id">Application name</InputLabel>
                <OutlinedInput
                    id="app-name-id"
                    type='text'
                    label="Application name">
                </OutlinedInput>
                
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={()=>fileInput.current.click()}
                >
                upload file
                </Button>

                <input 
                  ref={fileInput} 
                  type="file" 
                  style={{ display: 'none' }}
                  onChange={(e) => {setSelectedFile(e.target.files[0])}}
                />
              </FormControl>

              <Button onClick={handleStartDeployment}>Start Deployment</Button>

            </FormGroup>
            <div className='logs-container'>
              {
                logReceived.map((log) => <Typography>{log}</Typography>)
              }
            </div>
          </div>
        } 
        {
          renderDeployedApplications &&
          <Container className='background-container'>
            ALL APPS
          </Container>
        }
      </Box>
    );
  }
  
  export default FrameworkDashboard;