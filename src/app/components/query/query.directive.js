export function QueryDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/query/query.directive.html',
    scope: {
      submit: '&',
      submitDisabled: '='
    },
    controller: QueryController,
    controllerAs: 'queryController',
    bindToController: true
  };

  return directive;
}

class QueryController {
  constructor($scope) {
    'ngInject';
    // the default query gets populated in main's constructor
    this.defaultQuery = $scope.$parent.main.defaultQuery;

    this.cypherQuery = this.defaultQuery;
  }

}
