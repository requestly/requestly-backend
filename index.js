import express from "express";

import { PORT, SDK_ID_HEADER_KEY, DEVICE_ID_HEADER_KEY } from "./constants/index.js";
import { getResponseFromHarRequest } from "./utils/passThrough.js";

import * as ProxyStartup from "./startup/proxy.js";

/* Create App */
const app = express()
app.use(express.json())


app.post('/proxyRequest', async (req, res) => {
  let harObject = req.body;
  let sdkId = req.headers[SDK_ID_HEADER_KEY]
  let deviceId = req.headers[DEVICE_ID_HEADER_KEY]
  
  if(!sdkId || !deviceId) {
    res.status(400).send(`${SDK_ID_HEADER_KEY} and ${DEVICE_ID_HEADER_KEY} headers are must`)
  } else {
    await getResponseFromHarRequest(harObject, deviceId, sdkId).then((response) => {
      // console.log("returning", response)
      res.status(response.status)
      res.header(response.headers)
      res.send(response.data)
    }).catch(error => {
      console.error("Unexpected Error - ", error)
      res.status(500).send(`Hmm, this was an unexpected crash. Please report this issue`)
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})