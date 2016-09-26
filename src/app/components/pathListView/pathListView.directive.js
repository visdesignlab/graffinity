/*global d3
 */

import {Utils} from "../utils/utils"
import {PathListModel} from "./pathListModel"

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

    this.ui = {};

    this.descending = true;
    this.orderByField = 'paths.length';

    this.setModel($scope.$parent.main.model);
    this.currentPaths = [];
  }

  getClientHeight() {
    return this.element[0][0].clientHeight;
  }

  activate(element) {
    this.element = element;
  }

  /**
   * Create a new view. Called when model changes.
   */
  setModel(signal, model) {
    this.model = model;
    this.pathListModel = new PathListModel(model, this.$log);
  }

  /**
   * User selected some paths. Draw them in the layout.
   */
  setSelectedPaths(signal, paths) {
    this.pathListModel.setPaths(paths);
    this.pathListModel.aggregatePaths();
    this.paths = paths;
    this.$log.debug(this.pathListModel);
    this.isRowExpanded = [];
    for (let i = 0; i < this.pathListModel.rows.length; ++i) {
      this.isRowExpanded[i] = false;
    }
  }

  /**
   * Called when mouse is on top of a node in this view.
   */
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
}
