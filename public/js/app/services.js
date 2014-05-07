'use strict';

var mainServices = angular.module('mainServices', []);

mainServices.factory('socket', function(socketFactory) {
  var myIoSocket = io.connect('/');

  var mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  return mySocket;
});

mainServices.factory('Rooms', ['$resource', function($resource) {
  return $resource('/:api/rooms/:roomID', {}, {
    active: {method: 'GET', isArray: true},
    all: {method: 'GET', isArray: true}
    // all: {method: 'GET', params: {api: 'api'}, isArray: true}
  });
}]);

mainServices.factory('RoomID', ['$resource', function($resource) {
  return $resource('/roomid');
}]);
