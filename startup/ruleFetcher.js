import axios from "axios";
import { DEVICE_ID_HEADER_KEY, FUNC_GET_DEVICE_RULES, SDK_ID_HEADER_KEY } from "../constants/index.js";
import { RQ_FIREBASE_BASE_URL } from "../configs/secrets.js";

async function getRulesForDevice(sdkId, deviceId) {
    let headers = {}
    headers["Content-Type"] = "application/json"
    headers['device_id'] = deviceId
    headers['sdk_id'] = sdkId
    return axios({
        method: "post",
        url : `${RQ_FIREBASE_BASE_URL}/${FUNC_GET_DEVICE_RULES}`,
        headers
    }).then(res => {
        return res.data
    }).catch(error => {
        console.log(`Could not fetch rules, device - ${deviceId}, sdk - ${sdkId}`, error.response.status);
    })
}


class RulesDataSource {
    static getRuleRecords = async (sdkId, deviceId) => {
        // TODO: Add caching layer
        return await getRulesForDevice(sdkId, deviceId).then((response) =>  {
        // @ts-ignore
        if(response.status) {
            // @ts-ignore
            return [response.rules, "FETCHED"]
        } else {
            // @ts-ignore
            switch (response.err) {
                case "User not associated":
                    return [{}, "UNAVAILABLE"]
                    
                case "Invalid DeviceId":
                    return [{}, "ERROR"]
                }
                    
            }
        }).catch(err => {
            console.log("Rules Fetching: complete failure",err)
            return [{}, "ERROR"]
        })
    }

    getRules = async (requestHeaders) => {
        // TODO: state based error handling using the returned status
        const [records, status] = await RulesDataSource.getRuleRecords(requestHeaders[SDK_ID_HEADER_KEY], requestHeaders[DEVICE_ID_HEADER_KEY])
        // getRulesFromRecords
        let rules = []
        for(let recordId in records) {
            let record = records[recordId]
            if(record.objectType == "rule") {
                rules.push(record)
            }
        }

        console.log("Fetched Rules");
        console.log(JSON.stringify(rules, null, 4));
        return rules
    }
    getGroups = async (requestHeaders) => {
        const [records, status] = await RulesDataSource.getRuleRecords(requestHeaders[SDK_ID_HEADER_KEY], requestHeaders[DEVICE_ID_HEADER_KEY])
        // getGroupsFromRecords
        let groups = []
        for(let recordId in records) {
            let record = records[recordId]
            if(record.objectType == "group") {
                groups.push(record)
            }
        }
        return groups
    }
}


export default RulesDataSource;