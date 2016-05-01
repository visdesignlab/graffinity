import {cmMatrixRow} from "./cmMatrixRow"

export class cmLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, majorColLabels, minorColLabels, matrix, attributeLabels) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, false, matrix);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    this.createMinorCells(numHeaderCols, colNodeIndexes);

    for (var i = 0; i < numMajorCells; ++i) {
      let majorCell = this.getMajorCell(i);
      let dataIndex = this.getDataColIndex(i);
      if (this.matrix.isAttributeCell(i)) {
        majorCell.getGroup()
          .append("text")
          .text(attributeLabels[this.matrix.getAttributeColIndex(i)]);

      } else if (this.matrix.isDataCell(i)) {
        cmLabelRow.createColNodeLabel(majorCell, majorColLabels[dataIndex], rowHeight);
        for (var j = 0; j < colNodeIndexes[dataIndex].length; ++j) {
          let minorCell = majorCell.minorCells[j];
          cmLabelRow.createColNodeLabel(minorCell, minorColLabels[dataIndex][j], rowHeight);
        }
      }
    }

    this.colNodeIndexes = colNodeIndexes;
  }

  static createColNodeLabel(cell, label, rowHeight) {
    let group = cell.getGroup();
    group.append("g")
      .attr("transform", "translate(0," + rowHeight + ")rotate(270)")
      .append("text")
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "text-before-edge")
      .attr("font-size", 8)
      .text(label);
  }
}
