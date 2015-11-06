/* jshint node:true */
'use strict';

var feeds = require('./feeds'),
  express = require('express'),
  app = express(),
  mysql = require('./mysql'),
  config = require('./config'),
  _ = require('lodash');

app.set('json spaces', 4);

app.get('/feeds', function(req, res) {
  var limit = +req.query.limit || 100;
  var offset = ~~req.query.offset;

  mysql.query(
    'SELECT body, likes FROM feeds ORDER BY likes ASC, createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset],
    function(err, rows) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      var feeds = _.map(rows, function(row) {
        var obj;
        try {
          obj = JSON.parse(row.body);
          obj.likes = row.likes;
          return obj;
        } catch(err) {
          console.error(err);
        }
      });
      feeds = _.compact(feeds);
      res.json(feeds);
    }
  );
});

app.listen(config.port, function() {
  console.log('Server started');
});

feeds.startFetch();
