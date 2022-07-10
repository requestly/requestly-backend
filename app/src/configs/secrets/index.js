const ENVS = {
    PROD: "PROD",
    BETA: "BETA",
    LOCAL: "LOCAL",
}

console.log(process.env.ENV);

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
        // console.log(secrets);
        break;
    default:
        secrets = require("./local");
        break;
}

// console.log(secrets);
module.exports = secrets;
