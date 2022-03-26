/* Utils */
export function getAxiosRequestOptionsFromHar (harRequestObject) {
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

export function getHarResponseAttributeFromAxiosResponse (axiosResponse) {
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