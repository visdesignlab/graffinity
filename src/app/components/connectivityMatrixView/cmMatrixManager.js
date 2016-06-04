import {cmMatrixView} from "./cmMatrixView"
import {cmMatrixTopHeader} from "./cmMatrixTopHeader"
import {cmControlsMatrix} from "./cmControlsMatrix"
import {cmMatrixLeftHeader} from "./cmMatrixLeftHeader"

export class cmMatrixManager {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    this.$log = $log;
    this.element = element;
    this.topHeaderLabelRowHeight = 25;

    this.controlsElementStyle = {};

    this.topHeaderElementStyle = {
      width: "768px",
      height: "50px"
    };

    this.matrixElementStyle = {
      width: "50px",
      height: "600px"
    };

    this.leftHeaderElementStyle = {
      width: "50px",
      height: "200px"
    };

    this.controlsHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-controls")
      .classed("matrix-view-header-controls", true);

    this.topHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-top")
      .classed("matrix-view-header-top", true);

    this.bottomDiv = element.append("div");
    this.leftHeaderElement = this.bottomDiv.append("div")
      .attr("id", "matrix-view-header-left")
      .classed("matrix-view-header-left", true);
    //
    this.matrixElement = this.bottomDiv.append("div")
      .classed("matrix-view-center", true)
      .on("scroll", function () {
        let left = angular.element(this).scrollLeft();
        let top = angular.element(this).scrollTop();
        angular.element("#matrix-view-header-top").scrollLeft(left);
        angular.element("#matrix-view-header-left").scrollTop(top);
      });

    this.topHeaderSvg = this.topHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.matrixSvg = this.matrixElement.append("svg")
      .attr({width: 1024, height: 1024});
    //
    this.leftHeaderSvg = this.leftHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});
    //
    this.controlsHeaderSvg = this.controlsHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});


    this.topHeader = new cmMatrixTopHeader(this.topHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.topHeaderElementStyle.height = this.topHeader.getHeight() + "px";
    this.leftHeader = new cmMatrixLeftHeader(this.leftHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.controlsHeader = new cmControlsMatrix(this.controlsHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.matrix = new cmMatrixView(this.matrixSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);

    this.matrices = [this.topHeader, this.leftHeader, this.controlsHeader, this.matrix];

    this.updateElementPositions();

    this.$scope = scope;
    this.$scope.$on("changeMatrixHeight", this.updateElementPositions.bind(this));

    console.log(angular.element(element)[0][0].clientHeight);
  }

  getMajorRowsAndColsAsScalarMatrix() {
    return this.matrix.getMajorRowsAndColsAsScalarMatrix();
  }

  setUseAnimation(useAnimation) {
    for (let i = 0; i < this.matrices.length; ++i) {
      this.matrices[i].setUseAnimation(useAnimation);
    }
  }

  setSortOrders(rowPerm, colPerm) {
    for (let i = 0; i < this.matrices.length; ++i) {
      this.matrices[i].setSortOrders(rowPerm, colPerm);
    }
  }

  setModel(model) {
    for (let i = 0; i < this.matrices.length; ++i) {
      this.matrices[i].setModel(model);
    }

    this.updateElementPositions();
  }

  updateElementPositions() {
    this.topHeaderElementStyle.height = this.topHeader.getHeight() + 5 + "px";
    this.controlsElementStyle.width = this.controlsHeader.getAttributeColWidths() + 5 + "px";
    this.controlsElementStyle.height = this.controlsHeader.getHeight() + 5 + "px";
    this.leftHeaderElementStyle.width = this.controlsElementStyle.width;
    this.matrixElementStyle.height = angular.element(this.element)[0][0].clientHeight - this.controlsHeader.getHeight() + 5 + "px";
    this.leftHeaderElementStyle.height = angular.element(this.element)[0][0].clientHeight - this.controlsHeader.getHeight() + 5 + "px";
    this.matrixElementStyle.width = this.topHeaderElementStyle.width;


    this.matrixSvg.attr("width", this.matrix.getWidth());
    this.matrixSvg.attr("height", this.matrix.getHeight());
    this.controlsHeaderElement.transition().duration(500).style(this.controlsElementStyle);
    this.topHeaderElement.transition().duration(500).style(this.topHeaderElementStyle);
    this.leftHeaderElement.transition().duration(500).style(this.leftHeaderElementStyle);
    this.matrixElement.transition().duration(500).style(this.matrixElementStyle);
  }

}


