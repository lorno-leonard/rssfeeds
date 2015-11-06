/*jshint node:true */
'use strict';

var dbm = require('db-migrate'),
	type = dbm.dataType,
	multiline = require('multiline').stripIndent;

exports.up = function(db, callback) {
	db.runSql(multiline(function(){/*
		CREATE TABLE IF NOT EXISTS `feeds` (
			`id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
      `feedId` VARCHAR(255) NOT NULL,
			`body` TEXT NOT NULL,
			`likes` INT(11) NOT NULL DEFAULT 0,
      `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (`id`),
			UNIQUE KEY `feedId` (`feedId`)
		) ENGINE=InnoDB DEFAULT CHARSET=latin1;
	*/}), callback);
};

exports.down = function(db, callback) {
	db.runSql('DROP TABLE IF EXISTS `feeds`', callback);
};
