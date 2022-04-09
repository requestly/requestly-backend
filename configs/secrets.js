const ENVS = {
    PROD: "PROD",
    BETA: "BETA",
    DEV: "DEV",
}


console.log(process.env.ENV);

let RQ_FIREBASE_BASE_URL = "";
switch(process.env.ENV) {
    case ENVS.PROD:
        RQ_FIREBASE_BASE_URL = "https://us-central1-project-7820168409702389920.cloudfunctions.net";
        break;
    case ENVS.BETA:
        RQ_FIREBASE_BASE_URL = "https://us-central1-requestly-dev.cloudfunctions.net";
        break;
    case ENVS.DEV:
        RQ_FIREBASE_BASE_URL = "http://localhost:5001/requestly-dev/us-central1";
        break;
    default:
        RQ_FIREBASE_BASE_URL = "https://us-central1-requestly-dev.cloudfunctions.net";
        break;
}

let REDIS_URL = "";
switch(process.env.ENV) {
    case ENVS.PROD:
        REDIS_URL = "redis://rq-interceptor.al6lo2.ng.0001.use1.cache.amazonaws.com:6379"; // redis[s]://[[username][:password]@][host][:port][/db-number]
        break;
    case ENVS.BETA:
        REDIS_URL = "redis://localhost:6379";
        break;
    case ENVS.DEV:
        REDIS_URL = "redis://localhost:6379";
        break;
    default:
        REDIS_URL = "redis://localhost:6379";
        break;
}

export {
    RQ_FIREBASE_BASE_URL,
    REDIS_URL,
};
