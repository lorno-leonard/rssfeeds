/*jshint node:true */
'use strict';

var dbm = require('db-migrate'),
	type = dbm.dataType,
	multiline = require('multiline').stripIndent;

exports.up = function(db, callback) {
	db.runSql(multiline(function(){/*
		CREATE TABLE IF NOT EXISTS `likes` (
      `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
      `userId` VARCHAR(255) NOT NULL,
      `feedId` VARCHAR(255) NOT NULL,
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (`id`),
      UNIQUE KEY `like` (`userId`, `feedId`)
		) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	*/}), callback);
};

exports.down = function(db, callback) {
	db.runSql('DROP TABLE IF EXISTS `likes`', callback);
};
