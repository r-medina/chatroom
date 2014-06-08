'use strict';


var mainControllers = angular.module('mainControllers',[]);


mainControllers.controller('IndexCtrl', [
  '$rootScope', '$scope', '$location', 'socket', 'Rooms', 'RoomID',
  function IndexCtrl($rootScope, $scope, $location, socket, Rooms, RoomID) {
    // get list of available rooms
    var updateRooms = function() {
      $scope.rooms = Rooms.active();
    };

    updateRooms();

    // helper function for joining rooms
    var joinRoom = function(roomID) {
      $location.path('r/' + roomID);      
    };

    // request for a new room to be made
    $scope.newRoom = function() {
      var roomIDGetter = RoomID.get();
      roomIDGetter.$promise.then(function(id) {
        $scope.roomID = id.roomID;
        socket.emit('room:new', $scope.roomID);
      });
    };

    // when a room is created, make the user join if he asked to join a new room
    socket.on('room:created', function(roomID) {
      if (roomID === $scope.roomID) {
        joinRoom(roomID);
      }
    });

    socket.on('room:updated', function() {
      updateRooms();
    });

    // join button
    $scope.submit = function() {
      var roomID = $scope.roomID;
      if (roomID) {
        joinRoom(roomID);
      }
    };

  }
]);


mainControllers.controller('RoomCtrl', [
  '$rootScope', '$scope', '$routeParams', 'socket', 'Rooms',
  function RoomCtrl($rootScope, $scope, $routeParams, socket, Rooms) {
    // saving the room ID
    $scope.roomID = $routeParams.roomID;
    $scope.rooms = Rooms.all();
    $scope.rooms.$promise.then(function(rooms) {
      for (var i = 0; i < rooms.length; i++) {
        if (rooms[i].roomID == $scope.roomID) return;
      }

      socket.emit('room:new', $scope.roomID);  
    });

    $rootScope.title += ' '  + $scope.roomID;

    // the current user
    $scope.user = {nick: ''};
    socket.emit('room:join', $scope.roomID);

    // user send message
    var sendMessage = function(message) {
      socket.emit('message:send', {
        roomID: $scope.roomID,
        user: $scope.user,
        body: message,
        timestamp: Date()
      });
    };

    // load in the names of the users in the room
    var updateUsers = function() {
      $scope.users = Rooms.active({
        roomID: $scope.roomID
      });
    };

    // event listeners: all pretty self-explanatory
    socket.on('room:joined', function(data) {
      $scope.addMessage(data.message);
      $scope.user.color = data.message.color;
      updateUsers();
    });

    socket.on('user:left', function(data) {
      $scope.addMessage(data.message);
      updateUsers();
    });

    socket.on('user:new', function(data) {
      $scope.addMessage(data.message);
      updateUsers();
    });

    socket.on('user:named', function(data) {
      $scope.addMessage(data.message);
      updateUsers();
    });

    socket.on('message:new', function(message) {
      $scope.addMessage(message);
    });

    // sanitize messages -- already attacked
    var clean = function(str) {
      var symbols = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;'
      };

      str = str.replace(/<|>|&/g, function(c) {
        return symbols[c];
      });
      return str;
    };

    $scope.submitMessage = function() {
      var message = clean($scope.message);
      // if the use has added a valid nickname
      if (message && $scope.user.nick) {
        // clear's the text box
        $scope.message = '';
        // them send a message
        sendMessage(message);
      }
    };

    $scope.submitNick = function() {
      $scope.nick_form.nick.$setValidity('original', (function() {
        for (var i = 0; i < $scope.users.length; i++) {
          if ($scope.users[i].nick == $scope.nick) {
            return false;
          }
        }

        return true;
      })());

      // to avoid repeated new nicks if the user focuses on field
      if ($scope.nick_form.nick.$valid && $scope.nick != $scope.user.nick) {
        // save old nick for message
        $scope.user.oldNick = $scope.user.nick;
        $scope.user.nick = $scope.nick;
        // let the server/other clients know
        socket.emit('user:named', {user: $scope.user});
        // update the users in the dom
        updateUsers();
      }
      else {
        $scope.nick = $scope.user.nick
      }
    };

  }
]);
