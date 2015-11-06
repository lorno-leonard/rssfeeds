/* jshint node:true */
'use strict';

var FeedParser = require('feedparser'),
  request = require('request'),
  _ = require('lodash');

module.exports = {
  fetch: function(url, callback) {
    callback = _.once(callback);

    var req = request(url);
    var feedparser = new FeedParser();

    req.on('error', callback);

    req.on('response', function (res) {
      var stream = this;
      if (res.statusCode != 200)
        return this.emit('error', new Error('Bad status code'));
      stream.pipe(feedparser);
    });

    feedparser.on('error', callback);
    feedparser.on('readable', function() {
      var stream = this,
        meta = this.meta,
        item;

      item = stream.read();
      while (item) {
        item = stream.read();
      }

    });
  }
};
