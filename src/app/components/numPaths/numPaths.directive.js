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

    this.paths = $scope.$parent.main.model.getAllPaths();

    this.$scope.$on("filterChanged", this.onFilterChanged.bind(this));
    this.$scope.$on("setModel", this.setModel.bind(this));

    this.numVisiblePathsPerHops = null;
  }

  setModel(signal, model) {
    this.paths = model.getAllPaths();
    this.onFilterChanged();
  }

  onFilterChanged() {
    let numHopsList = Object.keys(this.paths);
    let numVisiblePathsPerHops = {};

    for (let i = 0; i < numHopsList.length; ++i) {
      numVisiblePathsPerHops[numHopsList[i]] = 0;
      let paths = this.paths[numHopsList[i]];
      for (let j = 0; j < paths.length; ++j) {
        if (!this.viewState.isPathFiltered(paths[j])) {
          numVisiblePathsPerHops[numHopsList[i]] += 1;
        }
      }
    }

    let allVisible = true;
    for (let i = 0; i < numHopsList.length; ++i) {
      allVisible = allVisible && this.paths[numHopsList[i]].length == numVisiblePathsPerHops[numHopsList[i]];
    }

    if (!allVisible) {
      this.numVisiblePathsPerHops = numVisiblePathsPerHops;
    } else {
      this.numVisiblePathsPerHops = null;
    }
  }
}
