'use strict';

const config = require('config');
const optimist = require('optimist');
const express = require('express');
const path = require('path');

const main = () => {
  let announce = false;
  let useRandomWorkerPort = false;
  let announcement = require('./announcement.json');

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

  let Server = require('core-server').Server;
  let server = new Server(announcement.name, announcement, {
    discoveryHost: config.discovery.host,
    discoveryPort: config.discovery.port,
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
      }
    });
  });

  process.on('message', function(msg, socket) {
      if (msg !== 'sticky-session:connection') return;
      // Emulate a connection event on the server by emitting the
      // event with the connection the master sent us.
      server.getHttp().emit('connection', socket);
  });
}


if(require.main === module) {
  main();
}
