import {cmMatrixView} from "./cmMatrixView"
import {cmMatrixTopHeader} from "./cmMatrixTopHeader"
import {cmNodeListControls} from "./nodeList/cmNodeListControls"
import {cmNodeListMatrix} from "./nodeList/cmNodeListMatrix"
import {cmNodeListLeftHeader} from "./nodeList/cmNodeListLeftHeader"
export class cmNodeListManager {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    this.$log = $log;
    this.$scope = scope;
    this.element = element;

    // Style for the four divs displayed in this matrix.
    this.controlsElementStyle = {};
    this.topHeaderElementStyle = {"display": "none"};
    this.leftHeaderElementStyle = {};
    this.matrixElementStyle = {"display": "none"};

    // Top row will hold controls and column headers.
    this.topDiv = element.append("div")
      .style("overflow", "hidden");

    this.controlsHeaderElement = this.topDiv.append("div")
      .attr("id", "node-list-header-controls")
      .classed("matrix-view-header-controls", true);

    this.topHeaderElement = this.topDiv.append("div")
      .attr("id", "node-list-view-header-top")
      .classed("matrix-view-header-top", true);

    // Bottom row will hold row headers nad matrix
    this.bottomDiv = element.append("div")
      .style("overflow", "hidden");

    this.leftHeaderElement = this.bottomDiv.append("div")
      .attr("id", "node-list-view-header-left")
      .classed("matrix-view-header-left", true);

    // The matrix's scrolling will be connected with the headers.
    this.matrixElement = this.bottomDiv.append("div")
      .classed("matrix-view-center", true)
      .on("scroll", function () {
        let left = angular.element(this).scrollLeft();
        let top = angular.element(this).scrollTop();
        angular.element("#node-list-view-header-top").scrollLeft(left);
        angular.element("#node-list-view-header-left").scrollTop(top);
      });

    this.controlsHeaderSvg = this.controlsHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.topHeaderSvg = this.topHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.leftHeaderSvg = this.leftHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.matrixSvg = this.matrixElement.append("svg")
      .attr({width: 1024, height: 1024});


    this.controlsHeader = new cmNodeListControls(this.controlsHeaderSvg, model, $log, $uibModal, scope, viewState,
      modalService, mainController);

    //this.topHeader = new cmMatrixTopHeader(this.topHeaderSvg, model, $log, $uibModal, scope, viewState,
    //  modalService, mainController);

    this.leftHeader = new cmNodeListLeftHeader(this.leftHeaderSvg, model, $log, $uibModal, scope, viewState,
      modalService, mainController);

    //this.matrix = new cmMatrixView(this.matrixSvg, model, $log, $uibModal, scope, viewState,
    //  modalService, mainController);

    //this.matrices = [this.topHeader, this.leftHeader, this.controlsHeader, this.matrix];
    this.matrices = [this.leftHeader, this.controlsHeader];
    this.updateElementPositions();

    this.$scope.$on("changeMatrixHeight", this.updateElementPositions.bind(this));
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

  setWidth(width) {
    this.updateElementPositions(null, width)
  }

  /**
   * Positions and resizes the 4 divs holding different parts of the matrices.
   */
  updateElementPositions(signal, width) {
    // Do not check for overflow of header height. Assume we always have enough space for it.
    this.topHeaderElementStyle.height = this.controlsHeader.getHeight() + 5 + "px";
    this.controlsElementStyle.height = this.topHeaderElementStyle.height;

    // Again, not checking for overflow of left-header width.
    this.controlsElementStyle.width = this.controlsHeader.getAttributeColWidths() + 5 + "px";
    this.leftHeaderElementStyle.width = this.controlsElementStyle.width;

    // Bound the matrix's height by screen size.
    let matrixHeight = this.leftHeader.getHeight() + 30;
    let clientHeight = angular.element(this.element)[0][0].clientHeight - this.controlsHeader.getHeight() - 50;
    if (matrixHeight > clientHeight) {
      matrixHeight = clientHeight;
    }

    this.matrixElementStyle.height = matrixHeight + "px";
    this.leftHeaderElementStyle.height = matrixHeight + "px";

    // Bound matrix's width by screen size.
    let matrixWidth, clientWidth;
    if (!width) {
      matrixWidth = this.leftHeader.getWidth() + 30;
      clientWidth = angular.element(this.element)[0][0].clientWidth - this.controlsHeader.getAttributeColWidths() - 100;
      if (matrixWidth > clientWidth) {
        matrixWidth = clientWidth;
      }
    } else {
      matrixWidth = width - this.controlsHeader.getAttributeColWidths() - 40;
    }

    this.matrixElementStyle.width = matrixWidth + "px";
    this.topHeaderElementStyle.width = matrixWidth + "px";

    // The matrix'x svg needs to be large enough to hold everything.
    this.matrixSvg.transition()
      .duration(500).attr({
      width: this.leftHeader.getWidth(),
      height: this.leftHeader.getHeight()
    });

    // The divs need to expand/collapse depending on matrix size.
    this.controlsHeaderElement.transition()
      .duration(500)
      .style(this.controlsElementStyle);

    this.topHeaderElement.transition()
      .duration(500)
      .style(this.topHeaderElementStyle);

    this.leftHeaderElement.transition()
      .duration(500)
      .style(this.leftHeaderElementStyle);

    this.matrixElement.transition()
      .duration(500)
      .style(this.matrixElementStyle);
  }

}


