/*global d3
 */

import {LayeredLayout} from "./layouts/layeredLayout"
import {GeographicLayout} from "./layouts/geographicLayout"

/**
 * Angular directive that will contain the node-link diagrams. Interaction with this is handled by the
 * NodeLinkViewDirectiveController.
 */
export class NodeLinkViewDirective {

  /**
   * Called on page load. Handles angular internal stuff.
   */
  constructor($log) {
    "ngInject";
    this.$log = $log;

    // Angular directive stuff
    this.templateUrl = "app/components/nodeLinkView/nodeLinkView.directive.html";
    this.restrict = 'E';

    // Parameters passed from main.controller.
    this.scope = {
      setNodeLinkVisibility: '&',
      viewState: '=',
      mainController: '='
    };

    this.controller = NodeLinkViewDirectiveController;
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
class NodeLinkViewDirectiveController {

  /**
   * Save injected dependencies and bind scope events.
   * $scope is the child of main.controller's scope.
   */
  constructor($log, $scope) {
    "ngInject"
    this.$log = $log;
    this.$scope = $scope;

    this.$scope.$on("setSelectedPaths", this.setSelectedPaths.bind(this));
    this.$scope.$on("setModel", this.setModel.bind(this));
    this.$scope.$on("hoverNodes", this.onHoverNodes.bind(this));

    this.ui = {};
    this.ui.availableLayouts = ["Layered", "Geographic", "Force-directed"];
    this.ui.selectedLayout = this.ui.availableLayouts[0];
    this.svg = d3.select("#node-link-svg");
  }

  /**
   * Create a new view. Called when model changes.
   */
  setModel(signal, model) {
    this.model = model;
    this.onLayoutChanged(this.ui.selectedLayout);
  }

  /**
   * User selected some paths. Draw them in the layout.
   */
  setSelectedPaths(signal, paths) {
    this.paths = paths;
    this.layout.clear();
    this.selectedSubgraph = this.model.getCmGraph().getSubgraph(this.paths);
    this.$log.debug("Updating layout with new graph: ", this.selectedSubgraph);
    this.layout.setGraph(this.selectedSubgraph);
  }

  /**
   * Called when node is being hovered in another view.
   * We don't connect this directly to this.layout b/c of angular memory leaks.
   */
  onHoverNodes(signal, nodes) {
    if (this.layout) {
      this.layout.onHoverNodes(signal, nodes);
    }
  }

  /**
   * Called whenever the user changes the layout.
   * Creates a new layout object.
   */
  onLayoutChanged(layout) {

    // Create the layout
    if (layout == "Layered") {
      this.layout = new LayeredLayout(this.svg, this.model, this.$log, this.viewState, this.mainController);
    } else if (layout == "Geographic") {
      this.layout.clear();
      this.layout = new GeographicLayout(this.svg, this.model, this.$log, this.viewState, this.mainController);
      //alert(layout + " not implemented yet");
    } else /* if (layout == "Force-directed") */ {
      alert(layout + " not implemented yet");
    }

    // Give the layout data to draw.
    if (this.paths) {
      this.layout.setGraph(this.selectedSubgraph);
    }
  }
}
