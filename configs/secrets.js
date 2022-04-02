const ENVS = {
    PROD: "PROD",
    BETA: "BETA",
    DEV: "DEV",
}


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

export {
    RQ_FIREBASE_BASE_URL
};
