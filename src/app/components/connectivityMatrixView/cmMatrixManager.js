import {cmMatrixView} from "./cmMatrixView"
import {cmMatrixTopHeader} from "./cmMatrixTopHeader"
import {cmControlsMatrix} from "./cmControlsMatrix"
import {cmMatrixLeftHeader} from "./cmMatrixLeftHeader"

export class cmMatrixManager {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    this.$log = $log;
    this.topHeaderLabelRowHeight = 25;

    this.controlsElementStyle = {};

    this.topHeaderElementStyle = {
      width: "768px",
      height: "50px"
    };

    this.matrixElementStyle = {
      width: "768px",
      height: "600px"
    };

    this.leftHeaderElementStyle = {
      width: "50px",
      height: (parseInt(this.matrixElementStyle.height) + this.topHeaderLabelRowHeight) + "px"
    };

    this.controlsHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-controls")
      .classed("matrix-view-header-controls", true);

    this.topHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-top")
      .classed("matrix-view-header-top", true);

    //
    this.leftHeaderElement = element.append("div")
      .attr("id", "matrix-view-header-left")
      .classed("matrix-view-header-left", true);
    //
    //this.matrixElement = element.append("div")
    //  .classed("matrix-view-center", true)
    //  .on("scroll", function () {
    //    let left = angular.element(this).scrollLeft();
    //    let top = angular.element(this).scrollTop();
    //    angular.element("#matrix-view-header-top").scrollLeft(left);
    //    angular.element("#matrix-view-header-left").scrollTop(top);
    //  });

    this.topHeaderSvg = this.topHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    //this.matrixSvg = this.matrixElement.append("svg")
    //  .attr({width: 1024, height: 1024});
    //
    this.leftHeaderSvg = this.leftHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});
    //
    this.controlsHeaderSvg = this.controlsHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});


    //this.matrix = new cmMatrixView(this.matrixSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.topHeader = new cmMatrixTopHeader(this.topHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.topHeader.manager = this;
    this.topHeaderElementStyle.height = this.topHeader.getHeight() + "px";
    this.leftHeader = new cmMatrixLeftHeader(this.leftHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.controlsHeader = new cmControlsMatrix(this.controlsHeaderSvg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.updateElementPositions();

    this.$scope = scope;
    this.$scope.$on("changeMatrixHeight", this.updateElementPositions.bind(this));
  }

  updateElementPositions() {
    this.$log.debug("updating positions");
    this.topHeaderElementStyle.height = this.topHeader.getHeight() + 5 + "px";
    this.controlsElementStyle.width = this.controlsHeader.getAttributeColWidths() + 5 + "px";
    this.controlsElementStyle.height = this.controlsHeader.getHeight() + 5 + "px";
    this.leftHeaderElementStyle.width = this.controlsElementStyle.width;
    this.controlsHeaderElement.transition().duration(500).style(this.controlsElementStyle);
    this.topHeaderElement.transition().duration(500).style(this.topHeaderElementStyle);
    this.leftHeaderElement.style(this.leftHeaderElementStyle);
    //this.matrixElement.transition().duration(500).style(this.matrixElementStyle);
  }

}


