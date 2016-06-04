import {cmMatrixRow} from "./cmMatrixRow"
import {Utils} from "../utils/utils";

export class cmControlsMatrixColHeaderRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, majorColLabels, minorColLabels,
              matrix, attributeLabels, rowNodeIndexes, attributeNodeGroup, rowNodeAttributes) {
    super(svg, rowIndex, [], numHeaderCols, colWidth, rowHeight, false, matrix);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    //this.createMinorCells(numHeaderCols, colNodeIndexes);

    for (var i = 0; i < numMajorCells; ++i) {
      let cell = this.getMajorCell(i);

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
          attributeIndex: attributeIndex,
          nodeIndexes: rowNodeIndexes,
          attributeNodeGroup: attributeNodeGroup,
          attributeValues: Utils.getFlattenedLists(rowNodeAttributes[attributeIndex])
        });

        cell.isAttributeLabelCell = true;

      } else if (this.matrix.isLabelCell(i)) {

        cell.setData({
          name: "id",
          isVertical: 0,
          attributeIndex: -1
        });

        cell.isAttributeLabelCell = true;

      }

      this.colNodeIndexes = colNodeIndexes;
    }
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
