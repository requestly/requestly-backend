import express from "express";

import { PORT, DEVICE_ID_HEADER, SDK_ID_HEADER } from "./constants.js";
import { getResponseFromHarRequest } from "./utils/passThrough.js";

/* Create App */
const app = express()
app.use(express.json())


app.post('/proxyRequest', async (req, res) => {
  let harObject = req.body;
  let sdkId = req.headers[SDK_ID_HEADER]
  let deviceId = req.headers[DEVICE_ID_HEADER]
  
  if(!sdkId || !deviceId) {
    res.status(400).send(`${SDK_ID_HEADER} and ${DEVICE_ID_HEADER} headers are must`)
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