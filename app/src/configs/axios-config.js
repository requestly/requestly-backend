import { PROXY_PORT, ROOT_CERT_PATH } from "../constants/index.js";
import PatchedHttpsProxyAgent from "../utils/patch-https-proxy-agent.js";
import HttpAgent  from 'https-proxy-agent';
import fs from "fs";


export const axiosDefaultConfig = {
    proxy: false,
    httpsAgent: new PatchedHttpsProxyAgent({
      host: "localhost",
      port: PROXY_PORT,
      ca: fs.readFileSync(ROOT_CERT_PATH)
    }),
    httpAgent: new HttpAgent.HttpsProxyAgent(`http://localhost:${PROXY_PORT}`)
};
  