export function AdjustableColorScaleDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/adjustableColorScale/adjustableColorScale.directive.html',
    scope: {
      submit: '&'
    },
    controller: AdjustableColorScaleController,
    controllerAs: 'controller',
    bindToController: true
  };

  return directive;
}

class AdjustableColorScaleController {
  constructor($scope) {
    'ngInject';
    // the default query gets populated in main's constructor
    this.defaultQuery = $scope.$parent.main.defaultQuery;

    this.cypherQuery = this.defaultQuery;
  }

}
