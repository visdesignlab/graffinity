export function FlightQueryDirective() {
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
  constructor($log) {
    'ngInject';
    this.$log = $log;
    this.sets = ["Sources"];
    this.property = "label";
    this.operator = "matches";
    this.numHops = [1, 2, 3, 4];
    this.selectedNumHops = this.numHops[1];

    this.Sources = "CA, OR, WA";
    this.Targets = "NY, MA, CT, RI, NH, ME, VT";
  }

  setSelectedNumHops(numHops) {
    let sets = [];
    sets.push("Sources");
    for (let i = 1; i < numHops; ++i) {
      sets.push("Node #" + i);
    }
    this.sets = sets;
  }


}
