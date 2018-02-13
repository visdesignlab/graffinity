/* globals d3 reorder saveAs
 */
import {mock} from "../components/connectivityMatrix/mock.js";
import {Utils} from "../components/utils/utils";

export class MainController {
  constructor($log, $timeout, $scope, $q, toastr, cmMatrixViewFactory, cmModelFactory, cmMatrixFactory, cmGraphFactory,
              viewState, modalService, database, $http, colorScaleService, resource, dataSelectionService) {
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
    this.areDetailsVisible = true;
    // Variables for displaying current state of the query to the user.
    this.hasActiveQuery = false;
    this.hasQueryError = false;
    this.hasGoodData = true;
    this.queryError = "";
    this.debug = true;
    this.$q = $q;
    this.dataSelectionService = dataSelectionService;

    // Object for representing what the user has currently selected or entered in the ui.
    this.ui = {};
    this.database = database;

    this.isMarclabData = this.database == "marclab";
    this.isNodeListVisible = true;
    // If true, enable manual controls of what nodes are shown/hidden.
    this.ui.debugNodeHiding = false;
    this.ui.debugNodeHidingId = 168;
    this.ui.debugNodeLinkLayout = false;


    // Set these to true to automatically set attributes on the filter ranges. (see below)
    this.ui.debugRowFilterScents = false;
    this.ui.debugColFilterScents = false;

    // Setup a default query and dataset depending on our database.
    this.availablePanels = ["Node Link", "Path List"];
    this.selectedPanel = this.availablePanels[1];

    this.ui.matrixScales = ["linear", "log"];
    this.ui.selectedMatrixScale = this.isMarclabData ? this.ui.matrixScales[0] : this.ui.matrixScales[1];
    this.ui.selectedNodeListScale = this.isMarclabData ? this.ui.matrixScales[0] : this.ui.matrixScales[1];

    if (this.isMarclabData) {
      this.colorScaleService.setUseLinearColorScale(true, 0);
      this.colorScaleService.setUseLinearColorScale(true, 1);
      this.colorScaleService.setUseLinearColorScale(true, 2);
      this.colorScaleService.setUseLinearColorScale(true, 3);
    }

    //this.modalService.getSelectionFromList("Filter by " + attribute, Object.keys(isValueSelected), isValueSelected, modalSuccess);
    this.activateWithClientOnlyData();


    let useLargeResult = false;

    let jsonGraph = null;
    useLargeResult = true;

    let jsonMatrix = null;

    // Populate starting data with something intelligent
    if (this.database == "marclab") {

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

  /**
   *
   */
  activateWithClientOnlyData() {
    let self = this;
    let defaultDataNames = ["/assets/mock/2018.01.23-network-514-1-hop.json", "/assets/mock/2018.01.23-network-all-hops.json"];

    // Callback after the user selects a dataset.
    let userSelectedDataCallback = function (result) {
      self.$log.debug(result);
    };

    // Called after we have loaded all of the default datasets.
    // Asks the use what dataset to use through the dataSelectModal..
    let success = function (results) {

      // Pull out data from http responses.
      let dataValues = [];
      for (let i = 0; i < results.length; ++i) {
        dataValues.push(results[i].data);
      }

      // Ask user.
      self.dataSelectionService.getSelectionFromList(defaultDataNames, dataValues, userSelectedDataCallback);
    };


    // Load all of the default data.
    let requests = [];
    for (let i = 0; i < defaultDataNames.length; ++i) {
      requests.push(self.$http.get(defaultDataNames[i]));
    }

    self.$q.all(requests).then(success);
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
    this.ui.selectedIntermediateRowAttr = this.ui.availableCategoricalAttr[0];
  }

  createMatrix(model) {
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

    let metrics = this.matrixManager.matrix.getAvailableMetrics(this.database);
    this.ui.matrixMetrics = angular.copy(metrics);
    this.ui.selectedMatrixMetric = this.ui.matrixMetrics[0];
    this.setMetric("matrix", this.ui.selectedMatrixMetric);

    metrics = this.nodeListManager.matrix.getAvailableMetrics(this.database);
    this.ui.nodeListMetrics = angular.copy(metrics);
    this.ui.selectedNodeListMetric = this.ui.nodeListMetrics[0];
    this.setMetric("nodeList", this.ui.selectedNodeListMetric);
  }

  createMatrixAndUi(model) {
    this.matrixContainer = d3.select("#matrices-row");
    this.nodeListContainer = d3.select("#node-list-col");

    this.createCategoricalCollapseControls(model);
    this.createReorderControls();
    this.createMatrix(model);

    // Disable animation of the matrix so that its initial position is the sorted one.
    this.matrixManager.setUseAnimation(false);
    this.onSortOrderChanged("random");
    this.matrixManager.setUseAnimation(true);
  }

  createReorderControls() {
    this.ui.orders = ["custom", "optimal leaf", "database", "" +
    ""];
    this.ui.selectedSortOrder = this.ui.orders[1];
  }

  onCollapseColsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllCols();
    } else {
      this.model.expandAllCols();
      this.model.collapseColsByAttr(attr);
    }
    this.matrixManager.setModel(this.model);
    this.setMetric("matrix", this.ui.selectedMatrixMetric);

    // We are collapsing the matrix cols by an attribute. Make sure that attribute is visibile!
    this.matrixManager.setUseAnimation(false);

    this.matrixManager.matrices.forEach(function (matrix) {

      if (this.model.areColsCollapsed) {
        matrix.onToggleAttributeRow(this.matrixManager.matrix.attributes.indexOf(this.model.colsCollapseAttr), true);
      }

      if (this.model.areRowsCollapsed) {
        matrix.onToggleAttributeCol(this.matrixManager.matrix.attributes.indexOf(this.model.rowCollapseAttr), true);
      }

    }.bind(this));

    this.onSortOrderChanged(this.ui.selectedSortOrder);
    this.matrixManager.setUseAnimation(true);
  }

