/* jshint node:true */
'use strict';

var feeds = require('./feeds'),
  express = require('express'),
  app = express(),
  server = require('http').Server(app),
  mysql = require('./mysql'),
  config = require('./config'),
  async = require('async'),
  _ = require('lodash'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  cookieParser = require('cookie-parser'),
  multiline = require('multiline').stripIndent,
  io = require('socket.io')(server);

app.use(bodyParser.json());
app.use(cookieParser());
app.set('json spaces', 4);

app.use(express.static('public'));

app.use(function(req, res, next) {
  if(!req.cookies[config.cookie]) {
    res.cookie(config.cookie, uuid.v1(), {
      httpOnly:true
    });
  }
  next();
});

app.get('/feeds', function(req, res) {
  var limit = +req.query.limit || 100;
  var offset = ~~req.query.offset;

  mysql.query(
    multiline(function() {/*
      SELECT feeds.feedId, body, createdAt,
      (SELECT COUNT(*) FROM likes WHERE feeds.feedId = likes.feedId) AS likes,
      (SELECT COUNT(*) FROM likes WHERE feeds.feedId = likes.feedId AND userId = ?) AS liked
      FROM feeds
      ORDER BY likes DESC, createdAt DESC
      LIMIT ? OFFSET ?
    */}),
    [req.cookies[config.cookie], limit, offset],
    function(err, rows) {
      console.log(rows);
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      var feeds = _.map(rows, function(row) {
        var obj;
        try {
          obj = JSON.parse(row.body);
          _.assign(obj, _.pick(row, ['likes', 'liked', 'feedId', 'createdAt']));
          obj.createdAt = new Date(obj.createdAt).getTime();
          obj.liked = !!obj.liked;
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

app.post('/feeds/:id/like', function(req, res) {
  mysql.query('SELECT * FROM feeds WHERE feedId = ?',
    [req.params.id],
    function(err, rows) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      if(rows.length === 0) {
        return res.sendStatus(404);
      }
      mysql.query('INSERT INTO likes (userId, feedId) VALUES (?, ?)', [
        req.cookies[config.cookie],
        req.params.id
      ], function(err) {
        if(err) {
          if(err.code !== 'ER_DUP_ENTRY') {
            console.error(err);
            return res.sendStatus(500);
          }
        }
        res.end();
        mysql.query('SELECT COUNT(*) AS likes FROM likes WHERE feedId = ?', [
          req.params.id
        ], function(err, rows) {
          if(err) return console.error(err);
          io.emit('likes', {
            likes: _.first(rows).likes,
            feedId: req.params.id
          });
        });
      });
    }
  );
});

app.post('/feeds/:id/unlike', function(req, res) {
  mysql.query('SELECT * FROM feeds WHERE feedId = ?',
    [req.params.id],
    function(err, rows) {
      if(err) {
        console.error(err);
        return res.sendStatus(500);
      }
      if(rows.length === 0) {
        return res.sendStatus(404);
      }
      mysql.query('DELETE FROM likes WHERE userId = ?, feedId = ?', [
        req.cookies[config.cookie],
        req.params.id
      ], function(err) {
        if(err) {
          console.error(err);
          return res.sendStatus(500);
        }
        res.end();
        mysql.query('SELECT COUNT(*) AS likes FROM likes WHERE feedId = ?', [
          req.params.id
        ], function(err, rows) {
          if(err) return console.error(err);
          io.emit('likes', {
            likes: _.first(rows).likes,
            feedId: req.params.id
          });
        });
      });
    }
  );
});

server.listen(config.port, function() {
  console.log('Server started');
});

feeds.startFetch();

feeds.on('newFeeds', function(newFeeds) {
  io.emit('newFeeds', newFeeds);
});
