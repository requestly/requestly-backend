import axios from "axios";
import  { RQProxyProvider } from "rq-proxy";
// import  { ProxyConfig, } from "rq-proxy/dist/types";
// import ILoggerService from "rq-proxy/dist/components/interfaces/logger-service";
import { CERT_PATH, DEVICE_ID_HEADER_KEY, PROXY_PORT, ROOT_CERT_PATH, SDK_ID_HEADER_KEY } from "../constants/index.js";
// import RulesDataSource from "./ruleFetcher.js";
import { RQ_FIREBASE_BASE_URL } from "../configs/secrets.js";


const proxyConfig = {
    port: PROXY_PORT,
    // @ts-ignore
    certPath: CERT_PATH,
    // TODO: MOVE THIS IN RQ PROXY
    rootCertPath: ROOT_CERT_PATH,
}


class RulesDataSource{
    getRules = (requestHeaders) => {
        return [
            {
                "creationDate": 1648800254537,
                "description": "",
                "groupId": "",
                "id": "Headers_br050",
                "isSample": false,
                "name": "Test Header Rule",
                "objectType": "rule",
                "pairs": [
                    {
                        "header": "abc",
                        "value": "abc value",
                        "type": "Add",
                        "target": "Request",
                        "source": {
                            "filters": {},
                            "key": "Url",
                            "operator": "Contains",
                            "value": "example"
                        },
                        "id": "lussg"
                    },
                    {
                        "header": "abc",
                        "value": "bac value",
                        "type": "Add",
                        "target": "Response",
                        "source": {
                            "filters": {},
                            "key": "Url",
                            "operator": "Contains",
                            "value": "example"
                        },
                        "id": "be1k6"
                    }
                ],
                "ruleType": "Headers",
                "status": "Active",
                "createdBy": "9cxfwgyBXKQxj9lU14GiTO5KTNY2",
                "currentOwner": "9cxfwgyBXKQxj9lU14GiTO5KTNY2",
                "lastModifiedBy": "9cxfwgyBXKQxj9lU14GiTO5KTNY2",
                "modificationDate": 1648800283699,
                "lastModified": 1648800283699
            }
        ];
    }
    
    getGroups = (requestHeaders) => {
        return [
            {
                id: "1",
                status: "Inactive"
            }
        ];
    }
}

class LoggerService{
    addLog = (log, requestHeaders) => {
        // console.log(JSON.stringify(log, null, 4));
        // const headers = {
        //     "device_id": "test_device",
        //     "sdk_id": "7jcFc1g5j7ozfSXe7lc6",
        // };
        const headers = {
            "device_id": requestHeaders[DEVICE_ID_HEADER_KEY],
            "sdk_id": requestHeaders[SDK_ID_HEADER_KEY],
        };

        // TODO: Keeping this as Strong for now to avoid changes in UI
        log.finalHar = JSON.stringify(log.finalHar);

        axios({
                method: "post",
                url : `${RQ_FIREBASE_BASE_URL}/addSdkLog`,
                headers,
                data: log
            }).then(() => {
                console.log("Successfully added log");
              }).catch(error => {
                console.log(`Could not add Log`);
              })
    };
}

RQProxyProvider.createInstance(proxyConfig, new RulesDataSource(), new LoggerService());
RQProxyProvider.getInstance().doSomething();