/* jshint node:true */
'use strict';

var parse = require('./parse'),
  _ = require('lodash'),
  config = require('./config');

parse.fetch(_.first(config.feedUrls), function(err, feeds) {
  if(err) console.error(err);
});
