(function () {
  'use strict';

  angular.module('<%= _.camelize(appname) %>App')
    .controller('<%= _.classify(name) %>Ctrl', ['$scope', function ($scope) {
      var model = {
        awesomeThings: [
          'HTML5 Boilerplate',
          'AngularJS',
          'Karma'
        ]
        // your model stuff here
      };

      angular.extend($scope, {
        model: model
      });
    }]);
}());
