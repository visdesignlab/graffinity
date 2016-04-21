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
    let model = cmModelFactory.createModel(graph, matrix);

    this.createMatrix(model);
  }

  createMatrix(model) {
    this.svg.selectAll("*").remove();
    model.collapseColsByAttr("label");
    model.collapseRowsByAttr("label");
    model.areColsCollapsed = true;
    this.cmMatrixViewFactory.createConnectivityMatrix(this.svg, model);
  }

  onQuerySubmitted(query) {
    let self = this;

    function success(model) {
      self.createMatrix(model);
    }

    this.cmModelFactory.requestAndCreateModel(query).then(success);
  }
}
