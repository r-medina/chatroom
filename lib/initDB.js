'use strict';

var sys = require('sys');
var exec = require('child_process').exec;

var puts = function(err, stdout, stderr) { 
  sys.puts(stdout);
};

exec("cat schema.sql | sqlite3 chatroom.db", puts);
