/* custom library for connecting to the database which exposes methods for adding
 * messages and roms */
'use strict';

var anyDB = require('any-db');

var db = function() {

  var conn = anyDB.createConnection('sqlite3://chatroom.db')
    .on('error', console.error)
    .on('open', function() {
      console.log('db connection open');
    });

  return {
    addMessage: function(message, callback) {
      var sql = 'INSERT INTO `messages` (`roomID`, `nick`, `body`, `timestamp`) VALUES ($1, $2, $3, $4)';

      conn
        .query(sql, [message.roomID, message.user.nick, message.body, message.timestamp])
        .on('close', function () {
          if (callback) {
            callback();
          }
        });
    },

    addRoom: function(roomID, callback) {
      var sql = 'INSERT INTO `rooms` (`id`) VALUES ($1)';   

      conn
      .query(sql, [roomID])
        .on('error', function(err) {
          console.log(err);
        })
        .on('close', function() {
          if (callback) {
            callback();
          }
        });
    },

    getRooms: function(callback) {
      var rows = [],
          sql  = 'SELECT DISTINCT roomID FROM messages';

      conn
        .query(sql, [])
        .on('error', function(err) {
          console.log(err);
        })
        .on('data', function(row) {
          rows.push(row);
        })
        .on('close', function() {
          callback(rows);
        });
    },

    getMessageCount: function(roomID, callback) {
      var sql = 'SELECT COUNT(*) FROM messages where roomID = $1',
          count;

      conn
        .query(sql, [roomID])
        .on('error', function(err) {
          console.log(err);
        })
        .on('data', function(row) {
          count = row['COUNT(*)'];
        })
        .on('close', function() {
          callback(count);
        });
    },


    getMessages: function(roomID, callback) {
      var rows = [],
          sql  = 'SELECT * from messages where roomID = $1';

      conn
        .query(sql, [roomID])
        .on('error', function(err) {
          console.log(err);
        })
        .on('data', function(row) {
          rows.push(row);
        })
        .on('close', function() {
          callback({
            roomID: roomID,
            messages: rows
          });
        });
    }

  };
};

module.exports = db();
