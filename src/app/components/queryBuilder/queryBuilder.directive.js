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
      resource: '=', /* url for sending type-ahead requests */
      main: '=',
      defaultQuery: '='
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
    this.isMarclabData = this.allowAdvancedQuery;

    this.reset();

    this.$scope.$watch(function (scope) {
      return scope.queryController.dataset;
    }, this.reset.bind(this));

    this.$scope.$on("filterChanged", this.onFilterChanged.bind(this));
    this.$scope.$on("setQuery", this.onSetQuery.bind(this));

  }

  generateCypher(selectedInterface) {
    let result = "";
    if (!this.isCypherWritable) {
      if (!this.isMarclabData) {
        let input = {};
        input.nodes = [this.ui.nodes[0], this.ui.nodes[this.ui.nodes.length - 1]];
        result = this.cypherGenerator.generateBasicQuery(input, this.ui.selectedNumHops, this.dataset == "flights");
      } else {
        result = this.cypherGenerator.generateAdvancedQuery(this.ui);
      }
    } else {
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

  onFilterChanged(signal, attribute, attributeNodeGroup, filter, isQuantitative, isEmptyFilter) {
    let key = "";
    if (attributeNodeGroup == 0) {
      key = "Start";
    } else if (attributeNodeGroup == 2) {
      key = "Node";
    } else if (attributeNodeGroup == 1) {
      key = "End";
    }

    if (!this.filters[key]) {
      this.filters[key] = {};
    }

    let filterTexts = [];
    if (filter && !isQuantitative) {
      let filterNames = Object.keys(filter);
      for (let i = 0; i < filterNames.length; ++i) {
        if (!filter[filterNames[i]]) {
          filterTexts.push(filterNames[i]);
        }
      }
    }

    if (!isEmptyFilter) {
      this.filters[key][attribute] = {
        attribute: attribute,
        attributeNodeGroup: attributeNodeGroup,
        filter: filter,
        filterTexts: filterTexts,
        isQuantitative: isQuantitative
      };
    } else {
      this.filters[key][attribute] = null;
    }

  }

  hasIntermediateNodeFilters() {
    if (this.filters && this.filters["Node"]) {
      let keys = Object.keys(this.filters["Node"]);
      for (let i = 0; i < keys.length; ++i) {
        if (this.filters["Node"][keys[i]]) {
          return true;
        }
      }
    }
    return false;
  }

  onSetQuery(signal, ui) {
    this.reset();
    if (ui) {
      this.ui = ui;
      this.onQueryModified();
    }
  }

  onQueryModified() {
    this.main.queryUi = this.ui;
    this.cypher = this.generateCypher();
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
    this.filters = {};
  }

  reset() {
    let self = this;
    this.filters = {};
    this.ui = {};
    this.ui.availableNumHops = [1, 2, 3];
    this.ui.selectedNumHops = 2;
    this.setNumHops(2);
    this.cypher = "";
    this.placeholder = " ";
  }

  /**
   * Path length changed
   */
  setNumHops(numHops) {
    let keys = ["Start"];
    this.filters = {};
    this.ui.edges = [];
    this.ui.edges.push([]);

    this.ui.nodes = [];
    this.ui.nodes[0] = [];

    for (let i = 1; i < numHops; ++i) {
      keys.push("Node");
      this.ui.edges.push([]);
      this.ui.nodes[i] = [];
    }

    keys.push("End");

    this.ui.keys = keys;
    this.onQueryModified();
  }

}
