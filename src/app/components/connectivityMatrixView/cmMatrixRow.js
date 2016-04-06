/*global d3
*/
import {SvgGroupElement} from "./svgGroupElement"

export class cmMatrixRow extends SvgGroupElement {
  constructor(svg, rowIndex, numCols, numHeaderCols, colWidth, rowHeight) {

    var group = svg.append("g")
      .attr("data-major-row", rowIndex);

    super(group);

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

  getNumMajorCols() {
    return this.majorCols.length;
  }

  getMajorCol(i) {
    return this.majorCols[i];
  }

  getMajorColIndex(group) {
    return group.attr("data-major-col");
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
