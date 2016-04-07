/*global d3
 */
import {SvgGroupElement} from "./svgGroupElement"

export class cmMatrixRow extends SvgGroupElement {
  constructor(svg, rowIndex, numCols, numHeaderCols, colWidth, rowHeight, isMinorRow) {

    let group = null;
    if (!isMinorRow) {
      group = svg.append("g")
        .attr("data-major-row", rowIndex);
    } else {
      group = svg.append("g")
        .attr("data-minor-row", rowIndex);
    }

    super(group);
    this.currentHeight = rowHeight;
    if (!isMinorRow) {
      this.minorRowContainer = group.append("g")
        .attr("data-minor-row-container", rowIndex);
      this.minorRows = [];
    }
    this.rowIndex = rowIndex;
    this.majorCols = [];
    this.numHeaderCols = numHeaderCols;
    let totalNumCols = numCols + numHeaderCols;
    for (var i = 0; i < totalNumCols; ++i) {
      this.majorCols[i] = group.append("g")
        .attr("data-major-col", i)
        .attr("transform", "translate(" + (colWidth * i) + ",0)");

      this.majorCols[i].append("rect")
        .attr("data-debug", true)
        .attr("width", colWidth)
        .attr("height", rowHeight)
        .attr("stroke", "#444")
        .attr("fill", "none");
    }
  }

  addMinorRow(matrixRow) {
    this.minorRows.push(matrixRow);
  }

  createControlsCol(colWidth, rowHeight, callback) {
    let col = this.getMajorCol(0);
    var self = this;
    this.unrollRowCallback = callback;

    this.unrollControls = col.append("g");

    this.unrollControls.append("text")
      .text("+")
      .style("text-anchor", "start")
      .style("dominant-baseline", "hanging");

    this.unrollControls
      .append("rect")
      .attr("width", colWidth)
      .attr("height", rowHeight)
      .style("fill", "transparent")
      .on("click", function () {
        self.onUnrollRowClicked();
      });

    this.rollupControls = col.append("g");
    this.rollupControls.append("text")
      .text("-")
      .style("text-anchor", "start")
      .style("dominant-baseline", "hanging");

    this.rollupControls.append("rect")
      .attr("width", colWidth)
      .attr("height", rowHeight)
      .style("fill", "transparent")
      .on("click", function () {
        self.onRollupRowClicked();
      });

    this.rollupControls.style("display", "none");

  }

  getCurrentHeight() {
    return this.currentHeight;
  }

  getNumMajorCols() {
    return this.majorCols.length;
  }

  getNumMinorRows() {
    return this.minorRows.length;
  }

  getMajorCol(i) {
    return this.majorCols[i];
  }

  getMajorColIndex(group) {
    return group.attr("data-major-col");
  }

  isHeaderCol(colIndex) {
    return colIndex < this.numHeaderCols;
  }

  onRollupRowClicked() {
    this.unrollControls.style("display", "block");
    this.rollupControls.style("display", "none");
    this.currentHeight = this.currentHeight / this.getNumMinorRows();
    this.unrollRowCallback(this.rowIndex);
  }

  onUnrollRowClicked() {
    this.unrollControls.style("display", "none");
    this.rollupControls.style("display", "block");
    this.currentHeight = this.currentHeight * this.getNumMinorRows();
    this.unrollRowCallback(this.rowIndex);
  }

  setColWidths(colWidths) {
    let numColumns = colWidths.length;
    let xPosition = 0;
    for (var i = 0; i < numColumns; ++i) {
      this.majorCols[i].transition().duration(500).attr("transform", "translate(" + xPosition + ",0)");
      xPosition += colWidths[i];
    }
  }

  setDebugVisible(visible) {
    var children = this.group.selectAll("*");
    children = children.filter(function () {
      return d3.select(this).attr("data-debug");
    });
    children.style("display", visible ? "block" : "none");
  }
}
