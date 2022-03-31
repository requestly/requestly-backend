import  { RQProxyProvider } from "rq-proxy";
// import  { ProxyConfig, } from "rq-proxy/dist/types";
// import ILoggerService from "rq-proxy/dist/components/interfaces/logger-service";
import { CERT_PATH, PROXY_PORT, ROOT_CERT_PATH } from "../constants/index.js";
import RulesDataSource from "./ruleFetcher.js";

const proxyConfig = {
    port: PROXY_PORT,
    // @ts-ignore
    certPath: CERT_PATH,
    // TODO: MOVE THIS IN RQ PROXY
    rootCertPath: ROOT_CERT_PATH,
}

class LoggerService{
    addLog = (log, requestHeaders) => {
        console.log(log.url);
    };
}

RQProxyProvider.createInstance(proxyConfig, new RulesDataSource(), new LoggerService());
RQProxyProvider.getInstance().doSomething();