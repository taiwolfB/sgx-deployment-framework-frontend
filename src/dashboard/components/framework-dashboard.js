import { useEffect, useState, useRef } from 'react';
import { CircularProgress, Alert, Container, Button, TextField, Link, Grid, Box, Typography, Tooltip, FormGroup, Input, IconButton, InputAdornment, FormControl, InputLabel, OutlinedInput} from '@mui/material';
import '../styles/framework-dashboard.css';
import { isAuthorized } from '../../auth/api/auth-api'
import { HOST } from '../../hosts';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate  } from 'react-router';
import ResponsiveAppBar from '../../navbar/component/navbar';
import { deploy, getDeployedApplications, uploadApplication } from '../api/framework-dashboard-api';
import ApplicationCard from "./application-card"

function FrameworkDashboard() {
 
  const [logReceived, setLogReceived] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(true);
  const [renderNewDeployment, setRenderNewDeployment] = useState(true);
  const [renderDeployedApplications, setRenderDeployedApplications] = useState(false);
  const [deployedApplications, setDeployedApplications] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInput = useRef(null);
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
           const presentLogs = logReceived.slice();
           if (!presentLogs.find(e => e === JSON.parse(webSocketResponse.body).message)) {
            setLogReceived(logReceived => [...logReceived, JSON.parse(webSocketResponse.body).message]);
           }
        });
    });
  }

  const handleStartDeployment = async () => {
    if (JSON.parse(localStorage.getItem("isDeploymentInProgress")) === false) {
      localStorage.setItem("isDeploymentInProgress", true);
      console.log(localStorage.getItem("isDeploymentInProgress"))
      setLogReceived([]);
      if (selectedFile !== null ) {
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
      } else {
        alert('You must select an application to be deployed. It must be compiled for Linux platform and it must be .exe format.')
      }
    } else {
      alert('There can be only one deployment in progress at one time.');
    }
    localStorage.setItem("isDeploymentInProgress", false);
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
    
    if (localStorage.getItem("isDeploymentInProgress") === undefined || localStorage.getItem("isDeploymentInProgress") === null) {
      localStorage.setItem("isDeploymentInProgress", false);
    }
    isAuthorizedWrapper();
    handleOpenSocket();
    setIsLoaded(true);
  }, [])

  useEffect(() => {
    const getDeployedAppsAsync = async () => {
      if (renderDeployedApplications) {
        let response = await getDeployedApplications(setDeployedApplications, setIsDataFetched);
      }
    }
    getDeployedAppsAsync();
  }, [renderDeployedApplications])

  return (
      isLoaded && isLoggedIn &&
      <div className="big-container">
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
                logReceived.map((log) => <Typography key={log}>{log}</Typography>)
              }
            </div>
          </div>
        } 
        {
          renderDeployedApplications && isDataFetched &&
          <div className='background-container-apps'>
              {
                deployedApplications.map(app => 
                  <div>
                        <ApplicationCard 
                        key={app.applicationName + app.virtualMachineIp}
                        applicationName={app.applicationName}
                        virtualMachineIp={app.virtualMachineIp}
                        sshUsername={app.sshUsername}
                        sshKey={app.sshKey}
                      />
                  </div>
                ) 
              }
          </div>
        }
        {
          renderDeployedApplications && !isDataFetched &&
          <div className='background-container' >FETCHING DATA, PLEASE WAIT
            <CircularProgress />
          </div> 
        }
      </div>
    );
  }
  
  export default FrameworkDashboard;