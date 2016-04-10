import {cmMatrixRow} from "./cmMatrixRow"

export class cmDataRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, modelRow, label, minorLabels) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow);

    if (!isMinorRow) {
      let numChildren = modelRow.getNumChildren();
      if (numChildren > 0) {

        let minorRow = new cmDataRow(this.minorRowContainer, 0, colNodeIndexes, numHeaderCols, colWidth, rowHeight,
          true, modelRow, minorLabels[0]);
        minorRow.setVisible(false);
        this.addMinorRow(minorRow);

        for (var i = 0; i < numChildren; ++i) {
          minorRow = new cmDataRow(this.minorRowContainer, i+1,  colNodeIndexes, numHeaderCols, colWidth, rowHeight,
            true, modelRow.getChildRowAt(i), minorLabels[i+1]);
          minorRow.setVisible(false);
          this.addMinorRow(minorRow);
        }
      }
    }

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    cmDataRow.createLabelInCell(this.majorCells[1], label)
    for (i = 0; i < numMajorCells; ++i) {
      if(!this.isHeaderCell(i)) {
        this.majorCells[i].isDataCell = true;
      }
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
          throw "something fucked up in col node indexes and minor cells";
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

  static createLabelInCell(cell, label) {
     let group = cell.getGroup();
      group.append("g")
      .append("text")
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "text-before-edge")
      .attr("font-size", 8)
      .text(label);
  }
}
