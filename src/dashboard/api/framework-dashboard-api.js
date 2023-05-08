import { HOST } from "../../hosts";

async function uploadApplication(fileUploadDto) {
    let request = new Request(HOST.backend_api_upload, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(fileUploadDto),
    });

    await fetch(request)
        .then(
            function(response) {
                if (response.ok) {
                    response.json().then(resp => console.log(resp))
                }
                else {
                    response.json().then(err => console.log(err));
                }
            })
        .catch(function (err) {
            //catch any other unexpected error, and set custom code for error = 1
            // callback(null, 1, err)
            console.log(err)
        });
}

async function deploy(deployDto) {
    let request = new Request(HOST.backend_api_deploy, {
        method: 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(deployDto)
    });

    await fetch(request)
        .then(
            function(response) {
                if (response.ok) {
                    response.json().then(resp => console.log(resp))
                }
                else {
                    response.json().then(err => console.log(err));
                }
            })
        .catch(function (err) {
            //catch any other unexpected error, and set custom code for error = 1
            // callback(null, 1, err)
            console.log(err)
        });
}


export {
    deploy,
    uploadApplication
};
