const { register } = require("esbuild-register/dist/node");
register();

const dotenv = require("dotenv");
dotenv.config();

const { default: tunnel } = require("./src/tunnel");
tunnel();
