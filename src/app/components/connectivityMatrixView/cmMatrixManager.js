import {cmMatrixView} from "./cmMatrixView"
export class cmMatrixManager {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController) {

    this.topHeaderLabelRowHeight = 25;
    this.topHeaderElementStyle = {
      width: "512px",
      height: "50px",
      left: "50px"
    };

    this.matrixElementStyle = {
      width: "512px",
      height: "512px",
      top: "-" + this.topHeaderLabelRowHeight + "px"
    };

    this.leftHeaderElementStyle = {
      width: "50px",
      height: (parseInt(this.matrixElementStyle.height) + this.topHeaderLabelRowHeight) + "px",
      top: "-25px"
    };

    this.topHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-top")
      .classed("matrix-view-header-top", true);

    this.leftHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-left")
      .classed("matrix-view-header-left", true);

    this.matrixElement = element.append("div")
      .classed("matrix-view-center", true)
      .on("scroll", function () {
        let left = $(this).scrollLeft();
        let top = $(this).scrollTop();
        $("#matrix-view-header-top").scrollLeft(left);
        $("#matrix-view-header-left").scrollTop(top);
      });

    this.topHeaderSvg = this.topHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.matrixSvg = this.matrixElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.leftHeaderSvg = this.leftHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.matrix = new cmMatrixView(this.matrixSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.topHeader = new cmMatrixView(this.topHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.leftHeader = new cmMatrixView(this.leftHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.updateElementPositions();
  }

  updateElementPositions() {
    this.topHeaderElement.style(this.topHeaderElementStyle);
    this.leftHeaderElement.style(this.leftHeaderElementStyle);
    this.matrixElement.style(this.matrixElementStyle);
  }

  setMatrixModel(model) {

  }

}


