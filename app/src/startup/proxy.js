import axios from "axios";
import  { RQProxyProvider } from "@requestly/requestly-proxy";
import { CERT_PATH, DEVICE_ID_HEADER_KEY, PROXY_PORT, ROOT_CERT_PATH, SDK_ID_HEADER_KEY } from "../constants/index.js";
import RulesDataSource from "./ruleFetcher.js";
import { RQ_FIREBASE_BASE_URL } from "../configs/secrets";


const proxyConfig = {
    port: PROXY_PORT,
    // @ts-ignore
    certPath: CERT_PATH,
    // TODO: MOVE THIS IN RQ PROXY
    rootCertPath: ROOT_CERT_PATH,
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

const initProxy = () => {
    console.log("In Proxy startup script");
    RQProxyProvider.createInstance(proxyConfig, new RulesDataSource(), new LoggerService());
    RQProxyProvider.getInstance().doSomething();
}
initProxy();

export { initProxy };