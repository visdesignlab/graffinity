/* global d3
 */
import {cmMatrixRow} from "./cmMatrixRow"

export class cmDataRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, modelRow) {
    super(svg, rowIndex, colNodeIndexes.length, numHeaderCols, colWidth, rowHeight, isMinorRow);

    if (!isMinorRow) {
      let numChildren = modelRow.getNumChildren();
      let minorRow = new cmDataRow(this.minorRowContainer, 0, colNodeIndexes, numHeaderCols, colWidth, rowHeight, true, modelRow);
      minorRow.setVisible(false);
      this.addMinorRow(minorRow);
      for (var i = 1; i <= numChildren; ++i) {
        minorRow = new cmDataRow(this.minorRowContainer, i, colNodeIndexes, numHeaderCols, colWidth, rowHeight, true, modelRow.getChildRowAt(i));
        minorRow.setVisible(false);
        this.addMinorRow(minorRow);
      }
    }

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCols = this.getNumMajorCols();
    for (i = 0; i < numMajorCols; ++i) {
      var group = this.getMajorCol(i);
      if (!this.isHeaderCol(i)) {
        group.append("rect")
          .attr("width", colWidth)
          .attr("height", rowHeight);
      }
    }
  }
}
