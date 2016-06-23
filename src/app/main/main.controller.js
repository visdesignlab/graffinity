/* globals d3 reorder
 */
import {mock} from "../components/connectivityMatrix/mock.js";
import {cmMatrixBase} from "../components/connectivityMatrixView/cmMatrixBase";
import {cmMatrixView} from "../components/connectivityMatrixView/cmMatrixView";

import {Utils} from "../components/utils/utils";

export class MainController {
  constructor($log, $timeout, $scope, toastr, cmMatrixViewFactory, cmModelFactory, cmMatrixFactory, cmGraphFactory,
              viewState, modalService, NodeLinkViewFactory) {
    'ngInject';
    this.viewState = viewState;
    this.$scope = $scope;
    this.$log = $log;
    this.toastr = toastr;
    this.cmModelFactory = cmModelFactory;
    this.cmMatrixViewFactory = cmMatrixViewFactory;
    this.modalService = modalService;
    this.$timeout = $timeout;

    // Variables for displaying current state of the query to the user.
    this.hasActiveQuery = false;
    this.hasQueryError = false;
    this.queryError = "";

    this.matrixClass = "col-lg-9";
    this.nodeLinkClass = "";

    // Object for representing what the user has currently selected or entered in the ui.
    this.ui = {};

    // If true, enable manual controls of what nodes are shown/hidden.
    this.ui.debugNodeHiding = false;
    this.ui.debugNodeHidingId = 168;
    this.ui.debugNodeLinkLayout = false;

    // Set these to true to automatically set attributes on the filter ranges. (see below)
    this.ui.debugRowFilterScents = false;
    this.ui.debugColFilterScents = false;

    // Setup a default query and dataset depending on our database.

    // this.database = "marclab";
    this.database = "flights";

    let useLargeResult = false;
    useLargeResult = true;

    let jsonGraph = null;
    let jsonMatrix = null;

    // Populate starting data with something intelligent
    if (this.database == "marclab") {

      if (useLargeResult) {
        jsonGraph = mock.largeResult.graph;
        jsonMatrix = mock.largeResult.matrix;
      } else {
        jsonGraph = mock.output.graph;
        jsonMatrix = mock.output.matrix;
      }

      this.defaultQuery = "MATCH p = n-[SYNAPSE*1..2]->m WHERE n.label in ['CBb4w', 'CBb3n'] and m.label in ['GC', 'GC ON'] RETURN p limit 1000;";

    } else if (this.database == "flights") {

      jsonGraph = mock.flightResult.graph;
      jsonMatrix = mock.flightResult.matrix;
      this.defaultQuery = "MATCH p = (s)-[x:FLIGHT]->(i)-[y:FLIGHT]->(t)  WHERE s.state in ['CA', 'OR', 'WA']  AND t.state in ['CT', 'ME', 'MA', 'RI', 'NH', 'VT'] AND x.carrier = y.carrier AND x.arr_time < y.dep_time RETURN p"

    }

    // Populate the model with default dataset
    let graph = cmGraphFactory.createFromJsonObject(jsonGraph);
    let matrix = cmMatrixFactory.createFromJsonObject(jsonMatrix);
    this.model = cmModelFactory.createModel(graph, matrix);

    this.nodeLinkSvg = d3.select("#node-link-svg");
    this.nodeLinkView = NodeLinkViewFactory.createNodeLinkView(this.nodeLinkSvg, this.model, this.$scope, this.viewState, this);

    // Wait until after the current digest cycle to activate the ui.
    let self = this;
    $timeout(function () {
      self.createMatrixAndUi(self.model);
    }, 1);

    // If debugging, then automatically manipulate the GUI.
    $timeout(function () {
      if (self.ui.debugRowFilterScents) {
        let attribute = "area";
        let nodeIndexes = self.model.getFlattenedRowNodeIndexes();
        let nodeAttributes = self.model.getNodeAttr(nodeIndexes, attribute);
        self.viewState.getOrCreateFilterRange(attribute, 1, nodeAttributes);
        self.viewState.setFilterRange(attribute, 1, [92616600, 269473560]);
        self.updateLegend();
      }
    }, 1);

    $timeout(function () {
      if (self.ui.debugColFilterScents) {
        let attribute = "area";
        let nodeIndexes = self.model.getFlattenedColNodeIndexes();
        let nodeAttributes = self.model.getNodeAttr(nodeIndexes, attribute);
        self.viewState.getOrCreateFilterRange(attribute, 0, nodeAttributes);
        self.viewState.setFilterRange(attribute, 0, [216139000, 216139002]); // values selected to show only 1 col
        self.updateLegend();
      }
    }, 1);
  }

