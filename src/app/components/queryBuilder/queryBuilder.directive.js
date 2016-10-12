export class QueryBuilderDirective {
  constructor($log) {
    'ngInject';
    this.$log = $log;

    this.restrict = 'E';
    this.templateUrl = 'app/components/queryBuilder/queryBuilder.directive.html';
    this.scope = {
      onSubmit: '&', /* callback after query is generated */
      allowAdvancedQuery: '=',
      dataset: '=', /* either 'marclab' or 'flights' */
      resource: '=' /* url for sending type-ahead requests */
    };

    this.controller = QueryController;
    this.controllerAs = 'queryController';
    this.bindToController = true;
    this.link = this.linkFn.bind(this);
  }

  linkFn(scope, element) {
    scope.queryController.element = element;
  }
}

class QueryController {
  constructor($http, $q, $log, $timeout, $scope, cypherGeneratorService) {
    'ngInject';
    this.$http = $http;
    this.$q = $q;
    this.$log = $log;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.cypherGenerator = cypherGeneratorService;

    this.reset();

    this.$scope.$watch(function (scope) {
      return scope.queryController.dataset;
    }, this.reset.bind(this));
  }

  generateCypher(selectedInterface) {
    let result = "";
    if (selectedInterface == "basic") {
      result = this.cypherGenerator.generateBasicQuery(this.ui.basic, this.ui.selectedNumHops, this.dataset == "flights");
    } else if (selectedInterface == "advanced") {
      result = this.cypherGenerator.generateAdvancedQuery(this.ui.advanced);
    } else if (selectedInterface == "cypher") {
      result = this.cypher;
    }
    return result;
  }

  loadEdgeSuggestions(query) {
    return this.loadSuggestions(query, "match_edge")
  }

  loadNodeSuggestions(query) {
    return this.loadSuggestions(query, "match")
  }

  /**
   * If user is not typing wildcard then ask server for type-ahead suggestions.
   */
  loadSuggestions(query, endpoint) {

    let deferred = this.$q.defer();

    if (query != "*" && query.length > 1) {

      let config = {
        key: query,
        graph_name: this.dataset
      };

      let parseResults = function (results) {
        let suggestions = [];
        for (let i = 0; i < results.data.length; ++i) {
          let result = results.data[i];
          result.text = String(result.value) + " (" + result.attribute + ")";
          suggestions[i] = result;
        }
        deferred.resolve(suggestions);
      };

      this.$http.post(this.resource + endpoint, config).then(parseResults);

    } else if (query == "*") {

      this.$timeout(function () {
        deferred.resolve([{
          text: "* (wildcard)",
          attribute: "*",
          name: "*"
        }])
      })

    }


    return deferred.promise;
  }

  /**
   * Called when user clicks 'ok' on the state-change warning
   */
  onDismissWarning() {
    this.showWarning = false;
    if (this.ui.previousInterface == 'cypher') {
      this.cypher = ' ';
    } else {
      this.ui[this.ui.previousInterface] = {
        nodes: [],
        edges: []
      };
    }
    this.setNumHops(this.ui.selectedNumHops);
  }

  /**
   * Called when user clicks 'go back' on the state-change warning.
   */
  onGoBackClicked() {
    this.ui.selectedInterface = this.ui.previousInterface;
    this.showWarning = false;
  }

  /**
   * Called when a query gets modified. Used to remember when the user has changed the current query.
   */
  onQueryModified() {
    this.previousInterface = this.selectedInterface;
    this.hasActiveQuery = true;
  }

  /**
   * Called when user changes view state -- e.g., from 'basic' to 'cypher'
   */
  onStateChanged() {
    if (this.hasActiveQuery) {
      this.showWarning = true;
      if (this.ui.selectedInterface == 'cypher') {
        this.cypher = this.generateCypher(this.ui.previousInterface);
      }
    }
    this.setNumHops(this.ui.selectedNumHops)
  }

  /**
   * Give the query to whatever owns this component.
   */
  onSubmitClicked() {
    this.onSubmit(
      {
        query: this.generateCypher(this.ui.selectedInterface)
      }
    );
  }

  reset() {
    let self = this;

    if (this.dataset == 'marclab') {
      this.ui = {};
      this.ui.selectedInterface = "advanced";

      this.$timeout(function () {
        self.ui = angular.fromJson('{ "basic": { "nodes": [] }, "availableNumHops": [ 1, 2, 3 ], "selectedNumHops": 2, "advanced": { "nodes": [ [ { "attribute": "label", "value": "CBb4w", "text": "CBb4w (label)" } ], [ { "attribute": "label", "value": "GC diving", "text": "GC diving (label)" } ], [ { "attribute": "label", "value": "Rod BC", "text": "Rod BC (label)" } ] ], "edges": [ [ { "text": "* (wildcard)", "attribute": "*", "name": "*" } ], [ { "text": "* (wildcard)", "attribute": "*", "name": "*" } ] ], "keys": [ "Start", "Node", "End" ] }, "selectedInterface": "advanced", "previousInterface": "advanced"}');
        self.hasActiveQuery = true;
      });
    } else {
      this.ui = {};
      this.ui.selectedInterface = "basic";

      this.$timeout(function () {
        self.ui = angular.fromJson('{ "basic": { "nodes": [ [ { "attribute": "airport", "value": "LAX", "text": "LAX (airport)" }, { "attribute": "airport", "value": "SFO", "text": "SFO (airport)" } ], [ { "attribute": "airport", "value": "BOS", "text": "BOS (airport)" } ] ] }, "availableNumHops": [ 1, 2, 3 ], "selectedNumHops": 2, "advanced": { "nodes": [], "edges": [], "keys": [ "Start", "Node", "End" ] }, "selectedInterface": "basic", "previousInterface": "basic" }');
        self.hasActiveQuery = true;
      });
    }

    this.cypher = "";
    this.placeholder = " ";
  }

  /**
   * Path length changed
   */
  setNumHops(numHops) {
    let keys = ["Start"];
    this.ui.advanced.edges.push([]);

    for (let i = 1; i < numHops; ++i) {
      keys.push("Node");
      this.ui.advanced.edges.push([]);
    }
    keys.push("End");
    this.ui.advanced.keys = keys;
  }

}
