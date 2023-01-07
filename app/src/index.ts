import express from "express";
import { getResponseFromHarRequest } from "./utils/passThrough.js";
import { sendEventToFirestore } from "./utils/firebase/firestoreActions.js";

import { PORT, SDK_ID_HEADER_KEY, DEVICE_ID_HEADER_KEY } from "./constants/index.js";

import initSdkDevice from "./services/interceptor/init-device.js";
import * as ProxyStartup from "./startup/proxy";
import axios from "axios";
import redisClient from "./clients/redis.js";

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
    res.status(401).send(`${SDK_ID_HEADER_KEY} and ${DEVICE_ID_HEADER_KEY} headers are must`)
  } else if (
    !Object.keys(req.body).length || 
    !req.body.eventName || 
    !req.body.eventData || 
    !req.body.rowId
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

app.get('/androidSdk/latestVersion', async (req, res) => {
  const updateDetails = {
    "versionName": null, // "2.3.0"
    "versionCode": null, // 2*100*100 + 3*100 + 0 = 20300
    "displayText": "A new version of SDK is available",
    "ctaText": "Check Now",
    "redirectUrl": "https://github.com/requestly/requestly-android-sdk/releases"
  }

  try {
    const REDIS_KEY = "ANDROID_SDK_LATEST_VERSION";
    let latestVersionName = await redisClient.get(`${REDIS_KEY}`);

    // FETCH FROM GITHUB RELEASES
    if(!latestVersionName) {
      console.log("Fetching Android SDK latest version from Github Releases");
      const resp = await axios.get("https://api.github.com/repos/requestly/requestly-android-sdk/releases/latest")
      const latestVersionDetails = resp.data
      latestVersionName = latestVersionDetails && latestVersionDetails["tag_name"] && latestVersionDetails["tag_name"].slice(1)
      redisClient.set(`${REDIS_KEY}`, latestVersionName, {'EX': 86400}); // 1 day expiry
    } else {
      console.log("Fetched latest version from Redis");
    }

    updateDetails.versionName = latestVersionName;
    updateDetails.versionCode = latestVersionName.split('.').map((val) => parseInt(val)).reduce((prev, curr) => { return prev*100 + curr }, 0);
  } catch(err) {
    console.log("Error while fetching latest sdk version", err)
  }

  return res.status(200).json(updateDetails);
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
    const sdkVersion = headers["sdk_version"] as string;
    const deviceDetails = {
      model: headers["device_model"] || null,
      name: headers["device_name"] || null,
    }
    const captureEnabled = headers["capture_enabled"] === "true";

    let initDeviceId = null;
    let isAnonymousSession = true;
    try {
      const initDetails = await initSdkDevice(sdkId, deviceId, captureEnabled, deviceDetails, sdkVersion);
      initDeviceId = initDetails?.deviceId;
      isAnonymousSession = initDetails?.isAnonymousSession
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
        "is_anonymous_session": isAnonymousSession,
      })
    }
    
    return res.status(200).json({
      success: true,
      "device-id": initDeviceId,
      "is_anonymous_session": isAnonymousSession,
    })
})

app.get('/healthCheck', async (req, res) => {
  return res.status(200).json("All is Well");
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})