export class cmWrapperBase {

  constructor(element, $log, scope, mainController, name, $compile) {
    this.$log = $log;
    this.$scope = scope;
    this.element = element;
    this.mainController = mainController;
    this.matrices = [];
    this.useAnimation = true;
    this.$compile = $compile;
    let self = this;
    this.$scope.$on("changeMatrixHeight", function () {
      self.updateElementPositions(null, null, self.useAnimation);
    });

    this.$scope.$on("setSortOrders", function (signal, rowPerm, colPerm) {
      self.setSortOrders(rowPerm, colPerm);
    });

    this.maxHeight = this.element[0][0].clientHeight;

    // Style for the four divs displayed in this matrix.
    this.controlsElementStyle = {};
    this.topHeaderElementStyle = {};
    this.leftHeaderElementStyle = {};
    this.matrixElementStyle = {};

    // Top row will hold controls and column headers.
    this.topDiv = element.append("div")
      .style("overflow", "hidden");

    this.controlsHeaderElement = this.topDiv.append("div")
      .attr("id", name + "-header-controls")
      .classed("matrix-view-header-controls", true);

    this.topHeaderElement = this.topDiv.append("div")
      .attr("id", name + "-header-top")
      .classed("matrix-view-header-top", true);

    // Bottom row will hold row headers nad matrix
    this.bottomDiv = element.append("div")
      .style("overflow", "hidden")
      .classed("matrix-view-bottom-row", true);

    this.leftHeaderElement = this.bottomDiv.append("div")
      .attr("id", name + "-header-left")
      .classed("matrix-view-header-left", true);

    // The matrix's scrolling will be connected with the headers.
    this.matrixElement = this.bottomDiv.append("div")
      .classed("matrix-view-center", true)
      .on("scroll", function () {
        let left = angular.element(this).scrollLeft();
        let top = angular.element(this).scrollTop();
        angular.element("#" + name + "-header-top").scrollLeft(left);
        angular.element("#" + name + "-header-left").scrollTop(top);
      });

    this.controlsHeaderSvg = this.controlsHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.controlsHeaderGroup = this.controlsHeaderSvg.append("g");

    this.topHeaderSvg = this.topHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.topHeaderGroup = this.topHeaderSvg.append("g");

    this.leftHeaderSvg = this.leftHeaderElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.leftHeaderGroup = this.leftHeaderSvg.append("g");

    this.matrixSvg = this.matrixElement.append("svg")
      .attr({width: 1024, height: 1024});

    this.matrixGroup = this.matrixSvg.append("g");


    this.mainController.$timeout(function () {
      this.legendDiv = this.element.append("div")
        .classed("matrix-view-legend-container", true);
      this.colors = [];
      if (name == "node-list") {

        this.colors[0] = this.legendDiv.append("adjustable-color-scale-directive")
          .attr("color-scale", "main.nodeListManager.matrix.colorScales[0]")
          .attr("color-scale-index", "main.matrixManager.matrix.colorScaleIndexSets")
          .attr("values", "main.nodeListManager.matrix.colorScalesValues[0]")[0][0];

      } else {
        this.colors[0] = this.legendDiv.append("adjustable-color-scale-directive")
          .classed("matrix-view-legend-container", true)
          .attr("color-scale", "main.matrixManager.matrix.colorScales[0]")
          .attr("color-scale-index", "main.matrixManager.matrix.colorScaleIndexSets")
          .attr("values", "main.matrixManager.matrix.colorScalesValues[0]")[0][0];

        this.colors[1] = this.legendDiv.append("adjustable-color-scale-directive")
          .classed("matrix-view-legend-container", true)
          .attr("ng-show", "main.matrixManager.matrix.hasSecondLegend")
          .attr("color-scale-index", "main.matrixManager.matrix.colorScaleIndexNodes")
          .attr("color-scale", "main.matrixManager.matrix.colorScales[1]")
          .attr("values", "main.matrixManager.matrix.colorScalesValues[1]")[0][0];


      }
      for (let i = 0; i < this.colors.length; ++i) {
        this.$compile(this.colors[i])(scope);
      }
    }.bind(this));
  }

