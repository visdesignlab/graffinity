export class NumPathsDirective {

  /**
   * Called on page load. Handles angular internal stuff.
   */
  constructor($log) {
    "ngInject";
    this.$log = $log;

    // Angular directive stuff
    this.templateUrl = "app/components/numPaths/numPaths.directive.html";

    // Parameters passed from main.controller.
    this.scope = {
      viewState: '=',
      mainController: '='
    };

    this.controller = NumPathsController;
    this.controllerAs = 'numPathsController';
    this.bindToController = true;
  }

}


class NumPathsController {

  constructor($scope, $log) {
    "ngInject";
    this.$log = $log;
    this.$scope = $scope;

    this.name = "shit";
    // the default query gets populated in main's constructor
    this.defaultQuery = $scope.$parent.main.defaultQuery;

    this.cypherQuery = this.defaultQuery;

    this.$log.debug(this);

    this.paths = $scope.$parent.main.model.getAllPaths();

    this.$scope.$on("filterChanged", this.onFilterChanged.bind(this));

  }

  onFilterChanged() {
    this.$log.debug(this, "onFilterChanged");

  }

}
