import IRulesDataSource from "rq-proxy/dist/components/interfaces/rules-data-source";
import {getFunctions, httpsCallable} from "firebase/functions";

class RulesDataSource implements IRulesDataSource {
    static getRuleRecords = async (sdkId: string, deviceId: string) : Promise<[Object, RulesDataSource.RuleFetchStatus]> => {
        // TODO: Add caching layer
        const functions = getFunctions()
        const getRulesForDevice = httpsCallable(functions, "getRulesForDevice")
        return await getRulesForDevice({
            sdkId,
            deviceId
        }).then((res) : [Object, RulesDataSource.RuleFetchStatus] =>  {
        let response = res.data
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

    // TODO: @nsr replace headers with constants after migrating thise to rq-interceptor-backend
    getRules = async (requestHeaders) => {
        // TODO: state based error handling using the returned status
        const [records, status] = await RulesDataSource.getRuleRecords(requestHeaders.sdk_id, requestHeaders.device_id)
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
        const [records, status] = await RulesDataSource.getRuleRecords(requestHeaders.sdk_id, requestHeaders.device_id)
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

    // export interface FirebaseResponse {
    //     status: boolean,
    //     err?: string,
    //     message?: string,
    //     records?: object
    // }

    export enum RuleFetchStatus {
        Fetching,
        Fetched,
        Unavailable,
        Error,
    }
}

export default RulesDataSource;