// import express from "express"
const { default: axios } = require('axios')
const express = require('express')
// import HTTPSnippet from "httpsnippet";
const HTTPSnippet = require("httpsnippet")
const PORT = 6969

const app = express()
app.use(express.json())


const getAxiosRequestOptions = (harRequestObject) => {
  console.log('Got request:', harRequestObject);

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
// TODO: @nsr add rule fetcher

const applyRulesToRequest = (requestOptions) => {
  
  // TODO: @nsr add action processor
  
  return requestOptions
}

const applyRulesToResponse = (response) => {
  
  // TODO: @nsr add action processor
  
  return response
}

const sendLogToFirebase = (req, response) => {
  // TODO: @nsr
  /**
   * - Add firebase sdk
   * - create har and send (take referrence from existing logger)
   */
}

/**
 * Apply rules at both on Request
 * Sends request using axios
 * Applys rules on response
 * Sends request and response as logs to firebase
 * @param {*} harObject Har recieved in post request body
 * @returns Promise that resolve to response to be returned 
 */
const getResponseFromHarRequest = (harObject) => {
  let requestOptions  = getAxiosRequestOptions(harObject.log.entries[0].request)

  requestOptions = applyRulesToRequest(requestOptions)

  return new Promise((resolve, reject) => {
    axios(requestOptions)
    .then(res => {
      let response = applyRulesToResponse(res)
      sendLogToFirebase(requestOptions, response)
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
    res.send(response)
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})