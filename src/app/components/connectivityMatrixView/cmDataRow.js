import {cmMatrixRow} from "./cmMatrixRow"

export class cmDataRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, modelRow, label, minorLabels, rowNodeAttributes, matrix) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, matrix);
    this.unrollControls = [];
    this.rollupControls = [];

    // If this is not a minor row - there might be children. Try adding them.
    if (!isMinorRow) {
      let numChildren = modelRow.getNumChildren();
      if (numChildren > 0) {
        let childIndex = 0;
        let isChildRow = true;
        let childLabels = null;

        let minorRow = new cmDataRow(this.minorRowContainer, childIndex, colNodeIndexes, numHeaderCols, colWidth,
          rowHeight, isChildRow, modelRow, minorLabels[childIndex], childLabels,
          cmDataRow.getAttributes(rowNodeAttributes, childIndex), matrix);

        minorRow.setVisible(false);
        this.addMinorRow(minorRow);

        for (var i = 0; i < numChildren; ++i) {
          childIndex = i + 1;

          minorRow = new cmDataRow(this.minorRowContainer, childIndex, colNodeIndexes, numHeaderCols, colWidth,
            rowHeight, isChildRow, modelRow.getChildRowAt(i), minorLabels[childIndex], childLabels,
            cmDataRow.getAttributes(rowNodeAttributes, i + 1), matrix);

          minorRow.setVisible(false);
          this.addMinorRow(minorRow);
        }
      }
    }

    // Tag the cells in this row with correct booleans.
    var numMajorCells = this.getNumMajorCells();
    for (i = 0; i < numMajorCells; ++i) {
      if (this.matrix.isAttributeCell(i)) {
        this.majorCells[i].isAttributeCell = true;
      } else if (this.matrix.isLabelCell(i)) {
        this.majorCells[i].isRowLabelCell = true;
      } else if (this.matrix.isDataCell(i)) {
        this.majorCells[i].isDataCell = true;
      }
    }

    this.createMinorCells(numHeaderCols, colNodeIndexes, true);

    // Loop over all columns...fill with appropriate data
    for (i = 0; i < numMajorCells; ++i) {
      let cell = this.majorCells[i];
      let data = {};
      if (this.matrix.isAttributeCell(i)) {

        let attributeIndex = this.matrix.getAttributeColIndex(i);

        data = {
          values: rowNodeAttributes[attributeIndex],
          orientation: 0,
          attributeIndex: attributeIndex
        };

        cell.setData(data);

      } else if (this.matrix.isLabelCell(i)) {

        cmDataRow.createLabelInCell(cell, label, this.colWidth, this.matrix.rowHeight);

      } else if (this.matrix.isDataCell(i)) {

        let dataIndex = this.matrix.getDataColIndex(i);
        data = {
          colNodeIndexes: colNodeIndexes[dataIndex],
          modelRow: modelRow
        };

        cell.setData(data);

        if (cell.minorCells.length != colNodeIndexes[dataIndex].length) {
          throw "something fucked up in col node indexes and minor cells";
        }

        for (var j = 0; j < this.majorCells[i].minorCells.length; ++j) {

          data = {
            colNodeIndexes: colNodeIndexes[dataIndex][j],
            modelRow: modelRow
          };

          cell.minorCells[j].setData(data);
        }
      }
    }
  }

  static createLabelInCell(cell, label, colWidth, rowHeight) {
    let group = cell.getGroup();
    group.append("g")
      .append("text")
      .attr("x", colWidth)
      .attr("y", rowHeight / 2)
      .style("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .attr("font-size", 8)
      .text(label);
  }

  static getAttributes(rowNodeAttributes, childIndex) {
    let attributes = [];
    for (var i = 0; i < rowNodeAttributes.length; ++i) {
      attributes.push([rowNodeAttributes[i][childIndex]]);
    }
    return attributes;
  }

  setLabelColWidth(colWidth) {

    // Update the width of label columns
    // This makes the text aligned with the matrix's edge.
    for (var i = 0; i < this.majorCells.length; ++i) {
      let cell = this.majorCells[i];
      if (cell.isRowLabelCell) {
        cell.getGroup().select("text")
          .attr("x", colWidth - 1);
      }
    }

    // Update the width of child row's column labels.
    for (i = 0; i < this.minorRows.length; ++i) {
      this.minorRows[i].setLabelColWidth(colWidth);
    }
  }
}
