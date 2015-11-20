/* jshint node:true */
'use strict';

var FeedParser = require('feedparser'),
  request = require('request'),
  _ = require('lodash'),
  config = require('./config'),
  async = require('async'),
  mysql = require('./mysql'),
  util = require('util'),
  EventEmitter = require('events').EventEmitter;

var feeds = new EventEmitter();

feeds.fetch = function(url, callback) {
  callback = _.once(callback);

  var feeds = [];
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

    do {
      item = stream.read();
      if(!_.isEmpty(item)) {
        feeds.push(_.pick(item, [
          'title',
          'description',
          'summary',
          'pubdate',
          'author',
          'permalink',
          'guid',
          'image',
          'link'
        ]));
      }
    } while (item);

  });

  feedparser.on('end', function() {
    callback(null, feeds);
  });
};

feeds.startFetch = _.once(function() {
  var fetch = function() {
    var newFeeds = [];
    async.each(config.feedUrls, function(url, callback) {
      console.log('Fetching from ' + url);
      feeds.fetch(url, function(err, articles) {
        if(err) {
          console.error(err);
          return callback();
        }
        async.each(articles, function(article, callback) {
          var feedId = new Buffer(article.permalink || article.guid).toString('base64');
          mysql.query('INSERT INTO feeds (feedId, body) VALUES (?, ?)', [
            feedId,
            JSON.stringify(article)
          ], function(err) {
            if(err)  {
              if(err.code !== 'ER_DUP_ENTRY') console.error(err);
            }
            else {
              console.log('Added ' + feedId);
              console.log(util.inspect(article));
              newFeeds.push(_.merge({}, article, {
                feedId: feedId,
                likes: 0,
                liked: false
              }));
            }
            callback();
          });
        }, callback);
      });
    }, function(err) {
      if(err) return console.error(err);
      if(newFeeds.length >= 0) {
        feeds.emit('newFeeds', newFeeds);
      }
    });
  };

  fetch();

  setInterval(fetch, config.fetchInterval);
});

module.exports = feeds;
