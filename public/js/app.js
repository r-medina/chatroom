'use strict';

require.config({
    paths: {
      app: './app',
      components: '../components'
    }
});

require([
  'app/app'
], function() {
  // bootstrap angular
  angular.element(document).ready(function() {
    angular.bootstrap(document, ['mainApp']);
  });

});
