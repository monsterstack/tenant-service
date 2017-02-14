'use strict';

const config = require('config');
const optimist = require('optimist');
const express = require('express');
const path = require('path');

/**
 * Start Server
 * Options:
 * --randomWorkerPort ( true or false ) Do we bind to a random port ( used for child process being managed by cluster )
 *                    or do we use the standard config.port.
 * --announce         ( true or false ) Do we announce ourselves to the Discovery Service
 * --discoveryHost ( Where do I Announce myself?  Where is my Discovery Service)
 */
const main = () => {
  let announce = false;
  let useRandomWorkerPort = false;
  let announcement = require('./announcement.json');
  let typeQuery = require('./typeQuery.json');
  let discoveryHost = config.discovery.host;

  // Handle Arguments
  if(optimist.argv.randomWorkerPort === 'true') {
    useRandomWorkerPort = true;
  }

  if(optimist.argv.announce === 'true') {
    announce = true;
  }

  if(optimist.argv.region) {
    announcement.region = optimist.argv.region;
  }

  if(optimist.argv.stage) {
    announcement.stage = optimist.argv.stage;
  }

  if(optimist.argv.discoveryHost)
    discoveryHost = optimist.argv.discoveryHost;

  let Server = require('core-server').Server;
  let server = new Server(announcement.name, announcement, typeQuery, {
    discoveryHost: discoveryHost,
    discoveryPort: config.discovery.port || 7616,
    useRandomWorkerPort: useRandomWorkerPort
  });

  /** Init and handle lifecycle **/
  server.init().then(() => {
    let app = server.getApp();
    // Set View Engine and Static Paths
    app.set('view engine', 'ejs');
    app.use('/portal', express.static(path.join(__dirname + '/portal')));
    app.use('/public', express.static(path.join(__dirname, 'public')));

    server.loadHttpRoutes();
    server.listen().then(() => {
      console.log('Up and running..');
      if(announce === true) {
        server.announce();
      } else {
        server.query();
      }
    });
  }).catch((err) => {
    console.log(err);
  });
}


if(require.main === module) {
  main();
}
