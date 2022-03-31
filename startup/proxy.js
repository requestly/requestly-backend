import  { RQProxyProvider } from "rq-proxy";
// import  { ProxyConfig, } from "rq-proxy/dist/types";
// import IRulesDataSource from "rq-proxy/dist/components/interfaces/rules-data-source";
// import ILoggerService from "rq-proxy/dist/components/interfaces/logger-service";
import { CERT_PATH, PROXY_PORT, ROOT_CERT_PATH } from "../constants/index.js";


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
                "creationDate": 1648450754463,
                "description": "",
                "groupId": "",
                "id": "Redirect_nkpon",
                "isSample": false,
                "name": "google to example.com",
                "objectType": "rule",
                "pairs": [
                    {
                        "destination": "http://example.com",
                        "source": {
                            "filters": {},
                            "key": "Url",
                            "operator": "Contains",
                            "value": "google"
                        },
                        "id": "88sua"
                    }
                ],
                "ruleType": "Redirect",
                "status": "Active",
                "createdBy": "9cxfwgyBXKQxj9lU14GiTO5KTNY2",
                "currentOwner": "9cxfwgyBXKQxj9lU14GiTO5KTNY2",
                "lastModifiedBy": "9cxfwgyBXKQxj9lU14GiTO5KTNY2",
                "modificationDate": 1648450784194,
                "lastModified": 1648450784194
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
        console.log(log.url);
    };
}

// RQProxyProvider.getInstance().doSomething();
RQProxyProvider.createInstance(proxyConfig, new RulesDataSource(), new LoggerService());
RQProxyProvider.getInstance().doSomething();