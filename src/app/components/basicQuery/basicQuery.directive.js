export function BasicQueryDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/basicQuery/basicQuery.directive.html',
    scope: {
      submit: '&'
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

    this.sets = ["Sources", "Targets"];
    this.property = "state";
    this.operator = "in";
    this.numHops = [1, 2, 3];
    this.selectedNumHops = this.numHops[1];

    this.Sources = "CA, OR, WA";
    this.Targets = "NY, MA, CT, RI, NH, ME, VT";
  }

}
