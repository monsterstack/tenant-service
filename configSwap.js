'use strict'
/**
 * configSwap.js
 * Generated File as a result of Service Scaffolding.  Edit at your own risk.
 */
const http = require('http');
const BASE_PATH = './';

const fetchConfig = (configHost, configPort, serviceName, stage, cb) => {
  let path = `/v2/keys/${serviceName}-${stage}`;
  console.log(path);
  http.get({
        host: configHost,
        port: configPort,
        path: path
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {
            try {
              // Data reception is done, do whatever with it!
              let parsed = JSON.parse(body);
              cb(null, parsed);
            } catch (err) {
              cb(err, null);
            }
        });
    });
}

const main = () => {
  // Only use core node modules here..
  // Grab Service Name and Stage from cli
  let serviceName = null;
  let stage = null;
  
  let configHost = process.env.CONFIG_HOST;
  let configPort = process.env.CONFIG_PORT;
  
  let args = process.argv;

  if(configHost && configPort) {
    if(args.length >= 4) {
      serviceName = args[2];
      stage = args[3];
      fetchConfig(configHost, configPort, serviceName, stage, (err, config) => {
        // Replace ./code/config/default.json with config.
        console.log(config);
        if(err) {
          console.log(err);
        } else {
          if(config.hasOwnProperty("errorCode")) {
            console.log(config.message);
          } else if(config.hasOwnProperty("node")) {
            let fs = require('fs')
            fs.writeFile(`${BASE_PATH}/config/default.json`, config.node.value, () => {
              console.log('done');
            });
          } else {
            console.log("Something went wrong");
          }
        }
      });
    } else {
      console.log("We don't know which configuration to grab");
    }

  } else {
    console.log("Missing CONFIG_HOST and or CONFIG_PORT env var");
  }
}


if(require.main === module) {
  main();
}
