import {cmMatrixRow} from "./cmMatrixRow"

export class cmLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, majorColLabels, minorColLabels, matrix, attributeLabels) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, false, matrix);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    this.createMinorCells(numHeaderCols, colNodeIndexes);

    for (var i = 0; i < numMajorCells; ++i) {
      let cell = this.getMajorCell(i);
      let dataIndex = this.matrix.getDataColIndex(i);
      if (this.matrix.isControlCell(i)) {

        cell.isEditAttributeCell = true;
        cell.setData({
          isVertical: false
        });

      } else if (this.matrix.isAttributeCell(i)) {

        let attributeIndex = this.matrix.getAttributeColIndex(i);

        cell.setData({
          name: attributeLabels[attributeIndex],
          isVertical: 0,
          attributeIndex: attributeIndex
        });

        cell.isAttributeLabelCell = true;

      } else if (this.matrix.isLabelCell(i)) {

        cell.setData({
          name: "id",
          isVertical: 0,
          attributeIndex: -1
        });

        cell.isAttributeLabelCell = true;

      } else if (this.matrix.isDataCell(i)) {

        cell.setData({
          name: majorColLabels[dataIndex],
          isVertical: 1,
          attributeIndex: -1
        });

        cell.isAttributeCell = true;

        for (var j = 0; j < colNodeIndexes[dataIndex].length; ++j) {
          let minorCell = cell.minorCells[j];

          minorCell.setData({
            name: minorColLabels[dataIndex][j],
            isVertical: 1,
            attributeIndex: -1
          });

          minorCell.isAttributeCell = true;
        }
      }
    }

    this.colNodeIndexes = colNodeIndexes;
  }

  static createColNodeLabel(cell, label, rowHeight, colWidth) {
    let group = cell.getGroup();
    group.append("g")
      .attr("transform", "translate(" + colWidth / 2 + "," + rowHeight + ")rotate(270)")
      .append("text")
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle")
      .attr("font-size", 8)
      .text(label);
  }
}
