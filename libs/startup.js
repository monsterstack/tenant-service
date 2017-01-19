'use strict';

var async = require('async');
const debug = require('debug')('tenant-startup');
const glob = require('glob');
const appRoot = require('app-root-path');

 /**
  * Load Http Routes
  */
 const loadHttpRoutes = (app) => {
   glob(appRoot.path + "/api/v1/routes/*.routes.js", {}, (err, files) => {
     async.each(files, function(file, iter) {
         console.log(">>> Loading Route %s", file);
         try {
             require(file)(app);
         } catch (err) {
             console.log(err);
         }
         iter();
     }, function(err) {
         if (err)
             console.log(err);
     });
   });
 }

// Public
exports.loadHttpRoutes = loadHttpRoutes;
