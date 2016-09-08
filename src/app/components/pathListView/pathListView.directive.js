/*global d3
 */

/**
 * Angular directive that will contain the node-link diagrams. Interaction with this is handled by the
 * NodeLinkViewDirectiveController.
 */
export class PathListViewDirective {

  /**
   * Called on page load. Handles angular internal stuff.
   */
  constructor($log, $timeout) {
    "ngInject";
    this.$log = $log;
    this.$timeout = $timeout;

    // Angular directive stuff
    this.templateUrl = "app/components/pathListView/pathListView.directive.html";
    this.restrict = 'E';

    // Parameters passed from main.controller.
    this.scope = {
      viewState: '=',
      mainController: '='
    };

    this.controller = PathListViewDirectiveController;
    this.controllerAs = 'controller';
    this.bindToController = true;
    this.link = this.linkFn.bind(this);
  }

  /**
   * Called by angular compilation process.
   * Save this directive's element in the controller.
   */
  linkFn(scope, element) {
    scope.controller.element = element;
  }
}

/**
 * Controller for handling interaction with the node link views.
 * Mainly responsible for changing layouts.
 */
class PathListViewDirectiveController {

  /**
   * Save injected dependencies and bind scope events.
   * $scope is the child of main.controller's scope.
   */
  constructor($log, $scope, $timeout) {
    "ngInject"
    this.$log = $log;
    this.$scope = $scope;
    this.$timeout = $timeout;

    this.$scope.$on("setSelectedPaths", this.setSelectedPaths.bind(this));
    this.$scope.$on("setModel", this.setModel.bind(this));
    this.$scope.$on("hoverNodes", this.onHoverNodes.bind(this));

    this.ui = {};
    this.ui.availableLayouts = ["Layered", "Geographic", "Force-directed"];
    this.ui.selectedLayout = this.ui.availableLayouts[0];
    this.svg = d3.select("#node-link-svg");
    this.model = $scope.$parent.main.model;

  }

  /**
   * Create a new view. Called when model changes.
   */
  setModel(signal, model) {
    this.model = model;
  }

  /**
   * User selected some paths. Draw them in the layout.
   */
  setSelectedPaths(signal, paths) {
    this.paths = paths;
    this.$timeout(function () {
      angular.element('[data-toggle="tooltip"]').tooltip(); // to do - this searches entire dom for elements
    });
  }

  /**
   * Called when node is being hovered in another view.
   * We don't connect this directly to this.layout b/c of angular memory leaks.
   * Available parameters; ids and
   */
  onHoverNodes() {
    // if (this.layout) {
    //   if (ids) {
    //     let nodeIndexes = [];
    //     nodeIndexes = nodeIndexes.concat(ids.sources);
    //     nodeIndexes = nodeIndexes.concat(ids.targets);
    //     nodeIndexes = nodeIndexes.concat(ids.intermediates);
    //     nodeIndexes = Utils.getUniqueValues(nodeIndexes);
    // } else {
    //     this.layout.onHoverNodes(signal, null);
    //   }
    // }
  }
}
