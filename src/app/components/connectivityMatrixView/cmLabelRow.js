import {cmMatrixRow} from "./cmMatrixRow"

export class cmLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, majorColLabels, minorColLabels) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    this.createMinorCells(numHeaderCols, colNodeIndexes);

    for (var i = 0; i < numMajorCells; ++i) {
      let majorCell = this.getMajorCell(i);
      let dataIndex = this.getDataColIndex(i);
      if (!this.isHeaderCell(i)) {
        cmLabelRow.createLabelInCell(majorCell, majorColLabels[dataIndex], rowHeight);
        for (var j = 0; j < colNodeIndexes[dataIndex].length; ++j) {
          let minorCell = majorCell.minorCells[j];
          cmLabelRow.createLabelInCell(minorCell, minorColLabels[dataIndex][j], rowHeight);
        }
      }
    }

    this.colNodeIndexes = colNodeIndexes;
  }

  static createLabelInCell(cell, label, rowHeight) {
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
