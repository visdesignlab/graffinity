import {cmMatrixRow} from "./cmMatrixRow"

export class cmDataRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, modelRow, label, minorLabels, rowNodeAttributes, matrix) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, matrix);
    console.log('creating data row', rowNodeAttributes);
    if (!isMinorRow) {
      let numChildren = modelRow.getNumChildren();
      if (numChildren > 0) {
        let childIndex = 0;
        let minorRow = new cmDataRow(this.minorRowContainer, childIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight,
          true, modelRow, minorLabels[childIndex], null, cmDataRow.getAttributes(rowNodeAttributes, childIndex), matrix);
        minorRow.setVisible(false);
        this.addMinorRow(minorRow);

        for (var i = 0; i < numChildren; ++i) {
          childIndex = i + 1;
          minorRow = new cmDataRow(this.minorRowContainer, childIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight,
            true, modelRow.getChildRowAt(i), minorLabels[childIndex], null, cmDataRow.getAttributes(rowNodeAttributes, i+1), matrix);
          minorRow.setVisible(false);
          this.addMinorRow(minorRow);
        }
      }
    }

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();

    for (i = 0; i < numMajorCells; ++i) {
      if(this.matrix.isAttributeCell(i)) {
        this.majorCells[i].isAttributeCell = true;
      } else if (this.matrix.isLabelCell(i)) {
        cmDataRow.createLabelInCell(this.majorCells[i], label);
      } else if (this.matrix.isDataCell(i)) {
        this.majorCells[i].isDataCell = true;
      }
    }

    this.createMinorCells(numHeaderCols, colNodeIndexes, true);

    for (i = 0; i < numMajorCells; ++i) {
      if(this.matrix.isAttributeCell(i)) {
        let attributeIndex = this.matrix.getAttributeColIndex(i);
        let data = {
          values: rowNodeAttributes[attributeIndex],
          orientation: 0,
          attributeIndex: attributeIndex
        };
        this.majorCells[i].setData(data);
      } else if (this.matrix.isLabelCell(i)) {
        cmDataRow.createLabelInCell(this.majorCells[i], label);
      } else if (this.matrix.isDataCell(i)) {
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

  static getAttributes(rowNodeAttributes, childIndex) {
    let attributes = [];
    for(var i=0; i<rowNodeAttributes.length; ++i) {
      attributes.push([rowNodeAttributes[i][childIndex]]);
    }
    return attributes;
  }
}
