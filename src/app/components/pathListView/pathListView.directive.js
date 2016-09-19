/*global d3
 */

import {Utils} from "../utils/utils"

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
    this.restrict = 'EA';

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
    scope.controller.activate(d3.select(element[0].parentNode.parentNode));
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
  constructor($log, $scope, $timeout, viewState) {
    "ngInject"
    this.$log = $log;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.viewState = viewState;

    this.$scope.$on("setSelectedPaths", this.setSelectedPaths.bind(this));
    this.$scope.$on("setModel", this.setModel.bind(this));
    this.$scope.$on("hoverNodes", this.onHoverNodes.bind(this));
    this.$scope.$on("setPathListVisible", this.update.bind(this));

    this.ui = {};

    this.model = $scope.$parent.main.model;
    this.itemsPerPage = 20;
    this.currentPage = 1;
    this.currentPaths = [];

    //this.$log.debug(this.element);

  }

  getClientHeight() {
    return this.element[0][0].clientHeight;
  }

  activate(element) {
    this.element = element;
    this.$log.debug(this.getClientHeight());
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
    this.$log.debug(this.element);
    this.paths = paths;
    this.setPage(1);
  }

  setPage(newPage) {
    this.currentPage = newPage;
    this.currentPaths = [];
    for (let i = 0; i < this.itemsPerPage; ++i) {
      let index = (this.itemsPerPage * (this.currentPage - 1)) + i;
      if (index < this.paths.length) {
        this.currentPaths.push(this.paths[index]);
      }
    }
    this.$timeout(function () {
      angular.element('[data-toggle="tooltip"]').tooltip(); // to do - this searches entire dom for elements
    });
  }

  hoverNodes(nodeIndex) {
    if (nodeIndex) {
      let ids = {
        sources: nodeIndex,
        intermediates: nodeIndex,
        targets: nodeIndex
      };
      this.viewState.setHoveredNodes(ids, false);
    } else {
      this.viewState.setHoveredNodes(null, false);
    }
  }

  /**
   * Called when node is being hovered in another view.
   */
  onHoverNodes(signal, ids) {
    if (ids) {
      let nodeIndexes = [];
      nodeIndexes = nodeIndexes.concat(ids.sources);
      nodeIndexes = nodeIndexes.concat(ids.targets);
      nodeIndexes = nodeIndexes.concat(ids.intermediates);
      this.hoveredNodes = Utils.getUniqueValues(nodeIndexes);
    } else {
      this.hoveredNodes = [];
    }

    let self = this;
    this.$timeout(function () {
      self.$scope.$apply();
    });
  }

  update() {
    this.$log.debug("onResize", this.element[0].offsetHeight);

    this.$log.debug(this.getClientHeight());

  }
}
