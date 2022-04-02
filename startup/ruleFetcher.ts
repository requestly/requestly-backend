import axios from "axios";
import { DEVICE_ID_HEADER_KEY, SDK_ID_HEADER_KEY, FUNC_GET_DEVICE_RULES } from "../constants/index.js";
import { RQ_FIREBASE_BASE_URL } from "../configs/secrets.js";
import IRulesDataSource from "rq-proxy/dist/components/interfaces/rules-data-source";

function getRulesForDevice(sdkId: string, deviceId: string) {
    let headers = {}
    headers["Content-Type"] = "application/json"
    headers[DEVICE_ID_HEADER_KEY] = deviceId
    headers[SDK_ID_HEADER_KEY] = sdkId
    return axios({
        method: "post",
        url : `${RQ_FIREBASE_BASE_URL}/${FUNC_GET_DEVICE_RULES}`, // emulator
        headers
    }).then(res => {
        return res.data
    }).catch(error => {
    console.log(`Could not send to firebase, device - ${deviceId}, sdk - ${sdkId}`, error.response.status);
    })
}

class RulesDataSource implements IRulesDataSource {
    static getRuleRecords = async (sdkId: string, deviceId: string) : Promise<[Object, RulesDataSource.RuleFetchStatus]> => {
        // TODO: Add caching layer
        return await getRulesForDevice(sdkId, deviceId).then((response) : [Object, RulesDataSource.RuleFetchStatus] =>  {
        // @ts-ignore
        if(response.status) {
            // @ts-ignore
            return [response.rules, RulesDataSource.RuleFetchStatus.Fetched]
        } else {
            // @ts-ignore
            switch (response.err) {
                case "User not associated":
                    return [{}, RulesDataSource.RuleFetchStatus.Unavailable]
                    
                case "Invalid DeviceId":
                    return [{}, RulesDataSource.RuleFetchStatus.Error]
                }
                    
            }
        }).catch(err => {
            console.log("Rules Fetching: complete failure",err)
            return [{}, RulesDataSource.RuleFetchStatus.Error]
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

namespace RulesDataSource {
    export interface RequestHeaders {
        sdkId: string,
        deviceId: string,
    }

    export enum RuleFetchStatus {
        Fetching,
        Fetched,
        Unavailable,
        Error,
    }
}

export default RulesDataSource;