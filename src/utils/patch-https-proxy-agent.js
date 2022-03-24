import HttpAgent  from 'https-proxy-agent';

class PatchedHttpsProxyAgent extends HttpAgent.HttpsProxyAgent {
    constructor(opts) {
        super(opts);
        this.ca = opts.ca;
    }

    async callback(req, opts) {
        return super.callback(req, Object.assign(opts, { ca: this.ca }));
    }
}


export default PatchedHttpsProxyAgent;