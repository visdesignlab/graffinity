/* global d3
 */
import {cmMatrixRow} from "./cmMatrixRow"

export class cmControlRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight) {
    super(svg, rowIndex, colNodeIndexes.length, numHeaderCols, colWidth, rowHeight);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCols = this.getNumMajorCols();
    for (var i = 0; i < numMajorCols; ++i) {
      var group = this.getMajorCol(i);
      this.unrollControls[i] = group.append("g");

      if (i >= numHeaderCols) {
        var self = this;
        this.unrollControls[i].append("text")
          .text("+")
          .style("text-anchor", "start")
          .style("dominant-baseline", "hanging");

        this.unrollControls[i].append("rect")
          .attr("width", colWidth)
          .attr("height", rowHeight)
          .style("fill", "transparent")
          .on("click", function () {
            self.onUnrollColClicked(d3.select(this.parentNode.parentNode));
          });

        this.rollupControls[i] = group.append("g")
          .style("display", "none");

        this.rollupControls[i]
          .append("text")
          .text("-")
          .style("text-anchor", "start")
          .style("dominant-baseline", "hanging");

        this.rollupControls[i].append("rect")
          .attr("width", colWidth)
          .attr("height", rowHeight)
          .style("fill", "transparent")
          .on("click", function () {
            self.onRollupColClicked(d3.select(this.parentNode.parentNode));
          });
      }
    }

    this.colNodeIndexes = colNodeIndexes;
  }

  onUnrollColClicked(majorCol) {
    var colIndex = this.getMajorColIndex(majorCol);
    this.unrollControls[colIndex].style("display", "none");
    this.rollupControls[colIndex].style("display", "block");
    this.colClickedCallback(colIndex, true);
  }

  onRollupColClicked(majorCol) {
    var colIndex = this.getMajorColIndex(majorCol);
    this.unrollControls[colIndex].style("display", "block");
    this.rollupControls[colIndex].style("display", "none");
    this.colClickedCallback(colIndex, false);
  }

  setColClickCallback(callback) {
    this.colClickedCallback = callback;
  }
}
