/* jshint node:true */
'use strict';

module.exports = {
  feedUrls: [
    'http://feeds.feedburner.com/TechCrunch/'
  ],
  mysql: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'rssfeeds'
  },
  fetchInterval: 30000,
  port: 80,
  cookie: 'sessId'
};
