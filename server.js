'use strict';

var async = require('async');
var glob = require('glob');
var fs = require('fs');
var optimist = require('optimist');
var app = require('express')();
const Promise = require('promise');

function main(){

  app.listen(3000, function () {
    console.log('Tenant Service listening on port 3000!')
  })

     var startup = require('./libs/startup.js');


     /* Http Routes */
     startup.loadHttpRoutes(app);
}

/**
 * Kick off main if not included as import via require
 */
if (require.main === module) {
    var d = require('domain').create();
    d.on('error', function(er) {
        // The error won't crash the process, but what it does is worse!
        // Though we've prevented abrupt process restarting, we are leaking
        // resources like crazy if this ever happens.
        // This is no better than process.on('uncaughtException')!
        setTimeout(function() {
            logger.error(er);
            logger.error('Shutting Down Gracefully');
            process.exit();
        }, 2000);
    });
    d.run(main);
};
