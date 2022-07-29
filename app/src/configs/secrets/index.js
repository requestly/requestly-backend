const ENVS = {
    PROD: "PROD",
    BETA: "BETA",
    LOCAL: "LOCAL",
}

let secrets;

// TODO: Use templating instead of separate files
switch(process.env.ENV) {
    case ENVS.PROD:
        secrets = require("./prod");
        break;
    case ENVS.BETA:
        secrets = require("./beta");
        break;
    case ENVS.LOCAL:
        secrets = require("./local");
        break;
    default:
        secrets = require("./beta");
        break;
}

// console.log(secrets);
module.exports = secrets;
