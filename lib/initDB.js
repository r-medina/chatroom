'use strict';

var sys = require('sys');
var exec = require('child_process').exec;

var puts = function(err, stdout, stderr) { 
  sys.puts(stdout);
};

var initDB = function() {
  exec("sqlite3 chatroom.db < schema.sql", puts);
}

module.exports = initDB;
