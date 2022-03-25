const express = require('express')
const { default: axios } = require('axios')
const {AxiosHarTracker} = require("axios-har-tracker")

/* Create App */
const PORT = 6969
const app = express()
app.use(express.json())
const axiosTracker = new AxiosHarTracker(axios); 

/* Utils */
const getAxiosRequestOptions = (harRequestObject) => {
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
    } catch  {
      /** nothing */
    }
  }

  return {
    url: harRequestObject.url,
    method: harRequestObject.method.toLowerCase(),
    headers: headersObjects,
    data: body
  }
}

const sendLogToFirebase = () => {
  let axiosHar = axiosTracker.getGeneratedHar();
  console.log("Sending har to firbase", axiosHar)

  // It is obvious, but this needs to happen after the initial axios 
  // else the axiosTracker will record this request as well
  axios({ // beta
    method: "post",
    url : "https://us-central1-requestly-dev.cloudfunctions.net/addSdkLog",
    headers: {
      "Content-Type": "application/json",
      "device_id" : "Test-DeviceID",
      "sdk_id" : "Test-SDKID",
    },
    data: {data: JSON.stringify(axiosHar)}
  })

  // // Using firebaseSDK
  // const functions = getFunctions();
  // const addSdkLog = httpsCallable(functions, "addSdkLog");
  // addSdkLog(axiosHar)
  // .then(console.log)
  // .catch(console.error)
}

/**
 * performs request using axios
 * Sends request and response as har to firebase
 * @param {*} harObject Har recieved in post request body
 * @returns Promise that resolve to response to be returned 
 */
const getResponseFromHarRequest = (harObject) => {
  let harRequest = harObject.log.entries[0].request
  let requestOptions  = getAxiosRequestOptions(harRequest)
  // console.log(requestOptions);

  return new Promise((resolve, reject) => {
    axios(requestOptions)
    .then(res => {
      let response = res.data;
      sendLogToFirebase(harObject, requestOptions, response)
      resolve(response)
    })
    .catch(err => {
      console.log("Axios promise could not be resolved");
      reject(err)
    })
})
}
app.post('/', (req, res) => {
  let harObject = req.body;

  getResponseFromHarRequest(harObject).then((response) => {
    // console.log("returning", response)
    res.send(response)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})