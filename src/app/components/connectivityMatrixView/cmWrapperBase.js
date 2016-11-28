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

    // Container for entire matrix.
    this.wrapperDiv = element.append("div")
      .classed("vflex", true);

    // Top row will hold controls and column headers.
    this.topDiv = this.wrapperDiv.append("div")
      .classed("matrix-row", true)
      .classed("matrix-row-top", true);

    this.controlsHeaderElement = this.topDiv.append("div")
      .attr("id", name + "-header-controls")
      .classed("matrix-element", true);

    this.topHeaderElement = this.topDiv.append("div")
      .attr("id", name + "-header-top")
      .classed("matrix-element", true)
      .classed("matrix-element-top-right", true);

    // Bottom row will hold row headers nad matrix
    this.bottomDiv = this.wrapperDiv.append("div")
      .classed("matrix-row", true);

    // Bottom left
    this.leftHeaderElement = this.bottomDiv.append("div")
      .attr("id", name + "-header-left")
      .classed("matrix-element-bottom-left", true);

    // The matrix's scrolling will be connected with the headers.
    this.matrixElement = this.bottomDiv.append("div")
      .classed("matrix-element-bottom-right", true)
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
          .attr("use-linear-color-scale", "main.colorScaleService.useLinear[2]")
          .attr("color-scale-index", "main.matrixManager.matrix.colorScaleIndexSets")
          .attr("metric", "main.ui.nodeListScaleName")
          .attr("values", "main.nodeListManager.matrix.colorScalesValues[0]")
          .attr("ng-show", "main.ui.selectedNodeListEncoding.name == 'colormap'")[0][0];

      } else {

        this.colors[0] = this.legendDiv.append("adjustable-color-scale-directive")
          .classed("matrix-view-legend-container", true)
          .attr("ng-show", "main.ui.selectedMatrixEncoding.name == 'colormap'")
          .attr("use-linear-color-scale", "main.colorScaleService.useLinear[0]")
          .attr("color-scale", "main.matrixManager.matrix.colorScales[0]")
          .attr("color-scale-index", "main.matrixManager.matrix.colorScaleIndexSets")
          .attr("metric", "main.ui.primaryScaleName + main.ui.selectedMatrixMetric.name")
          .attr("values", "main.matrixManager.matrix.colorScalesValues[0]")[0][0];

        this.colors[1] = this.legendDiv.append("adjustable-color-scale-directive")
          .classed("matrix-view-legend-container", true)
          .attr("ng-show", "main.matrixManager.matrix.hasSecondLegend && main.ui.selectedMatrixEncoding.name == 'colormap'")
          .attr("use-linear-color-scale", "main.colorScaleService.useLinear[1]")
          .attr("color-scale-index", "main.matrixManager.matrix.colorScaleIndexNodes")
          .attr("color-scale", "main.matrixManager.matrix.colorScales[1]")
          .attr("metric", "main.ui.secondaryScaleName + main.ui.selectedMatrixMetric.name")
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
    let duration = useAnimation ? 500 : 0;

    let topRowHeight = this.controlsHeader.getHeight();
    let topLeftWidth = this.controlsHeader.getWidth();

    let topRightWidth = this.matrix.getWidth();
    let bottomRowHeight = this.matrix.getHeight();

    this.controlsHeaderSvg.transition()
      .duration(duration)
      .attr({
        width: topLeftWidth,
        height: topRowHeight
      });

    this.topHeaderSvg.transition()
      .duration(duration)
      .attr({
        width: topRightWidth,
        height: topRowHeight
      });

    this.leftHeaderSvg.transition()
      .duration(duration)
      .attr({
        width: topLeftWidth,
        height: bottomRowHeight
      });

    this.matrixSvg.transition()
      .duration(duration)
      .attr({
        width: topRightWidth,
        height: bottomRowHeight
      });

  }
}


