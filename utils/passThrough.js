import axios from "axios";
/* Utils */
import { 
  getAxiosRequestOptionsFromHar, 
  getHarResponseAttributeFromAxiosResponse 
} from "./harConverter.js";
import { DEVICE_ID_HEADER, SDK_ID_HEADER } from "../constants.js";;
/**
 * performs request using axios
 * Sends request and response as har to firebase
 * @param {*} harObject Har recieved in post request body
 * @returns Promise that resolve to response to be returned 
 */
export function getResponseFromHarRequest(harObject, deviceId, sdkId) {
  let harRequest = harObject.log.entries[0].request // ASSUMES SINGLE ENTRY IN HAR
  let requestOptions  = getAxiosRequestOptionsFromHar(harRequest)
  
  return new Promise((resolve, reject) => {
    axios(requestOptions)
    .then(async (response) => {
    await sendLogToFirebase(harObject, response, deviceId, sdkId)
    resolve(response)
    })
    .catch(async (error) => {
    console.log("Axios promise could not be resolved");
    if (error.response) {
      await sendLogToFirebase(harObject, error.response, deviceId, sdkId)
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

async function sendLogToFirebase (originalHarObject, response, deviceId, sdkId){
  let finalHarObject = originalHarObject
  let harEntry = finalHarObject.log?.entries[0] // ASSUMES SINGLE ENTRY IN HAR
  // update finalHar response object
  if(harEntry) {
    harEntry.response = getHarResponseAttributeFromAxiosResponse(response)
  }

  let headers = {}
  headers["Content-Type"] = "application/json"
  headers[DEVICE_ID_HEADER] = deviceId
  headers[SDK_ID_HEADER] = sdkId

  return axios({
    method: "post",
    // url : "https://us-central1-project-7820168409702389920.cloudfunctions.net/", // prod
    url : "https://us-central1-requestly-dev.cloudfunctions.net/addSdkLog", // beta
    headers,
    data: {data: JSON.stringify(finalHarObject)}
  }).then(() => {
    console.log("Successfully sent data to firebase, got response");
  }).catch(error => {
    console.log(`Could not send to firebase, device - ${deviceId}, sdk - ${sdkId}`, error.response.status);
  })

  // // Using firebaseSDK
  // const functions = getFunctions();
  // const addSdkLog = httpsCallable(functions, "addSdkLog");
  // addSdkLog(axiosHar)
  // .then(console.log)
  // .catch(console.error)
}