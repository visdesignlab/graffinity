import {cmMatrixRow} from "./cmMatrixRow"

export class cmAttributeRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, colNodeAttributes, matrix,
              attributeIndex, attributeLabel, attributeNodeGroup) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, matrix);

    this.createMinorCells(numHeaderCols, colNodeIndexes, false);

    // For each of the major cells...
    for (var i = 0; i < this.majorCells.length; ++i) {
      let data = {};
      let cell = this.majorCells[i];


      // This assumes that the attribute row's labels will start in the same column as the data matrix's row labels.
      if (this.matrix.isLabelCell(i)) {

        // Put the label in it.
        data = {
          name: attributeLabel,
          isVertical: true,
          attributeIndex: attributeIndex,
          nodeIndexes: colNodeIndexes,
          attributeNodeGroup: attributeNodeGroup
        };

        cell.isAttributeLabelCell = true;
        cell.setData(data);

      } else if (this.matrix.isDataCell(i)) {

        // Put the attribute values in it.
        let colIndex = this.matrix.getDataColIndex(i);
        data = {
          values: colNodeAttributes[colIndex],
          nodeIndexes: colNodeIndexes[colIndex],
          isVertical: true,
          attributeIndex: attributeIndex
        };

        cell.isAttributeCell = true;
        cell.setData(data);

        // Put the attributes in all of the minor cells.
        for (var j = 0; j < colNodeIndexes[colIndex].length; ++j) {
          data = {
            values: [colNodeAttributes[colIndex][j]],
            isVertical: true,
            attributeIndex: attributeIndex,
            nodeIndexes: [colNodeIndexes[colIndex][j]]
          };

          cell.minorCells[j].isAttributeCell = true;
          cell.minorCells[j].setData(data);
        }
      }
    }
  }

}
