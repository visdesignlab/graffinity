import {cmMatrixRow} from "./cmMatrixRow"

export class cmAttributeRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, modelRow, label, minorLabels) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow);
    for(var i=0; i<this.majorCells.length; ++i) {
      if (!this.isHeaderCell(i)) {
        this.majorCells[i].getGroup().append("rect")
        .attr("width", 10)
        .attr("height", rowHeight);
      }
    }
  }
}
