export function FlightQueryDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/flightQuery/flightQuery.directive.html',
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
    this.sets = ["Sources", "Targets"];
    this.property = "state";
    this.operator = "in";

    this.Sources = "CA, OR, WA";
    this.Targets = "NY, MA, CT, RI, NH, ME, VT";

    this.numHops = [1, 2, 3];
    this.selectedNumHops = 2;
  }

  prepareQuery() {
    // queryController.prepareQuery({query:queryController.cypherQuery})
    this.$log.debug(this.Sources, this.Targets, this.selectedNumHops);
    // MATCH p = (s)-[x:FLIGHT]->(i)-[y:FLIGHT]->(t)  WHERE s.state in ['CA', 'OR', 'WA']  AND t.state in ['CT', 'ME', 'MA', 'RI', 'NH', 'VT'] AND x.carrier = y.carrier AND x.arr_time < y.dep_time RETURN p
    let query = "MATCH p = ";
    let postfix = "";
    if (this.selectedNumHops == 1) {
      query += "(s)-[x:FLIGHT]->(t) ";
    } else if (this.selectedNumHops == 2) {
      query += "(s)-[x:FLIGHT]->(i)-[y:FLIGHT]->(t) ";
      postfix = "AND x.arr_time < y.arr_time AND x.carrier = y.carrier ";
    } else if (this.selectedNumHops == 3) {
      query += "(s)-[x:FLIGHT]->(i0)-[y:FLIGHT]->(i1)-[z:FLIGHT]->(t) ";
      postfix = "AND x.arr_time < y.dep_time AND y.arr_time < z.dep_time AND x.carrier = y.carrier AND y.carrier = z.carrier ";
    }
    let stringToList = function (string) {
      let list = string.split(", ");
      let result = "";
      for (let i = 0; i < list.length; ++i) {
        if (i > 0) {
          result += ",";
        }
        result += "\"" + list[i] + "\"";
      }
      result += "";
      return result;
    };
    this.$log.debug(stringToList(this.Sources));
    query += " WHERE s.state in [" + stringToList(this.Sources) + "] AND t.state in [" + stringToList(this.Targets) + "] " + postfix;
    query += " AND ALL(n in nodes(p) where 1=length(filter(m in nodes(p) where m=n))) return p";

    this.submit({query: query});
  }

}
