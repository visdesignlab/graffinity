import {cmMatrixRow} from "../rows/cmMatrixRow"

export class cmNodeListLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, majorColLabels, minorColLabels, matrix,
              attributeNodeGroup, areColsCollapsed) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, false, matrix, areColsCollapsed);

    var numMajorCells = this.getNumMajorCells();

    this.createMinorCells(numHeaderCols, colNodeIndexes);

    for (var i = 0; i < numMajorCells; ++i) {
      let cell = this.getMajorCell(i);
      let dataIndex = this.matrix.getDataColIndex(i);

      if (this.matrix.isDataCell(i)) {

        cell.isColLabelCell = true;
        cell.setData({
          values: [majorColLabels[dataIndex]],
          isVertical: 1,
          attributeIndex: -1,
          nodeIndexes: colNodeIndexes[dataIndex],
          attributeNodeGroup: attributeNodeGroup
        });

        cell.isAttributeCell = true;
        if (this.areColsCollapsed) {
          throw "Something went wrong -- node list view with collapsed columns?!"
        }
      }

    }
    this.colNodeIndexes = colNodeIndexes;
  }
}
