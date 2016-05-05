/*global d3
 */
import {SvgGroupElement} from "./svgGroupElement"
import {cmMatrixCell} from "./cmMatrixCell"

export class cmMatrixRow extends SvgGroupElement {
  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, matrix) {
    let group = null;
    if (!isMinorRow) {
      group = svg.append("g")
        .attr("data-major-row", rowIndex);
    } else {
      group = svg.append("g")
        .attr("data-minor-row", rowIndex);
    }
    super(group);

    this.currentHeight = rowHeight;
    this.rowHeight = rowHeight;
    this.isMinorRow = isMinorRow;
    this.rowIndex = rowIndex;
    this.majorCells = [];
    this.minorRows = [];
    this.isMinorRowVisible = [];
    this.matrix = matrix;
    if (!isMinorRow) {
      this.minorRowContainer = group.append("g")
        .attr("data-minor-row-container", rowIndex);
    }

    let numCols = colNodeIndexes.length;
    let totalNumCols = numCols + numHeaderCols;
    this.createMajorCells(totalNumCols, numHeaderCols)

  }

  addMinorRow(matrixRow) {
    this.isMinorRowVisible[this.minorRows.length] = true;
    this.minorRows.push(matrixRow);
  }

  apply(cellVisitor) {
    for (var i = 0; i < this.majorCells.length; ++i) {
      this.majorCells[i].apply(cellVisitor);
    }
    for (var j = 0; j < this.minorRows.length; ++j) {
      this.minorRows[j].apply(cellVisitor);
    }
  }

  createControlsCell(colWidth, rowHeight, callback) {
    let col = this.getMajorCell(0).getGroup();
    var self = this;
    this.unrollRowCallback = callback;

    this.unrollControls = col.append("g");

    this.unrollControls.append("text")
      .text("+")
      .style("text-anchor", "start")
      .style("dominant-baseline", "hanging");

    this.unrollControls
      .append("rect")
      .attr("width", colWidth)
      .attr("height", rowHeight)
      .style("fill", "transparent")
      .on("click", function () {
        self.onUnrollRowClicked();
      });

    this.rollupControls = col.append("g");
    this.rollupControls.append("text")
      .text("-")
      .style("text-anchor", "start")
      .style("dominant-baseline", "hanging");

    this.rollupControls.append("rect")
      .attr("width", colWidth)
      .attr("height", rowHeight)
      .style("fill", "transparent")
      .on("click", function () {
        self.onRollupRowClicked();
      });

    this.rollupControls.style("display", "none");

  }

  createMajorCells(totalNumCols, numHeaderCols) {
    let group = this.group;
    for (var i = 0; i < totalNumCols; ++i) {
      this.majorCells[i] = new cmMatrixCell(group, i, !this.isMinorRow, true, i < numHeaderCols);
    }
  }

  createMinorCells(numHeaderCols, colNodeIndexes, isDataCell) {
    for (var i = 0; i < colNodeIndexes.length + numHeaderCols; ++i) {
      if (i >= numHeaderCols) {
        let currColNodeIndexes = colNodeIndexes[i - numHeaderCols];
        for (var j = 0; j < currColNodeIndexes.length; ++j) {
          let majorCol = this.getMajorCell(i);
          let majorGroup = majorCol.getGroup();
          let minorCell = new cmMatrixCell(majorGroup, j, !this.isMinorRow, false, i < numHeaderCols, isDataCell);
          minorCell.setVisible(false);
          majorCol.addMinorCell(minorCell);
        }
      }
    }
  }

  getCurrentHeight() {
    return this.currentHeight;
  }

  getNumMajorCells() {
    return this.majorCells.length;
  }

  getNumMinorRows() {
    return this.minorRows.length;
  }

  getNumVisibleMinorRows() {
    let numVisibleMinorRows = 0;
    for (var i = 0; i < this.isMinorRowVisible.length; ++i) {
      if (this.isMinorRowVisible[i]) {
        numVisibleMinorRows++;
      }
    }
    return numVisibleMinorRows;
  }

  getMajorCell(i) {
    return this.majorCells[i];
  }

  static getMajorCellIndex(group) {
    return group.attr("data-major-col");
  }

  hideMinorRow(minorRowIndex) {
    this.isMinorRowVisible[minorRowIndex] = false;
    this.onUnrollRowClicked();
  }

  onRollupRowClicked() {
    let unrolled = false;
    this.updateControls(unrolled);
    this.updateMinorRows(unrolled);

    this.currentHeight = this.currentHeight / (this.getNumVisibleMinorRows() + 1);
    this.unrollRowCallback(this.rowIndex);
  }

  onUnrollRowClicked() {
    let unrolled = true;
    this.updateControls(unrolled);
    this.updateMinorRows(unrolled);

    this.currentHeight = this.currentHeight * (this.getNumVisibleMinorRows() + 1);
    this.unrollRowCallback(this.rowIndex);
  }

  rollupCol(colIndex) {

    let minorCells = this.majorCells[colIndex].minorCells;
    for (var i = 0; i < minorCells.length; ++i) {
      let cellGroup = minorCells[i].getGroup();
      cellGroup.transition()
        .duration(500)
        .attr("transform", "translate(0,0)");

      cellGroup.transition()
        .delay(500)
        .style("display", "none");
    }

    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].rollupCol(colIndex);
      }
    }
  }

  setColPositions(colInv, positions) {
    let numColumns = positions.length;
    for (var i = 0; i < numColumns; ++i) {
      this.majorCells[i].setPosition(positions[colInv[i]], 0);
    }
    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].setColPositions(colInv, positions);
      }
    }
  }

  setColWidths(colWidths) {
    let numColumns = colWidths.length;
    let xPosition = 0;
    for (var i = 0; i < numColumns; ++i) {
      this.majorCells[i].getGroup().transition().duration(500).attr("transform", "translate(" + xPosition + ",0)");
      xPosition += colWidths[i];
    }

    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].setColWidths(colWidths);
      }
    }
  }

  setDebugVisible(visible) {
    var children = this.group.selectAll("*");
    children = children.filter(function () {
      return d3.select(this).attr("data-debug");
    });
    children.style("display", visible ? "block" : "none");
  }

  showMinorRow(minorRowIndex) {

  }

  unrollCol(colIndex, colWidth) {
    let minorCells = this.majorCells[colIndex].minorCells;
    for (var i = 0; i < minorCells.length; ++i) {
      let cellGroup = minorCells[i].getGroup();
      cellGroup.style("display", "block");
      cellGroup.transition()
        .duration(500)
        .attr("transform", "translate(" + ((i + 1) * colWidth) + ",0)");
    }

    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].unrollCol(colIndex, colWidth);
      }
    }
  }

  updateControls(unrolled) {
    this.unrollControls.style("display", unrolled ? "none" : "block");
    this.rollupControls.style("display", unrolled ? "block" : "none");
  }

  updateMinorRows(unrolled) {
    let numMinorRows = this.getNumMinorRows();
    let numVisibleMinorRowsAdded = 1;
    this.currentHeight = this.rowHeight;
    for (var i = 0; i < numMinorRows; ++i) {
      if (unrolled) {
        if (this.isMinorRowVisible[i]) {
          this.minorRows[i].setVisible(true);
          this.minorRows[i].setPosition(0, 0);
          this.minorRows[i].setPosition(0, this.currentHeight * (numVisibleMinorRowsAdded));
          numVisibleMinorRowsAdded += 1;
        } else {
          this.minorRows[i].setVisible(false);
        }
      } else {
        this.minorRows[i].setPosition(0, 0, true);
      }
    }
    this.unrollRowCallback(this.rowIndex);
  }
}
