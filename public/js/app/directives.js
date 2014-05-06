'use strict';


var mainDirectives = angular.module('mainDirectives', []);

mainDirectives.directive('newRoom', function() {

  function link($scope, $element) {
    // prevents default submit...
    $element.on('click', function(e) {
      e.preventDefault();
    });
  }

  return {
    link: link
  };
});


mainDirectives.directive('userInput', function() {

  function link($scope, $element) {
    // when the nickname is submitted
    $element.find('form[name="nick_form"]').on('submit', function(e) {
      // focus on the message
      $element.find('input[placeholder="message"]').focus();
    });
  }

  return {
    link: link
  };
});


mainDirectives.directive('chat', ['$compile', function($compile) {
  function link($scope, $element) {
    // adds a new message (messages aren't really saved.. no need to store them in
    // two-way data-bound way)
    $scope.addMessage = function(message) {
      console.log(message);
      var content = angular.element(
        '<p><b>' + message.user.nick + '</b>: ' + message.body + '</p>'
      );
      $element.append(content);
      $compile(content)($scope);
      // scrolls to the bottom when a new message is posted 
      $element.scrollTop($element.prop('scrollHeight'));
    };
  };

  return {
    link: link
  };
}]);
