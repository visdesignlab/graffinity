export function routerConfig($stateProvider, $urlRouterProvider) {
  'ngInject';
  $stateProvider
    .state('home', {
      url: '/flights',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main',
      resolve: {
        database: function () {
          "use strict";
          return "flights";
        }
      }
    });


  $stateProvider
    .state('marclab', {
      url: '/marclab',
      templateUrl: 'app/main/main.html',
      controller: 'MainController',
      controllerAs: 'main',
      resolve: {
        database: function () {
          "use strict";
          return "marclab";
        }
      }
    });

  $urlRouterProvider.otherwise('/marclab');
}
