/* global
 */
import {cmMatrixRow} from "./cmMatrixRow"

export class cmEditAttributeRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, areColsCollapsed, matrix) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, false, matrix);
    this.unrollControls = [];
    this.rollupControls = [];

    let numMajorCells = this.getNumMajorCells();
    for (var i = 0; i < numMajorCells; ++i) {
      var group = this.getMajorCell(i).getGroup();
      this.unrollControls[i] = group.append("g");
      if (this.matrix.isLabelCell(i)) {
        this.majorCells[i].isEditAttributeCell = true;
        let data = {
          isVertical: true
        };
        this.majorCells[i].setData(data);
      }
    }
  }
}
