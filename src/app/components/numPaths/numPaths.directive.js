export function NumPathsDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/numPaths/numPaths.directive.html',
    scope: {
      submit: '&'
    },
    controller: NumPathsController,
    controllerAs: 'controller',
    bindToController: true
  };

  return directive;
}

class NumPathsController {
  constructor($scope) {
    'ngInject';
    // the default query gets populated in main's constructor
    this.defaultQuery = $scope.$parent.main.defaultQuery;

    this.cypherQuery = this.defaultQuery;
  }

}
