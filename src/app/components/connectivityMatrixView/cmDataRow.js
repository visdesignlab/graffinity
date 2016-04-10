import {cmMatrixRow} from "./cmMatrixRow"

export class cmDataRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, modelRow) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow);

    if (!isMinorRow) {
      let numChildren = modelRow.getNumChildren();
      if (numChildren > 0) {

        let minorRow = new cmDataRow(this.minorRowContainer, 0, colNodeIndexes, numHeaderCols, colWidth, rowHeight,
          true, modelRow);
        minorRow.setVisible(false);
        this.addMinorRow(minorRow);

        for (var i = 0; i < numChildren; ++i) {
          minorRow = new cmDataRow(this.minorRowContainer, i+1,  colNodeIndexes, numHeaderCols, colWidth, rowHeight, true,
            modelRow.getChildRowAt(i));
          minorRow.setVisible(false);
          this.addMinorRow(minorRow);
        }
      }
    }

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    for (i = 0; i < numMajorCells; ++i) {
      this.majorCells[i].isDataCell = true;
    }

    this.createMinorCells(numHeaderCols, colNodeIndexes, true);

    for (i = 0; i < numMajorCells; ++i) {
      if (!this.isHeaderCell(i)) {
        let dataIndex = this.getDataColIndex(i);
        let data = {
          colNodeIndexes: colNodeIndexes[dataIndex],
          modelRow: modelRow
        };

        this.majorCells[i].setData(data);
        if (this.majorCells[i].minorCells.length != colNodeIndexes[dataIndex].length) {
          console.error("something fucked up");
        }

        for (var j = 0; j < this.majorCells[i].minorCells.length; ++j) {
          let data = {
            colNodeIndexes: colNodeIndexes[dataIndex][j],
            modelRow: modelRow
          };
          this.majorCells[i].minorCells[j].setData(data);
        }

      }
    }
  }
}
