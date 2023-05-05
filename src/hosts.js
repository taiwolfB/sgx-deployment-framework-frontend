const out_backend_api = 'http://' + process.env.REACT_APP_BACKEND_HOST + ':' + process.env.REACT_APP_BACKEND_PORT + '/api/v1'
export const HOST = {
    backend_api: 'http://' + process.env.REACT_APP_BACKEND_HOST + ':' + process.env.REACT_APP_BACKEND_PORT +'/api/v1',
    backend_api_authorize: out_backend_api + '/azure/authorize',
    backend_api_websocket: out_backend_api + '/device-code-provider',
    backend_api_is_authorized: out_backend_api + '/azure/is-authorized',
};