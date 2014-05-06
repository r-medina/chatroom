'use strict';


define('app/app', [
  'app/controllers',
  'app/directives',
  'app/services'
], function() {

  var mainApp = angular.module('mainApp', [
    'ngRoute',
    'ngResource',
    'btford.socket-io',
    'mainControllers',
    'mainDirectives',
    'mainServices'
  ]);

  mainApp.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'include/index.html',
        controller: 'IndexCtrl',
        title: 'home'
      }).
      when('/r/:roomID', {
        templateUrl: 'include/room.html',
        controller: 'RoomCtrl',
        title: 'room'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);


  mainApp.run(['$rootScope', function($rootScope) {
    $rootScope.$on("$routeChangeSuccess", function(e, currentRoute, previousRoute) {
      $rootScope.title = currentRoute.title;
    });
  }]);


  return mainApp;

});
