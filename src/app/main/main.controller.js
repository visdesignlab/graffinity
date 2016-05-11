/* globals d3 reorder
 */
import {mock} from "../components/connectivityMatrix/mock.js";
import {cmMatrixView} from "../components/connectivityMatrixView/cmMatrixView";

export class MainController {
  constructor($log, $timeout, $scope, toastr, cmMatrixViewFactory, cmModelFactory, cmMatrixFactory, cmGraphFactory, viewState, uiModals) {
    'ngInject';

    this.viewState = viewState;
    this.$scope = $scope;
    this.$log = $log;
    this.toastr = toastr;
    this.cmModelFactory = cmModelFactory;
    this.cmMatrixViewFactory = cmMatrixViewFactory;
    this.uiModals = uiModals;

    this.ui = {};

    this.ui.debugNodeHiding = true;
    this.ui.nodeId = 168;

    this.svg = d3.select("#my-svg")
      .append("g")
      .attr("transform", "translate(20, 20)");

    let useLargeResult = true;
    useLargeResult = false;
    let jsonGraph = mock.output.graph;
    let jsonMatrix = mock.output.matrix;
    if (useLargeResult) {
      jsonGraph = mock.largeResult.graph;
      jsonMatrix = mock.largeResult.matrix;
    }

    let graph = cmGraphFactory.createFromJsonObject(jsonGraph);
    let matrix = cmMatrixFactory.createFromJsonObject(jsonMatrix);
    this.model = cmModelFactory.createModel(graph, matrix);

    let self = this;
    $timeout(function () {
      self.createMatrixAndUi(self.model)
    }, 1);

  }

  createCategoricalCollapseControls(model) {
    this.ui.availableCategoricalAttr = ["none"];
    this.ui.availableCategoricalAttr = this.ui.availableCategoricalAttr.concat(model.getCmGraph().getCategoricalNodeAttrNames());
    this.ui.selectedCategoricalColAttr = this.ui.availableCategoricalAttr[0];
    this.ui.selectedCategoricalRowAttr = this.ui.availableCategoricalAttr[0];
  }

  createMatrix(model, encoding) {
    this.svg.selectAll("*").remove();
    this.model = model;
    this.matrix = this.cmMatrixViewFactory.createConnectivityMatrix(this.svg, model, this.$scope, this.viewState, this);
    this.onEncodingChanged(encoding);
  }

  createMatrixAndUi(model) {
    this.createCategoricalCollapseControls(model);
    this.createReorderControls();
    this.createEncodingControls();
    this.createMatrix(model, this.ui.selectedEncoding);
  }

  createReorderControls() {
    this.ui.orders = ["initial", "random", "optimal leaf"];
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

  onDebugNodeHiding(nodeId, makeVisible) {
    if (!makeVisible) {
      this.viewState.hideNodes([parseInt(nodeId)]);
    } else {
      this.viewState.showNodes([parseInt(nodeId)]);
    }

  }

  onEncodingChanged(encoding) {
    this.matrix.setEncoding(encoding);

    d3.select("#encoding-legend")
      .selectAll("*")
      .remove();

    let group = d3.select("#encoding-legend")
      .append("g")
      .attr("transform", "translate(1, 4)");

    let width = d3.select("#select-encoding").node().getBoundingClientRect().width;
    if (this.matrix.legend) {
      this.matrix.legend.createView(group, width, width);
      this.ui.hasLegend = true;
    } else {
      this.ui.hasLegend = false;
    }
  }

  onQuerySubmitted(query) {
    let self = this;

    let success = function (model) {
      self.model = model;
      self.createMatrixAndUi(model);
    };

    let failure = function (error) {
      self.$log.error("The query failed!", error);
    };

    // Give the model factory a query string. Async call success or failure.
    this.cmModelFactory.requestAndCreateModel(query).then(success, failure);
  }

  onSortOrderChanged(order) {
    let matrix = this.model.getCurrentScalarMatrix();
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
    } else if (order == 'initial') {
      rowPerm = reorder.permutation(matrix.length);
      colPerm = reorder.permutation(matrix[0].length);
    }
    this.matrix.setSortOrders(rowPerm, colPerm);
  }

  openNodeAttributeFilter(attribute) {
    let nodeIndexes = this.model.getFlattenedNodeIndexes();
    let nodeAttributes = this.model.getNodeAttr(nodeIndexes, attribute);
    let range = [d3.min(nodeAttributes), d3.max(nodeAttributes)];
    let self = this;
    let callback = function(range) {
      self.$log.debug(range);
    };
    this.uiModals.getValueRange("Select range of " + attribute, nodeAttributes, range, callback);
  }

  openNodeIndexFilter() {
    this.openNodeAttributeFilter("area");
    /*
    let nodeIndexes = this.model.getFlattenedNodeIndexes();

    // "selected" nodes are visible. Unselected nodes are currently hidden.
    let isNodeSelected = this.viewState.getHiddenNodesAsSelection(nodeIndexes);

    // Tell viewState the user updated visible nodes. This causes viewState to broadcast changes and ultimately
    // updates the nodes this is displaying.
    let modalSuccess = function (selection) {
      this.viewState.setHiddenNodesFromSelection(selection);
    };
    modalSuccess = modalSuccess.bind(this);

    this.uiModals.getSelectionFromList("Select nodes", nodeIndexes, isNodeSelected, modalSuccess);
    */
  }


}