  createCategoricalCollapseControls(model) {
    this.ui.availableCategoricalAttr = ["none"];
    this.ui.availableCategoricalAttr = this.ui.availableCategoricalAttr.concat(model.getCmGraph().getCategoricalNodeAttrNames());
    this.ui.selectedCategoricalColAttr = this.ui.availableCategoricalAttr[0];
    this.ui.selectedCategoricalRowAttr = this.ui.availableCategoricalAttr[0];
  }

  createMatrix(model, encoding) {
    // this.svg.selectAll("*").remove();
    this.model = model;
    if (!this.matrixManager) {
      this.matrixManager = this.cmMatrixViewFactory.createConnectivityMatrixManager(this.matrixContainer, model, this.$scope, this.viewState, this);
      this.nodeListManager = this.cmMatrixViewFactory.createNodeListManager(this.nodeListContainer, model, this.$scope, this.viewState, this);
    } else {
      this.matrixManager.setModel(model);
      this.nodeListManager.setModel(model);
    }

    this.nodeLinkView.setModel(model);
    this.viewState.setCurrentModel(model);
    this.onEncodingChanged(encoding);
  }

  createMatrixAndUi(model) {
    this.matrixContainer = d3.select("#matrices-row");
    this.nodeListContainer = d3.select("#node-list-col");

    this.createCategoricalCollapseControls(model);
    this.createReorderControls();
    this.createEncodingControls();
    this.createMatrix(model, this.ui.selectedEncoding);

    // Disable animation of the matrix so that its initial position is the sorted one.
    this.matrixManager.setUseAnimation(false);
    this.onSortOrderChanged("optimal leaf");
    this.matrixManager.setUseAnimation(true);
  }

  createReorderControls() {
    this.ui.orders = ["optimal leaf", "database", "random"];
  }

  createEncodingControls() {
    this.ui.encodings = cmMatrixView.getAvailableEncodings();
    this.ui.selectedEncoding = this.ui.encodings[0];
  }

  onCollapseColsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllCols();
    } else {
      this.model.collapseColsByAttr(attr);
    }
    this.createMatrix(this.model, this.ui.selectedEncoding);
  }

  onCollapseRowsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllRows();
    } else {
      this.model.collapseRowsByAttr(attr);
    }
    this.createMatrix(this.model, this.ui.selectedEncoding);
  }

  /**
   * Called when we enter a node into the debugging contorls.
   */
  onDebugNodeHiding(nodeId, makeVisible) {
    if (!makeVisible) {
      this.viewState.hideNodes([parseInt(nodeId)]);
    } else {
      this.viewState.showNodes([parseInt(nodeId)]);
    }
  }

  /**
   * Called when the user changes the encoding dropdown box. This tells the matrix to change cell encodings and
   * updates the legend displayed in the sidebar.
   */
  onEncodingChanged(encoding) {
    let metrics = cmMatrixBase.getAvailableMetrics(encoding);
    if (metrics) {
      this.ui.metrics = angular.copy(metrics);
      this.ui.selectedMetric = this.ui.metrics[0];
      this.onMetricChanged(this.ui.selectedMetric, encoding);
    } else {
      this.ui.metrics = null;
      this.matrixManager.matrix.setEncoding(encoding);
      this.updateLegend();
    }
  }

  onMetricChanged(metric, encoding) {
    this.matrixManager.matrix.setEncoding(encoding, metric);
    this.updateLegend();
  }

  /**
   * This gets called when the user clicks on a cell in the matrix view. It will populate the node-link view with a list
   * of paths. These paths are already filtered.
   * Function must end with a $scope.$apply in order to update the css layout.
   */
  onPathsSelected(paths) {
    this.setNodeLinkVisibility(true);
    this.$scope.$apply();
    let self = this;
    this.$timeout(function () {
      self.nodeLinkView.setSelectedPaths(paths);
    }, 0);
  }

  /**
   * Sends a query to the database.
   */
  onQuerySubmitted(query) {
    let self = this;

    self.hasActiveQuery = true;
    self.hasQueryError = false;

    // Reset the node-link view
    self.setNodeLinkVisibility(false);
    self.nodeLinkView.clear();

    // remove svg when query button pressed
    // this.svg.selectAll("*").remove();

    // remove legend when query button pressed
    d3.select("#encoding-legend")
      .selectAll("*")
      .remove();

    /**
     * Called when the query is finished loading.
     * Updating self.hasActiveQuery makes the matrix's row visible. We need to let the digest finish before creating
     * the matrix. That's why the timeout is wrapped around createMatrixAndUi.
     */
    let success = function (model) {
      // Turn off the query loading screen.
      self.hasActiveQuery = false;

      // Update the model
      self.model = model;
      self.viewState.setCurrentModel(model);
      self.viewState.reset();

      // Actually create the matrix
      self.$timeout(function () {
        self.createMatrixAndUi(model);
      }, 0);
    };

    let failure = function (error) {
      // upon failure, update text message to the the error message
      self.hasActiveQuery = false;
      self.hasQueryError = true;
      self.queryError = "Query Error: \n" + error.data.message;

      // log the error
      self.$log.error("The query failed", error);

      if (error.data) {
        self.queryError = "Query Error: \n" + error.data.message;
      } else {
        self.queryError = "The server sent no response! Check console.";
      }
    };

    // Give the model factory a query string. Async call success or failure.
    this.cmModelFactory.requestAndCreateModel(query, this.database).then(success, failure);
  }

  onSortOrderChanged(order) {
    let matrix = this.matrixManager.getMajorRowsAndColsAsScalarMatrix();
    let rowPerm = undefined;
    let colPerm = undefined;
    if (order == 'random') {
      rowPerm = reorder.randomPermutation(matrix.length);
      colPerm = reorder.randomPermutation(matrix[0].length);
    } else if (order == 'optimal leaf') {
      let transpose = reorder.transpose(matrix);
      let distRows = reorder.dist()(matrix);
      let distCols = reorder.dist()(transpose);
      let order = reorder.optimal_leaf_order();
      rowPerm = order.distanceMatrix(distRows)(matrix);
      colPerm = order.distanceMatrix(distCols)(transpose);
    } else if (order == 'database') {
      rowPerm = reorder.permutation(matrix.length);
      colPerm = reorder.permutation(matrix[0].length);
    }

    this.matrixManager.setSortOrders(rowPerm, colPerm);
  }

  /**
   * Called when the node-link view gets toggled. This will either collapse or expand the far right column which
   * contains the node-link directive.
   */
  onToggleNodeLinkView() {
    this.setNodeLinkVisibility(this.nodeLinkClass == "");
  }

  /**
   * Called when the user wants to filter nodes by a quantitative attributes. Opens a modal containing a
   * histogram of 'attribute' for all nodes.
   */
  openNodeAttributeFilter(attribute, nodeIndexes, nodeAttributeGroup) {
    // Get lists of all nodes and their attributes
    nodeIndexes = Utils.getUniqueValues(Utils.getFlattenedLists(nodeIndexes));
    let nodeAttributes = this.model.getNodeAttr(nodeIndexes, attribute);
    let range = this.viewState.getOrCreateFilterRange(attribute, nodeAttributeGroup, nodeAttributes);

    // When the modal is finished, save the range.
    let self = this;
    let callback = function (result) {
      let attribute = result.attribute;
      let range = result.range;
      self.viewState.setFilterRange(attribute, nodeAttributeGroup, range);
      self.updateLegend();
    };

    // Open the modal.
    this.modalService.getValueRange("Select range of " + attribute, nodeAttributes, range, nodeIndexes, attribute, callback);
  }

  /**
   * Called when the user clicks 'filter' for the node Ids. Opens a modal containing a checklist of nodes ids.
   */
  openNodeIndexFilter() {
    let nodeIndexes = this.model.getFlattenedNodeIndexes();

    // "selected" nodes are visible. Unselected nodes are currently hidden.
    let isNodeSelected = this.viewState.getHiddenNodesAsSelection(nodeIndexes);

    // Tell viewState the user updated visible nodes. This causes viewState to broadcast changes and ultimately
    // updates the nodes this is displaying.
    let modalSuccess = function (selection) {
      this.viewState.setHiddenNodesFromSelection(selection);
    };
    modalSuccess = modalSuccess.bind(this);

    this.modalService.getSelectionFromList("Select nodes", nodeIndexes, isNodeSelected, modalSuccess);
  }

  /**
   * Makes the node-link view visible by expanding it from the right side of the screen.
   * This causes an animated transition because of the '.row span' definition in main.css
   */
  setNodeLinkVisibility(visible) {
    if (!visible) {
      this.nodeLinkClass = "";
      this.matrixClass = "col-lg-9";

      // Let the resize event finish before expanding the matrix.
      let self = this;
      this.$timeout(function () {
        self.matrixManager.updateElementPositions();
      }, 300);

    } else {

      // Need to shrink the matrix's div before we show the node-link view. This stops the matrix's 4 divs from
      // getting pushed onto different lines.
      this.matrixManager.setWidth(angular.element("#controls-column")[0].clientWidth * 7);

      this.nodeLinkClass = "col-lg-2";
      this.matrixClass = "col-lg-7";
    }
  }

  updateLegend() {

    d3.select("#encoding-legend")
      .selectAll("*")
      .remove();

    let group = d3.select("#encoding-legend")
      .append("g")
      .attr("transform", "translate(1, 4)");

    let width = d3.select("#select-encoding").node().getBoundingClientRect().width;

    if (this.matrixManager.matrix.legend) {
      this.matrixManager.matrix.legend.createView(group, width, width);
      this.ui.hasLegend = true;
    } else {
      this.ui.hasLegend = false;
    }
  }
}
