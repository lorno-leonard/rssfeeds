/* jshint node:true */
'use strict';

var mysql = require('mysql'),
  config = require('./config');

var connection = mysql.createConnection(config.mysql);
connection.connect();

module.exports = connection;
