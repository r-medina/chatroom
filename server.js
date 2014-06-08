var express = require('express'),
    app     = express(),
    server  = require('http').createServer(app),
    path    = require('path'),
    io      = require('socket.io').listen(server),
    color   = require('./public/components/randomColor/randomColor'),
    db      = require('./lib/database'),
    genID   = require('./lib/genID');


app.set('port', process.env.PORT || 8080);


app.configure('development', function() {
    var liveReloadPort = 35729;
    app.use(require('connect-livereload')({
        port: liveReloadPort
    }));
    app.use(express.errorHandler());
});


app.configure(function() {
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'views')));
    app.use(express.static(path.join(__dirname, 'public')));
});

// for checking if a strign contains something
String.prototype.contains = function(it) { return this.indexOf(it) != -1; };

// user object for sending system messages
var user = {nick: '*chatroom*', color: color.randomColor({luminosity: 'light'})};

// when client is opened
io.sockets.on('connection', function(socket) {
  socket.on('room:new', function(roomID) {
    // i want the web app to work completely independantly of whether the db calls
    // are/aren't, so i'm not putting this in a callback
    socket.emit('room:created', roomID);
  });

  // when a user tries to join a room
  socket.on('room:join', function(roomID) {
    // set their socket connection's roomID property to the room ID
    socket.set('roomID', roomID, function() {
      // if they join
      if (socket.join(roomID)) {
        var message = {
          roomID: roomID,
          user: user,
          body: 'new user joined the room',
          timestamp: Date()
        };

        // this is kind of ghetto, but it will show a user all the previous messages
        // when they join a new room
        db.getMessages(roomID, function(messages) {
          messages.messages.map(function(message) {
            if (!message.body.contains('left') && !message.body.contains('joined')) {
              socket.emit('message:new', {
                user: {nick: message.nick, color: message.color},
                body: message.body,
                timestamp: message.timestamp
              });
            }
          });
                               
          // let everyone in the room know there's a new user
          socket.broadcast.to(roomID).emit('user:new', {
            message: message
          });

          // welcome the user to the room
          socket.emit('room:joined', {
            message: {
              user: user,
              body: 'welcome to room ' + roomID,
              timestamp: Date(),
              color: color.randomColor({luminosity: 'light'})
            }
          });
          // makes clients at the home page update
          io.sockets.emit('room:updated');

          // add messge to db
          db.addMessage(message);
        });
      }
    });
  });


  // when someone disconnects
  socket.on('disconnect', function() {
    // get their roomID
    socket.get('roomID', function(err, roomID) {
      // if they were connected 
      if (roomID) {
        // get their nicknae
        socket.get('nick', function(err, nick) {
          var body = nick ? nick : 'someone';
          body += ' left the room';

          var message = {
            roomID: roomID,
            user: user,
            body: body,
            timestamp: Date()
          };

          // and let everyone know they left
          socket.broadcast.to(roomID).emit('user:left', {
            message: message
          });

          // add it to db
          db.addMessage(message);
        });
      }
      else {
        console.log(err);
      }
      io.sockets.emit('room:updated');
    });
  });

  // when someone updates their nickname
  socket.on('user:named', function(data) {
    socket.get('roomID', function(err, roomID) {
      if (roomID) {
        // set their socket's nick property
        socket.set('nick', data.user.nick, function() {
          var message = {
            roomID: roomID,
            user: user,
            body: data.user.oldNick
              ? 'user ' + data.user.oldNick + ' is now ' + data.user.nick
              : 'new user is ' + data.user.nick,
            timestamp: Date()
          };

          // tell everyone else they changed
          socket.broadcast.to(roomID).emit('user:named', {
            message: message
          });

          // add it to db
          db.addMessage(message);
        });
      }
      else {
        console.log(err);
      }
    });
  });

  // when someone sends a message
  socket.on('message:send', function(message) {
    socket.get('roomID', function(err, roomID) {
      if (roomID) {
        // send it to everyone in the room (including them)
        io.sockets.in(message.roomID).emit('message:new', message);
        console.log(message)
        db.addMessage(message);
      }
      else {
        console.log(err);
      }
    });
  });

});

// restful endpoint for getting the names of the people in an active room
app.get('/rooms/:roomID', function(req, res) {
  var roomID = req.params.roomID;
  // the array that will be returned
  var usersRes = [];
  // a list of all the clients in roomID
  var users = io.sockets.clients(roomID);

  // sockets asynchronously grab their attributes,
  // so as i get the nocks, i', pushing them as objects to the response array
  users.map(function(user) {
    user.get('nick', function(err, nick) {
      if (nick) {
        usersRes.push({nick: nick});
      }
      else {
        usersRes.push({nick: 'user'});
      }

      // callback when the response list is the same length as the all the users in the room
      if (usersRes.length === users.length) {
        res.send(usersRes);
      }

    });
  });

});


// endpoint for the names of the currently active rooms + how many people are in them
app.get('/rooms', function(req, res) {
  var roomsRes = [];
  var rooms = io.sockets.manager.rooms;

  // list of rooms, get rid of first element because is empty
  Object.keys(rooms).slice(1,rooms.length).map(function(roomID) {
    // the names have an annoying slash in front
    roomID = roomID.replace('/', '');

    // makes an object, adds it to the response array
    roomsRes.push({
      roomID: roomID,
      users: io.sockets.clients(roomID).length
    });
  });

  res.send(roomsRes);
});


// for getting a valid room id
app.get('/roomid', function(req, res) {
  db.getRooms(function(rooms) {
    res.send({
      roomID: genID(rooms)
    });
  });
});


/* RESTful API */


// for restful-y getting a list of all the rooms ever + how many messages they have
app.get('/api/rooms', function(req, res) {
  var roomsRes = [];

  // gets a list of room objects which only have an id property
  db.getRooms(function(rooms) {
    // i'll just be mapping an async function across all the elements on an array nbd
    rooms.map(function(room) {
      // for each room, call getMessageCount on its id
      db.getMessageCount(room.roomID, function(count) {
        room.messageCount = count;
        // when you have the count, push it to the response array
        roomsRes.push(room);

        // send a response when the mapping is done
        if (roomsRes.length === rooms.length) {
          res.send(roomsRes);
        }
      });
    });
  });  
});

// gets all the messages in a room
app.get('/api/rooms/:roomID', function(req, res) {
    var roomID = req.params.roomID;

    db.getMessages(roomID, function(messages) {
      res.send(messages);
    });
});

server.listen(app.get('port'));
console.log('Express server listening on port ' + app.get('port'));
