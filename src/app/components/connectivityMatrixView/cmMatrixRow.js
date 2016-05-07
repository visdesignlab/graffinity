/*global d3
 */
import {SvgGroupElement} from "./svgGroupElement"
import {cmMatrixCell} from "./cmMatrixCell"

/**
 * Base class for rows displayed in the matrix.
 *
 * Responsibilities of this class include:
 *  - minorRows which appear when the user wants to unroll a collapsed row
 *  - cells and their width (for unrolling columns)
 *  - managing data bound to major and minor cells which appear in the matrix
 */
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
    this.isMajorCellVisible = [];
    this.isMinorCellVisible = [];
    this.isMajorCellUnrolled = [];
    this.matrix = matrix;
    this.unrolled = false;

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
    matrixRow.setPosition(0, 0);
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
      this.isMajorCellVisible[i] = true;
      this.isMinorCellVisible[i] = [];
      this.isMajorCellUnrolled[i] = false;
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
          minorCell.setPosition(0, 0);
          majorCol.addMinorCell(minorCell);
          this.isMinorCellVisible[i][j] = true;
        }
      }
    }
  }

  getCurrentHeight() {
    return this.currentHeight;
  }

  getMajorCell(i) {
    return this.majorCells[i];
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

  getNumVisibleMinorCells(colIndex) {
    let numVisibleMinorCols = 0;
    let isMinorCellVisible = this.isMinorCellVisible[colIndex];
    for (var i = 0; i < isMinorCellVisible.length; ++i) {
      if (isMinorCellVisible[i]) {
        numVisibleMinorCols++;
      }
    }
    return numVisibleMinorCols;
  }

  static getMajorCellIndex(group) {
    return group.attr("data-major-col");
  }

  // TODO - review this. Check for symmetry with showMinorCol and rollup/unrollCol
  hideMinorCol(colIndex, minorColIndex, colWidth, isColIndexUnrolled, isMinorColVisible) {
    this.updateMinorCols(colIndex, colWidth, isColIndexUnrolled, isMinorColVisible);

    if (!this.isMinorRow) {
      for (var i = 0; i < this.minorRows.length; ++i) {
        this.minorRows[i].hideMinorCol(colIndex, minorColIndex, colWidth, isColIndexUnrolled, isMinorColVisible);
      }
    }
  }

  hideMinorRow(minorRowIndex) {
    this.isMinorRowVisible[minorRowIndex] = false;
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
  }

  /**
   * Updates state then tells the matrix that this is rolling up.
   */
  onRollupRowClicked() {
    this.unrolled = false;
    this.updateControls(this.unrolled);
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
    this.unrollRowCallback(this.rowIndex);
  }

  /**
   * Updates state then tells the matrix that this is unrolling.
   */
  onUnrollRowClicked() {
    this.unrolled = true;
    this.updateControls(this.unrolled);
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
    this.unrollRowCallback(this.rowIndex);
  }

  setDebugVisible(visible) {
    var children = this.group.selectAll("*");
    children = children.filter(function () {
      return d3.select(this).attr("data-debug");
    });
    children.style("display", visible ? "block" : "none");
  }

  // TODO - review this.
  rollupCol(colIndex, isMinorColVisible) {
    this.updateMinorCols(colIndex, 0, false, isMinorColVisible);
    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (var i = 0; i < numMinorRows; ++i) {
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

  // TODO - review this.
  showMinorCol(colIndex, minorColIndex, colWidth, isColIndexUnrolled, isMinorColVisible) {
    this.updateMinorCols(colIndex, colWidth, isColIndexUnrolled, isMinorColVisible);
    if (!this.isMinorRow) {
      for (var i = 0; i < this.minorRows.length; ++i) {
        this.minorRows[i].showMinorCol(colIndex, minorColIndex, colWidth);
      }
    }
  }

  /**
   * Makes this.minorRow[minorRowIndex] visible.
   */
  showMinorRow(minorRowIndex) {
    this.isMinorRowVisible[minorRowIndex] = true;
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
  }

  unrollCol(colIndex, colWidth, isMinorColVisible) {
    this.updateMinorCols(colIndex, colWidth, true, isMinorColVisible);
    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (var i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].unrollCol(colIndex, colWidth, isMinorColVisible);
      }
    }
  }

  // TODO - review and comment this.
  updateMinorCols(colIndex, colWidth, isColIndexUnrolled, isMinorCellVisible) {
    let minorCells = this.majorCells[colIndex].minorCells;
    let position = colWidth;
    for (var i = 0; i < minorCells.length; ++i) {
      let cell = minorCells[i];
      let isUnrolledAndCellVisible = isColIndexUnrolled && isMinorCellVisible[colIndex][i];
      let isUnrolledAndCellHidden = isColIndexUnrolled && !isMinorCellVisible[colIndex][i];
      let isRolledUp = !isColIndexUnrolled;
      if (isUnrolledAndCellVisible) {
        cell.setVisible(true);
        cell.setPosition(position, 0);
        position += colWidth;
      } else if (isUnrolledAndCellHidden) {
        cell.setVisible(false);
      } else if (isRolledUp) {
        cell.setPosition(0, 0, true);
      }
    }
  }

  /**
   * Toggles controls cell from + to -
   */
  updateControls(unrolled) {
    this.unrollControls.style("display", unrolled ? "none" : "block");
    this.rollupControls.style("display", unrolled ? "block" : "none");
  }

  /**
   * Updates the position and visibility of minor rows. Gets called when rows are unrolled or when rows are filtered.
   * @param unrolled - if true then put minor rows below this, else put minor rows at same position as this.
   * @param isMinorRowVisible - hide rows based on their index
   */
  updateMinorRows(unrolled, isMinorRowVisible) {
    let numMinorRows = this.getNumMinorRows();
    this.currentHeight = this.rowHeight;

    // For each minor row...
    for (var i = 0; i < numMinorRows; ++i) {
      if (unrolled) {
        if (isMinorRowVisible[i]) {
          // Put the visible minor rows in correct position underneath this.
          this.minorRows[i].setVisible(true);
          this.minorRows[i].setPosition(0, this.currentHeight);
          this.currentHeight += this.rowHeight;
        } else {
          // And hide the invisible rows.
          this.minorRows[i].setVisible(false);
        }
      } else {
        // Not unrolled - we need to move the minor rows underneath this.
        this.minorRows[i].setPosition(0, 0, true);
      }
    }
  }
}
