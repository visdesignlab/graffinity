import {cmMatrixRow} from "./cmMatrixRow"

export class cmAttributeRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, colNodeAttributes,
              matrix, attributeIndex, attributeLabel) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, matrix);

    this.createMinorCells(numHeaderCols, colNodeIndexes, false);

    for (var i = 0; i < this.majorCells.length; ++i) {
      let data = {};
      if(this.matrix.isLabelCell(i)) {
        let data = {
            orientation: 1,
            attributeIndex: attributeIndex
        };
        this.majorCells[i].setData(data);
      } else if (this.matrix.isDataCell(i)) {
          let colIndex = this.getDataColIndex(i);
          let data = {
            values: colNodeAttributes[colIndex],
            orientation: 1,
            attributeIndex: attributeIndex
          };
          this.majorCells[i].isAttributeCell = true;
          this.majorCells[i].setData(data);
          for (var j = 0; j < colNodeIndexes[colIndex].length; ++j) {
            let data = {
              values: [colNodeAttributes[colIndex][j]],
              orientation: 1,
              attributeIndex: attributeIndex
            };
            this.majorCells[i].minorCells[j].isAttributeCell = true;
            this.majorCells[i].minorCells[j].setData(data);
          }
        }
      }
    }

}
