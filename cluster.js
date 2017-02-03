'use strict';
const config = require('config');
const Cluster = require('core-server').Cluster;

const optimist = require('optimist');

const main = () => {
  console.log("Starting Cluster");
  
}


if(require.main === module) {
  main();
}
