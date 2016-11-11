/* globals d3 reorder saveAs
 */
import {mock} from "../components/connectivityMatrix/mock.js";
import {cmMatrixBase} from "../components/connectivityMatrixView/cmMatrixBase";
import {cmMatrixView} from "../components/connectivityMatrixView/cmMatrixView";
import {Utils} from "../components/utils/utils";

export class MainController {
  constructor($log, $timeout, $scope, toastr, cmMatrixViewFactory, cmModelFactory, cmMatrixFactory, cmGraphFactory,
              viewState, modalService, database, $http, colorScaleService, resource) {
    'ngInject';
    this.viewState = viewState;
    this.$scope = $scope;
    this.$log = $log;
    this.toastr = toastr;
    this.cmModelFactory = cmModelFactory;
    this.cmGraphFactory = cmGraphFactory;
    this.cmMatrixFactory = cmMatrixFactory;
    this.cmMatrixViewFactory = cmMatrixViewFactory;
    this.modalService = modalService;
    this.$timeout = $timeout;
    this.$http = $http;
    this.colorScaleService = colorScaleService;
    this.resource = resource;
    this.queryUi = {};

    // Variables for displaying current state of the query to the user.
    this.hasActiveQuery = false;
    this.hasQueryError = false;
    this.hasGoodData = true;
    this.queryError = "";

    this.matrixClass = "col-lg-8";
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

    this.database = database;

    this.availablePanels = ["Node Link", "Path List"];
    this.selectedPanel = this.availablePanels[1];

    let useLargeResult = false;
    useLargeResult = true;

    let jsonGraph = null;
    let jsonMatrix = null;

    // Populate starting data with something intelligent
    if (this.database == "marclab") {
      this.isMarclabData = true;

      if (useLargeResult) {
        this.requestInitialData("/assets/mock/defaultMarclab.json");
      } else {
        jsonGraph = mock.output.graph;
        jsonMatrix = mock.output.matrix;
      }

      this.defaultQuery = "MATCH p = n-[SYNAPSE*1..2]->m WHERE n.label in ['CBb4w', 'CBb3n'] and m.label in ['GC', 'GC ON'] RETURN p limit 1000;";

    } else if (this.database == "flights") {

      if (useLargeResult) {
        this.requestInitialData("/assets/mock/defaultFlights.json");
      } else {
        jsonGraph = mock.smallFlightResult.graph;
        jsonMatrix = mock.smallFlightResult.matrix;
      }

      /*
       3-hops - 2 total
       PDX -> LAS -> DTW -> BOS x2

       2-hops - 10 total
       LAX -> DEN -> BOS x2
       SFO -> LAX -> BOS x2
       SFO -> IAD -> BOS x2
       SFO -> HNL -> JFK x2
       PDX -> IAD -> BOS x1
       PDX -> LAS -> BOS x1

       1-hop - 5 total
       LAX -> BOS x2
       SFO -> JFK x2
       PDX -> BOS x1
       */

      this.defaultQuery = "MATCH p = (s)-[x:FLIGHT]->(i)-[y:FLIGHT]->(t)  WHERE s.state in ['CA', 'OR', 'WA']  AND t.state in ['CT', 'ME', 'MA', 'RI', 'NH', 'VT'] AND x.carrier = y.carrier AND x.arr_time < y.dep_time RETURN p limit 100;"

    }

    if (!useLargeResult) {
      this.activate(jsonGraph, jsonMatrix);
    }
    // Wait until after the current digest cycle to activate the ui.

    // If debugging, then automatically manipulate the GUI.
    //$timeout(function () {
    //  if (self.ui.debugRowFilterScents) {
    //    let attribute = "area";
    //    let nodeIndexes = self.model.getFlattenedRowNodeIndexes();
    //    let nodeAttributes = self.model.getNodeAttr(nodeIndexes, attribute);
    //    self.viewState.getOrCreateFilterRange(attribute, 1, nodeAttributes);
    //    self.viewState.setFilterRange(attribute, 1, [92616600, 269473560]);
    //    self.updateLegend();
    //  }
    //}, 1);

    //$timeout(function () {
    //  if (self.ui.debugColFilterScents) {
    //    let attribute = "area";
    //    let nodeIndexes = self.model.getFlattenedColNodeIndexes();
    //    let nodeAttributes = self.model.getNodeAttr(nodeIndexes, attribute);
    //    self.viewState.getOrCreateFilterRange(attribute, 0, nodeAttributes);
    //    self.viewState.setFilterRange(attribute, 0, [216139000, 216139002]); // values selected to show only 1 col
    //    self.updateLegend();
    //  }
    //}, 1);
  }

  activate(jsonGraph, jsonMatrix, jsonQuery) {
    // Populate the model with default dataset
    let graph = this.cmGraphFactory.createFromJsonObject(jsonGraph, this.database);
    let matrix = this.cmMatrixFactory.createFromJsonObject(jsonMatrix);
    this.model = this.cmModelFactory.createModel(graph, matrix);

    let self = this;
    this.$timeout(function () {
      self.createMatrixAndUi(self.model);
      self.$scope.$broadcast("setQuery", jsonQuery);
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
    this.viewState.setModel(model);
    if (!this.matrixManager) {
      this.matrixManager = this.cmMatrixViewFactory.createConnectivityMatrixManager(this.matrixContainer, model, this.$scope, this.viewState, this);
      this.nodeListManager = this.cmMatrixViewFactory.createNodeListManager(this.nodeListContainer, model, this.$scope, this.viewState, this);
    } else {
      this.matrixManager.setModel(model);
      this.nodeListManager.setModel(model);
    }
    this.$scope.$broadcast("setModel", model);

    // this.viewState.setCategoricalFilter("airport", 2, {"DEN": true, "LAX": true, "IAD": true, "HNL": true, "LAS": true, "DTW": true});
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
    this.ui.orders = ["custom", "optimal leaf", "database", "random"];
    this.ui.selectedSortOrder = this.ui.orders[1];
  }

  createEncodingControls() {
    this.ui.encodings = cmMatrixView.getAvailableEncodings();
    this.ui.selectedEncoding = this.ui.encodings[0];
  }

  onCollapseColsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllCols();
    } else {
      this.model.expandAllCols();
      this.model.collapseColsByAttr(attr);
    }
    this.createMatrix(this.model, this.ui.selectedEncoding);

    // We are collapsing the matrix cols by an attribute. Make sure that attribute is visibile!
    this.matrixManager.setUseAnimation(false);
    if (this.model.areColsCollapsed) {
      this.matrixManager.matrices.forEach(function (matrix) {
        matrix.onToggleAttributeRow(this.matrixManager.matrix.attributes.indexOf(attr), true);
      }.bind(this));
    }
    this.onSortOrderChanged(this.ui.selectedSortOrder);
    this.matrixManager.setUseAnimation(true);
  }

  onCollapseRowsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllRows();
    } else {
      this.model.expandAllRows();
      this.model.collapseRowsByAttr(attr);
    }
    this.createMatrix(this.model, this.ui.selectedEncoding);

    this.matrixManager.setUseAnimation(false);
    if (this.model.areRowsCollapsed) {
      this.matrixManager.matrices.forEach(function (matrix) {
        matrix.onToggleAttributeCol(this.matrixManager.matrix.attributes.indexOf(attr), true);
      }.bind(this));
    }
    this.onSortOrderChanged(this.ui.selectedSortOrder);
    this.matrixManager.setUseAnimation(true);
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
    let metrics = cmMatrixBase.getAvailableMetrics(encoding, this.database);
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
    this.$scope.$apply();
    let self = this;
    this.$timeout(function () {
      self.$scope.$broadcast("setSelectedPaths", paths);
    }, 0);
  }

  /**
   * Sends a query to the database.
   */
  onQuerySubmitted(query) {
    let self = this;

    self.hasActiveQuery = true;
    self.hasQueryError = false;
    self.hasGoodData = false;

    // Reset the node-link view

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
      self.viewState.setModel(model);
      // self.viewState.reset();

      // Actually create the matrix
      self.$timeout(function () {
        self.hasGoodData = true;
        self.createMatrixAndUi(model);
      }, 0);
    };

    let failure = function (error) {
      // upon failure, update text message to the the error message
      self.hasActiveQuery = false;
      self.hasQueryError = true;

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

  onSaveClicked() {
    let state = {
      "query": this.queryUi,
      "matrix": this.model.getCmMatrix().getJsonMatrix(),
      "graph": this.model.getCmGraph().getJsonGraph()
    };

    let blob = new Blob([angular.toString(state)], {"type": "text/plain;charset=utf-8"});
    saveAs(blob, `${this.database}_state.json`);
  }

  onSortOrderChanged(order) {
    let matrix = this.matrixManager.getMajorRowsAndColsAsScalarMatrix();
    let rowPerm = undefined;
    let colPerm = undefined;

    if (matrix.length == 1 && matrix[0].length == 1) {
      this.matrixManager.setSortOrders([0], [0]);
      return;
    }
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
    } else {
      return;
    }

    this.matrixManager.setSortOrders(rowPerm, colPerm);
  }


  /**
   * Called when the user wants to filter nodes by a quantitative attributes. Opens a modal containing a
   * histogram of 'attribute' for all nodes.
   */
  openNodeAttributeFilter(attribute, nodeIndexes, nodeAttributeGroup) {
    let useCategoricalFilter = false;

    if (!nodeIndexes) {
      nodeIndexes = this.viewState.getAttributeNodeGroup(nodeAttributeGroup);
    }

    if (attribute == this.model.getCmGraph().getNodeIdName()) {
      useCategoricalFilter = true;
    } else {
      useCategoricalFilter = this.model.isCategoricalAttribute(attribute);
    }

    let flattenedIndexes = Utils.getFlattenedLists(nodeIndexes);

    let nodeAttributes = this.model.getNodeAttr(flattenedIndexes, attribute);

    if (useCategoricalFilter) {

      let isValueSelected = this.viewState.getCategoricalFilter(attribute, nodeAttributeGroup);

      let modalSuccess = function (selection) {
        this.viewState.setCategoricalFilter(attribute, nodeAttributeGroup, selection);
        this.updateLegend();
      }.bind(this);

      this.modalService.getSelectionFromList("Filter by " + attribute, Object.keys(isValueSelected), isValueSelected, modalSuccess);

    } else {

      let range = this.viewState.getQuantitativeFilter(attribute, nodeAttributeGroup, nodeAttributes);

      // When the modal is finished, save the range.
      let callback = function (result) {
        let attribute = result.attribute;
        let range = result.range;
        this.viewState.setQuantitativeFilter(attribute, nodeAttributeGroup, range);
        this.updateLegend();
      }.bind(this);

      // Open the modal.
      this.modalService.getValueRange("Filter by " + attribute, nodeAttributes, range, flattenedIndexes, attribute, callback);
    }
  }

  resetAttributeFilter(attribute, attributeNodeGroup) {
    this.viewState.resetAttributeFilter(attribute, attributeNodeGroup);
  }


  /**
   * Used for loading local mocked results.
   * @param filename
   */
  requestInitialData(filename) {
    let self = this;

    let success = function (result) {
      self.activate(result.graph, result.matrix, result.query);
    };

    let error = function (error) {
      self.$log.error("Something went wrong loading initial datasets!", error);
    };

    self.$http.get(filename)
      .success(success)
      .error(error);
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
