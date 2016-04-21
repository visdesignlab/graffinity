/* globals d3
 */
import {mock} from "../components/connectivityMatrix/mock.js";

export class MainController {
  constructor($log, toastr, cmMatrixViewFactory, cmModelFactory, cmMatrixFactory, cmGraphFactory) {
    'ngInject';

    this.$log = $log;
    this.toastr = toastr;
    this.cmModelFactory = cmModelFactory;
    this.cmMatrixViewFactory = cmMatrixViewFactory;

    this.ui = {};

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

    this.createMatrixAndUi(this.model);
  }

  createCategoricalCollapseControls(model) {
    this.ui.availableCategoricalAttr = ["none"];
    this.ui.availableCategoricalAttr = this.ui.availableCategoricalAttr.concat(model.getCmGraph().getCategoricalNodeAttrNames());
    this.ui.selectedCategoricalColAttr = this.ui.availableCategoricalAttr[0];
    this.ui.selectedCategoricalRowAttr = this.ui.availableCategoricalAttr[0];

  }

  createMatrix(model) {
    this.svg.selectAll("*").remove();
    this.cmMatrixViewFactory.createConnectivityMatrix(this.svg, model);
  }

  createMatrixAndUi(model) {
    this.createMatrix(model);
    this.createCategoricalCollapseControls(model);
  }

  onCollapseColsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllCols();
    } else {
      this.model.collapseColsByAttr(attr);
    }
    this.createMatrix(this.model);
  }

  onCollapseRowsByAttr(attr) {
    if (attr == "none") {
      this.model.expandAllRows();
    } else {
      this.model.collapseRowsByAttr(attr);
    }
    this.createMatrix(this.model);
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
}
