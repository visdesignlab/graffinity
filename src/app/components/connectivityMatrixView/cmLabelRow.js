/* global d3
 */
import {cmMatrixRow} from "./cmMatrixRow"

export class cmLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    for (var i = 0; i < numMajorCells; ++i) {
      var group = this.getMajorCell(i).getGroup();
      let dataIndex = this.getDataColIndex(i);
      if (!this.isHeaderCell(i) && colNodeIndexes[dataIndex].length > 1) {
        group.append("circle")
          .attr("cy", 5)
          .attr("cx", 5)
          .attr("r", 4)
          .attr("fill", "red");
      }
    }
    this.createMinorCells(numHeaderCols, colNodeIndexes);
    this.colNodeIndexes = colNodeIndexes;
  }
}
