import {cmNodeListControls} from "./cmNodeListControls"
import {cmNodeListLeftHeader} from "./cmNodeListLeftHeader"
import {cmWrapperBase} from "./../cmWrapperBase"
import {cmNodeListTopHeader} from "./cmNodeListTopHeader"
import {cmNodeListView} from "./cmNodeListView"

export class cmNodeListWrapper extends cmWrapperBase {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController, $compile) {

    element.append("div")
      .attr("id", "intermediate-nodes-warning")
      .html("");

    super(element, $log, scope, mainController, "node-list", $compile);

    this.controlsHeader = new cmNodeListControls(this.controlsHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.controlsHeader.setGridPosition([0, 0]);

    this.topHeader = new cmNodeListTopHeader(this.topHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.topHeader.setGridPosition([1, 0]);

    this.leftHeader = new cmNodeListLeftHeader(this.leftHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.leftHeader.setGridPosition([0, 1]);

    this.matrix = new cmNodeListView(this.matrixGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.matrix.setGridPosition([1, 1]);

    this.topDiv
      .classed("node-list-top-row", true);

    this.matrices = [this.topHeader, this.leftHeader, this.controlsHeader, this.matrix];

    this.updateElementPositions();

    if (!model.getIntermediateNodeIndexes().length) {
      this.setWarningMessageVisible(true);
    }

    this.matrices.forEach(function (matrix) {
      if (matrix.isActive) {
        matrix.onSortRowsByAttribute("num paths", false)
      }
    });
  }

  setModel(model) {
    if (model.getIntermediateNodeIndexes().length) {
      this.setWarningMessageVisible(false);
      super.setModel(model);
    } else {
      this.setWarningMessageVisible(true);
    }
  }

  setWarningMessageVisible(visible) {
    if (visible) {
      this.element.select("#intermediate-nodes-warning")
        .html("Found no intermediate nodes. All paths must be one hop.")
        .style("display", "block");

      this.element.select(".matrix-view-bottom-row")
        .style("display", "none");

      this.element.select(".node-list-top-row")
        .style("display", "none");
    } else {
      this.element.select("#intermediate-nodes-warning")
        .style("display", "none");

      this.element.selectAll(".matrix-view-bottom-row")
        .style("display", "block");

      this.element.selectAll(".node-list-top-row")
        .style("display", "block");
    }
  }
}


