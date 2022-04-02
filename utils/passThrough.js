import axios from "axios";
/* Utils */
import { 
  getAxiosRequestOptionsFromHar, 
  getHarResponseAttributeFromAxiosResponse 
} from "./harConverter.js";
import { DEVICE_ID_HEADER, SDK_ID_HEADER } from "../constants/index.js";
import { axiosDefaultConfig } from "../configs/axios-config.js";
import { RQ_FIREBASE_BASE_URL } from "../configs/secrets.js";

// axios = axios.create(axiosDefaultConfig)

/**
 * performs request using axios
 * Sends request and response as har to firebase
 * @param {*} harObject Har recieved in post request body
 * @returns Promise that resolve to response to be returned 
 */
export function getResponseFromHarRequest(harObject, deviceId, sdkId) {
  const _axios = axios.create(axiosDefaultConfig)
  let harRequest = harObject.log.entries[0].request // ASSUMES SINGLE ENTRY IN HAR
  let requestOptions  = getAxiosRequestOptionsFromHar(harRequest)
  
  return new Promise((resolve, reject) => {
    _axios(requestOptions)
    .then(async (response) => {
    // await sendLogToFirebase(harObject, response, deviceId, sdkId)
    delete response.headers["transfer-encoding"]
    resolve(response)
    })
    .catch(async (error) => {
    console.log("Axios promise could not be resolved");
    if (error.response) {
      // await sendLogToFirebase(harObject, error.response, deviceId, sdkId)
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
    url : `${RQ_FIREBASE_BASE_URL}/addSdkLog`,
    headers,
    data: {data: JSON.stringify(finalHarObject)}
  }).then(() => {
    console.log("Successfully sent data to firebase, got response");
  }).catch(error => {
    console.log(`Could not send to firebase, device - ${deviceId}, sdk - ${sdkId}`, error.response.status);
  })
}