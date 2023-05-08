import { HOST } from "../../hosts";

async function authorize(authDto) {
    let request = new Request(HOST.backend_api_authorize, {
        method: 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authDto)
    });

    console.log(HOST.backend_api_authorize)
    
    await fetch(request)
        .then(
            function(response) {
                if (response.ok) {
                    response.json().then(resp => {
                        if (resp.httpCode === 200 ) {
                            localStorage.setItem("loggedInUser", resp.loggedInUser);
                            localStorage.setItem("userPrincipalName", resp.userPrincipalName);
                        }
                    })
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

async function isAuthorized(authDto) {
    let request = new Request(HOST.backend_api_is_authorized, {
        method: 'POST',
        headers : {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authDto)
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

// function unauthorize(user) {
//     let request = new Request(HOST.backend_api_logout, {
//         method: 'POST',
//         headers : {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(user)
//     });

//     fetch(request)
//         .then(
//             function(response) {
//                 if (response.ok) {
//                     response.json().then(json => callback(json, response.status,null));
//                 }
//                 else {
//                     response.json().then(err => callback(null, response.status,  err));
//                 }
//             })
//         .catch(function (err) {
//             //catch any other unexpected error, and set custom code for error = 1
//             callback(null, 1, err)
//         });
// }


// export async function performRequestAsync(request, callback){
    
// }


export {
    authorize,
    isAuthorized,
    // unauthorize
};
