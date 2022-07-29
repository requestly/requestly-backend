import express from "express";
import { getResponseFromHarRequest } from "./utils/passThrough.js";
import { sendEventToFirestore } from "./utils/firebase/firestoreActions.js";

import { PORT, SDK_ID_HEADER_KEY, DEVICE_ID_HEADER_KEY } from "./constants/index.js";

import initSdkDevice from "./services/interceptor/init-device.js";
import * as ProxyStartup from "./startup/proxy";

ProxyStartup.initProxy()

/* Create App */
const app = express()
app.use(express.json())


app.post('/proxyRequest', async (req, res) => {
  let harObject = req.body;
  let sdkId = req.headers[SDK_ID_HEADER_KEY]
  let deviceId = req.headers[DEVICE_ID_HEADER_KEY]
  
  if(!sdkId || !deviceId) {
    res.status(400).send(`${SDK_ID_HEADER_KEY} and ${DEVICE_ID_HEADER_KEY} headers are must`)
  } else if (!Object.keys(req.body).length || !req.body.log || !req.body.log.entries) {
    res.status(400).send(`Request body is incorrect`)
  } else {
    await getResponseFromHarRequest(harObject, deviceId, sdkId).then((response) => {
      res.status(response.status)
      res.header(response.headers)
      res.send(response.data)
    }).catch(error => {
      console.error("Unexpected Error - ", error)
      res.status(500).send(`Hmm, this was an unexpected crash. Please report this issue`)
    })
  }
})

app.post('/events', async (req, res) => {
  let sdkId = req.headers[SDK_ID_HEADER_KEY]
  let deviceId = req.headers[DEVICE_ID_HEADER_KEY]
  
  if(!sdkId || !deviceId) {
    res.status(400).send(`${SDK_ID_HEADER_KEY} and ${DEVICE_ID_HEADER_KEY} headers are must`)
  } else if (
    !Object.keys(req.body).length || 
    !req.body.eventName || 
    !req.body.eventData || 
    !req.body.documentId
  ) { 
    res.status(400).send(`Request body is incorrect`)
  } else {

    let result = {
      success: true,
      message: ""
    }

    sendEventToFirestore(sdkId, deviceId, req.body)
    .then(() => {
      res.status(200)
    }).catch(err => {
      result = {
        success: false,
        message: err.toString()
      }
      res.status(500)
    })
    res.send(result)
  }
})

app.get('/initSdkDevice', async (req, res) => {
    const headers = req.headers || {};

    if(!headers["sdk_id"]) {
      return res.status(400).json({
        success: false,
        message: "sdk_id header is must"
      })
    }

    const sdkId = headers["sdk_id"];
    const deviceId = headers["device_id"];
    const deviceDetails = {
      model: headers["device_model"] || null,
      name: headers["device_name"] || null,
    }
    const captureEnabled = headers["capture_enabled"] === "true";

    let initDeviceId = null;
    try {
      initDeviceId = await initSdkDevice(sdkId, deviceId, captureEnabled, deviceDetails);
    } catch (err) {
      return res.status(400).json({
        status: false,
        message: err.message,
      })
    }
    
    if(!deviceId) {
      return res.status(201).json({
        success: true,
        "device-id": initDeviceId,
      })
    }
    
    return res.status(200).json({
      success: true,
      "device-id": initDeviceId,
    })
})

app.get('/healthCheck', async (req, res) => {
  return res.status(200).json("All is Well");
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})