/* global d3
 */
import {cmMatrixRow} from "./cmMatrixRow"

export class cmLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCols = this.getNumMajorCols();
    for (var i = 0; i < numMajorCols; ++i) {
      var group = this.getMajorCol(i).getD3Group();

      if (!this.isHeaderCol(i) && colNodeIndexes[i - numHeaderCols].length > 1) {
        group
          .append("circle")
          .attr("cy", 5)
          .attr("cx", 5)
          .attr("r", 4)
          .attr("fill", "red");
      }
    }
    this.createMinorCols(numHeaderCols, colNodeIndexes);
    this.colNodeIndexes = colNodeIndexes;
  }
}