  onCollapseIntermediateRows(attr) {
    if (attr == "none") {
      this.model.expandIntermediateRows();
    } else {
      this.model.expandIntermediateRows();
      this.model.collapseIntermediateNodesByAttr(attr);
    }

    this.nodeListManager.setModel(this.model);
    this.setMetric("nodeList", this.ui.selectedNodeListMetric);

    this.nodeListManager.matrices.forEach(function (matrix) {

      if (this.model.areIntermediateNodesCollapsed) {
        matrix.onToggleAttributeCol(this.nodeListManager.matrix.attributes.indexOf(this.model.intermediateNodeCollapseAttr), true);
      }

    }.bind(this));
  }

  onCollapseRowsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllRows();
    } else {
      this.model.expandAllRows();
      this.model.collapseRowsByAttr(attr);
    }

    this.matrixManager.setModel(this.model);
    this.setMetric("matrix", this.ui.selectedMatrixMetric);

    this.matrixManager.setUseAnimation(false);
    this.matrixManager.matrices.forEach(function (matrix) {

      if (this.model.areColsCollapsed) {
        matrix.onToggleAttributeRow(this.matrixManager.matrix.attributes.indexOf(this.model.colsCollapseAttr), true);
      }

      if (this.model.areRowsCollapsed) {
        matrix.onToggleAttributeCol(this.matrixManager.matrix.attributes.indexOf(this.model.rowCollapseAttr), true);
      }

    }.bind(this));

    this.onSortOrderChanged(this.ui.selectedSortOrder);
    this.matrixManager.setUseAnimation(true);
  }

  onColorScaleChanged(colorScale) {
    this.colorScaleService.setUseLinearColorScale(colorScale == 'linear');
    this.onMetricChanged("colormap");
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
   * Load some debugging data.
   */
  onLoadClicked() {
    this.requestInitialData("/assets/mock/defaultMarclab.json");
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
    let stateString = JSON.stringify(state);
    let blob = new Blob([stateString], {"type": "text/plain;"});

    saveAs(blob, `${this.database}_state.json`);
  }

  onSortOrderChanged(order) {
    let matrix = this.matrixManager.getMajorRowsAndColsAsScalarMatrix();
    let rowPerm = undefined;
    let colPerm = undefined;

    if (matrix.length == 1 && matrix[0].length == 1) {
      this.matrixManager.setSortOrders([0], [0]);
      return;
    } else if (matrix.length == 1 && matrix[0].length > 1) {
      this.matrixManager.setSortOrders([0], reorder.permutation(matrix[0].length));
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

  setEncoding(view, metric, encoding) {
    let matrix = this.matrixManager.matrix;
    if (view == "matrix") {
      this.ui.matrixHasScaleOption = encoding.hasScaleOption;
    } else {
      this.ui.nodeListHasScaleOption = encoding.hasScaleOption;
      matrix = this.nodeListManager.matrix;
    }
    matrix.setEncoding(encoding, metric);
    angular.element('[data-toggle="tooltip"]').tooltip();
  }

  setEncodingScale(view, scale) {
    let matrix = this.matrixManager.matrix;
    if (view == "matrix") {

      this.colorScaleService.setUseLinearColorScale(scale == 'linear', 0);
      this.colorScaleService.setUseLinearColorScale(scale == 'linear', 1);

      matrix.setEncoding(this.ui.selectedMatrixEncoding, this.ui.selectedMatrixMetric);
    } else {
      matrix = this.nodeListManager.matrix;
      this.colorScaleService.setUseLinearColorScale(scale == 'linear', 2);
      this.colorScaleService.setUseLinearColorScale(scale == 'linear', 3);
      matrix.setEncoding(this.ui.selectedNodeListEncoding, this.ui.selectedNodeListMetric);
    }

    angular.element('[data-toggle="tooltip"]').tooltip();
  }

  setMetric(view, metric) {
    let matrix = null;
    let encoding = null;
    if (view == "matrix") {
      if (this.model.areRowsCollapsed && this.model.areColsCollapsed) {
        this.ui.primaryScaleName = "set-to-set ";
        this.ui.secondaryScaleName = "";
      } else if (this.model.areRowsCollapsed && !this.model.areColsCollapsed) {
        this.ui.primaryScaleName = "set-to-node ";
        this.ui.secondaryScaleName = "node-to-node ";
      } else if (!this.model.areRowsCollapsed && this.model.areColsCollapsed) {
        this.ui.primaryScaleName = "node-to-set ";
        this.ui.secondaryScaleName = "node-to-node ";
      } else if (!this.model.areRowsCollapsed && !this.model.areColsCollapsed) {
        this.ui.primaryScaleName = "node-to-node ";
        this.ui.secondaryScaleName = "";
      }
      matrix = this.matrixManager.matrix;
      this.ui.matrixEncodings = matrix.getAvailableEncodings(metric.output);
      this.ui.selectedMatrixEncoding = this.ui.matrixEncodings[0];
      encoding = this.ui.selectedMatrixEncoding;
    } else if (view == "nodeList") {
      if (this.model.areIntermediateNodesCollapsed) {
        this.ui.primaryNodeListScaleName = "set ";
        this.ui.secondaryNodeListScaleName = "node ";
      } else {
        this.ui.primaryNodeListScaleName = "node ";
        this.ui.secondaryNodeListScaleName = "";
      }
      this.ui.nodeListScaleName = metric.name;
      matrix = this.nodeListManager.matrix;
      this.ui.nodeListEncodings = matrix.getAvailableEncodings(metric.output);
      this.ui.selectedNodeListEncoding = this.ui.nodeListEncodings[0];
      encoding = this.ui.selectedNodeListEncoding;
    }

    this.setEncoding(view, metric, encoding);
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