  setUseAnimation(useAnimation) {
    this.useAnimation = useAnimation;
    for (let i = 0; i < this.matrices.length; ++i) {
      this.matrices[i].setUseAnimation(useAnimation);
    }
  }

  setSortOrders(rowPerm, colPerm) {

    for (let i = 0; i < this.matrices.length; ++i) {
      this.matrices[i].resetSortState(true, true);
      this.matrices[i].setSortOrders(rowPerm, colPerm);
    }
  }

  setWidth(width) {
    this.updateElementPositions(null, width, true)
  }

  setModel(model) {

    for (let i = 0; i < this.matrices.length; ++i) {

      // matrix.setModel creates a bunch of rows
      this.matrices[i].setModel(model);
      this.matrices[i].setPosition(1, 1);

      // Set position of matrix rows without animation
      this.matrices[i].setUseAnimation(false);
      this.matrices[i].updatePositions(this.matrices[i].rowPerm, this.matrices[i].colPerm);
      this.matrices[i].setUseAnimation(true);
    }

    this.updateElementPositions();
  }

  /**
   * Positions and resizes the 4 divs holding different parts of the matrices.
   */
  updateElementPositions(signal, width, useAnimation) {

    let padding = 2;

    // Do not check for overflow of header height. Assume we always have enough space for it.
    this.topHeaderElementStyle.height = this.topHeader.getHeight() + padding + "px";
    this.controlsElementStyle.height = this.topHeaderElementStyle.height;

    // Again, not checking for overflow of left-header width.
    this.controlsElementStyle.width = this.controlsHeader.getAttributeColWidths() + padding + "px";
    this.leftHeaderElementStyle.width = this.controlsElementStyle.width;

    // Bound the matrix's height by screen size.
    let matrixHeight = this.matrix.getHeight() + 30;
    let clientHeight = this.maxHeight - this.controlsHeader.getHeight();
    if (matrixHeight > clientHeight) {
      matrixHeight = clientHeight;
    }

    this.matrixElementStyle.height = matrixHeight + padding + "px";
    this.leftHeaderElementStyle.height = matrixHeight + padding + "px";

    // Bound matrix's width by screen size.
    let matrixWidth, clientWidth;
    if (!width) {
      matrixWidth = this.matrix.getWidth() + 50;
      clientWidth = angular.element(this.element)[0][0].clientWidth - this.controlsHeader.getAttributeColWidths() - 100;
      if (matrixWidth > clientWidth) {
        matrixWidth = clientWidth;
      }
    } else {
      matrixWidth = width - this.controlsHeader.getAttributeColWidths() - 250;
    }

    this.matrixElementStyle.width = matrixWidth + padding + "px";
    this.topHeaderElementStyle.width = matrixWidth + padding + "px";
    let duration = useAnimation ? 500 : 0;

    // The matrix'x svg needs to be large enough to hold everything.
    this.matrixSvg.transition()
      .duration(duration).attr({
      width: Math.max(this.matrix.getWidth() + padding, 50),
      height: this.matrix.getHeight() + padding
    });

    this.leftHeaderSvg.transition()
      .duration(duration).attr({
      height: this.matrix.getHeight() + padding
    });

    this.topHeaderSvg.transition()
      .duration(duration).attr({
      width: Math.max(this.matrix.getWidth() + padding, 50)
    });

    // The divs need to expand/collapse depending on matrix size.
    this.controlsHeaderElement.transition()
      .duration(duration)
      .style(this.controlsElementStyle);

    this.topHeaderElement.transition()
      .duration(duration)
      .style(this.topHeaderElementStyle);

    this.leftHeaderElement.transition()
      .duration(duration)
      .style(this.leftHeaderElementStyle);

    this.matrixElement.transition()
      .duration(duration)
      .style(this.matrixElementStyle);

  }
}


