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
  return $resource('/rooms/:roomID', {}, {
    query: {method: 'GET', isArray: true},
    get: {method: 'GET', isArray: true}
  });
}]);

mainServices.factory('RoomID', ['$resource', function($resource) {
  return $resource('/roomid/');
}]);
