const express = require('express')
const { default: axios } = require('axios')
const {AxiosHarTracker} = require("axios-har-tracker")

/** CONSTANTS */
const PORT = 6969
// RQ HEADERS 
// @sahil, using "-" instead of "_" will require rewrite in both firebase function and sdk
// const deviceIdHeader = "device-id"
// const sdkIdHeader = "sdk-id"
const deviceIdHeader = "device_id"
const sdkIdHeader = "sdk_id"

// session state // I agree, not the best way
let deviceId = "", sdkId = ""; 

/* Create App */
const app = express()
app.use(express.json())
const axiosTracker = new AxiosHarTracker(axios); 

/* Utils */
function getAxiosRequestOptionsFromHar (harRequestObject) {
  // console.log('Got request:', harRequestObject);

  let headersArray = harRequestObject.headers
  let headersObjects = {}

  for(let header of headersArray) {
    headersObjects[header.name] = header.value
  }

  let data = harRequestObject.postData
  let body = harRequestObject.postData?.text
  if(data && data.mimeType == "application/json")  {
    try {
      body = JSON.parse(data)
    } catch(err) {
      console.error("Error in try-catch", err)
    }
  }

  const requestOptions = {
    url: harRequestObject.url,
    method: harRequestObject.method.toLowerCase(),
    headers: headersObjects,
    data: body
  }
  return requestOptions
}

function getHarResponseAttributeFromAxiosResponse (axiosResponse) {
  // headers
  let headersArray = []
  for(let name in axiosResponse.headers) {
    let _headerObject = {
      name,
      value: axiosResponse.headers[name],
      comment: ""
    }
    headersArray.push(_headerObject)
  }
  
  // content
  let responseAsText = ""
  if(
    axiosResponse.headers['content-type'].includes("application/json") &&
    typeof axiosResponse.data == "object"
  ) {
    try {
      responseAsText = JSON.stringify(axiosResponse.data)
    } catch (err) {
      console.error("Error in try-catch", err)
    }
  } else if (typeof axiosResponse.data != "string"){
    console.log("Error: Fetched response that is neither a string nor a json", axiosResponse.data)
  } else {
    responseAsText = axiosResponse.data
  }

  let contentObject = {
    mimeType: axiosResponse.headers['content-type'] || "",
    text: responseAsText,
    bodySize: responseAsText.length
    // size: ?? // size of uncompressed data
  }

  return {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    headers: headersArray,
    content: contentObject
  }
}

async function sendLogToFirebase (harObject, requestOptions, response){
  let finalHarObject = harObject
  let harEntry = finalHarObject.log?.entries[0] // ASSUMES SINGLE ENTRY IN HAR
  // update finalHar response object
  if(harEntry) {
    harEntry.response = getHarResponseAttributeFromAxiosResponse(response)
  }

  let headers = {}
  headers["Content-Type"] = "application/json"
  headers[deviceIdHeader] = deviceId
  headers[sdkIdHeader] = sdkId

  return axios({
    method: "post",
    // url : "https://us-central1-project-7820168409702389920.cloudfunctions.net/", // prod
    url : "https://us-central1-requestly-dev.cloudfunctions.net/addSdkLog", // beta
    headers,
    data: {data: JSON.stringify(finalHarObject)}
  }).then(() => {
    console.log("Successfully sent data to firebase, got response");
  }).catch(error => {
    // console.log("Error when sending log to firebase", error);
    console.log(`Could not send to firebase, device - ${deviceId}, sdk - ${sdkId}`, error.response.status);
  })

  // // Using firebaseSDK
  // const functions = getFunctions();
  // const addSdkLog = httpsCallable(functions, "addSdkLog");
  // addSdkLog(axiosHar)
  // .then(console.log)
  // .catch(console.error)
}

const errRequestWithoutRQHeaders = new Error("Device ID or SDK ID not Passed")
/**
 * performs request using axios
 * Sends request and response as har to firebase
 * @param {*} harObject Har recieved in post request body
 * @returns Promise that resolve to response to be returned 
 */
function getResponseFromHarRequest(harObject) {
  let harRequest = harObject.log.entries[0].request // ASSUMES SINGLE ENTRY IN HAR
  let requestOptions  = getAxiosRequestOptionsFromHar(harRequest)
  // console.log(requestOptions);

  return new Promise((resolve, reject) => {
    axios(requestOptions)
    .then(async (response) => {
      await sendLogToFirebase(harObject, requestOptions, response)
      resolve(response)
    })
    .catch(async (error) => {
      console.log("Axios promise could not be resolved");
      if (error.response) {
        await sendLogToFirebase(harObject, requestOptions, error.response)
        resolve(error.response)
      } else if (error.request) {
        // The request was made but no response was received
        console.log("No response recieved for request",error.request);
        reject(error)
      } else {
        console.log('Unexpected Error', error.message);
        reject(error)
      }
    })
  })
}
app.post('/proxyRequest', async (req, res) => {
  let harObject = req.body;

  if(!(req.headers[sdkIdHeader] && req.headers[deviceIdHeader])) {
    res.status(400).send(`${sdkIdHeader} and ${deviceIdHeader} headers are must`)
  } else {
    sdkId = req.headers[sdkIdHeader]
    deviceId = req.headers[deviceIdHeader]
    
    await getResponseFromHarRequest(harObject).then((response) => {
      // console.log("returning", response)
      res.status(response.status)
      res.header(response.headers)
      res.send(response.data)
    }).catch(error => {
      console.error("Unexpected Error - ", error)
      res.status(500).send(`Hmm, this was an unexpected crash. Please report this issue`)
    })
    .finally(() => {
      // Cleanup after session // I agree, not the best way
      // console.log("Before cleanup", deviceId, sdkId)
      deviceId = "", sdkId = "";
    })

    
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})