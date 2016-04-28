export function QueryDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/query/query.directive.html',
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
  constructor() {
    'ngInject';
    this.defaultQuery = "MATCH p = n-[SYNAPSE*1..2]->m WHERE n.label in ['CBb4w', 'CBb3n'] and m.label in ['GC', 'GC ON'] RETURN p LIMIT 500;";
    this.cypherQuery = this.defaultQuery;
  }

}
