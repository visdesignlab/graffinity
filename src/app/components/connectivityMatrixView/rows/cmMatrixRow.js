/*global d3
 */
import {SvgGroupElement} from "./../svgGroupElement"
import {cmMatrixCell} from "./../cmMatrixCell"

/**
 * Base class for rows displayed in the matrix.
 *
 * Responsibilities of this class include:
 *  - minorRows which appear when the user wants to unroll a collapsed row
 *  - cells and their width (for unrolling columns)
 *  - managing data bound to major and minor cells which appear in the matrix
 */
export class cmMatrixRow extends SvgGroupElement {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow, matrix, areColsCollapsed) {
    let group = null;
    if (!isMinorRow) {
      group = svg.append("g")
        .attr("data-major-row", rowIndex);
    } else {
      group = svg.append("g")
        .attr("data-minor-row", rowIndex);
    }
    super(group);
    this.areColsCollapsed = areColsCollapsed;
    this.currentHeight = rowHeight; // for position other rows relative to this one.
    this.rowHeight = rowHeight;     // for expanding child rows
    this.isMinorRow = isMinorRow;   // for positioning and traversal
    this.rowIndex = rowIndex;

    this.isMinorRowVisible = [];    // should this state be managed by matrixView?

    this.majorCells = [];
    this.minorRows = [];
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
    this.minorRows.push(matrixRow);
    this.isMinorRowVisible.push(true);
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

    this.unrollControls = col.append("g")
      .style("display", "block");

    this.rollupControls = col.append("g")
      .style("display", "none");

    this.unrollControls
      .append("foreignObject")
      .style({
        "width": colWidth + "px",
        "height": rowHeight + "px"
      })
      .append("xhtml:div")
      .classed("matrix-view-edit-attribute-controls", true)
      .append("i").classed("fa", true)
      .classed("fa-angle-right", true)
      .attr("title", "unroll")
      .on("click", function () {
        self.onUnrollRowClicked();
      });

    this.rollupControls
      .append("foreignObject")
      .style({
        "width": colWidth + "px",
        "height": rowHeight + "px"
      })
      .append("xhtml:div")
      .classed("matrix-view-edit-attribute-controls", true)
      .append("i").classed("fa", true)
      .classed("fa-angle-down", true)
      .attr("title", "roll up")
      .on("click", function () {
        self.onRollupRowClicked();
      });

  }

  createMajorCells(totalNumCols, numHeaderCols) {
    let group = this.group;
    for (var i = 0; i < totalNumCols; ++i) {
      this.majorCells[i] = new cmMatrixCell(group, i, !this.isMinorRow, true, i < numHeaderCols);
      this.addChild(this.majorCells[i]);
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
          majorCol.addChild(minorCell);
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

  static getMajorCellIndex(group) {
    return group.attr("data-major-col");
  }

  hideMinorRow(minorRowIndex) {
    this.isMinorRowVisible[minorRowIndex] = false;
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
  }

  /**
   * Updates state then tells the matrix that this is rolling up.
   */
  onRollupRowClicked(skipCallback) {
    this.unrolled = false;
    this.updateControls(this.unrolled);
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
    if (!skipCallback) {
      this.unrollRowCallback(this.rowIndex);
    }
  }

  /**
   * Updates state then tells the matrix that this is unrolling.
   */
  onUnrollRowClicked(skipCallback) {
    this.unrolled = true;
    this.updateControls(this.unrolled);
    this.updateMinorRows(this.unrolled, this.isMinorRowVisible);
    if (!skipCallback) {
      this.unrollRowCallback(this.rowIndex, this.unrolled);
    }
  }

  setDebugVisible(visible) {
    var children = this.group.selectAll("*");
    children = children.filter(function () {
      return d3.select(this).attr("data-debug");
    });
    children.style("display", visible ? "block" : "none");
  }

  setColPositions(colInv, positions) {
    let numColumns = positions.length;
    for (var i = 0; i < numColumns; ++i) {
      if (this.majorCells[i]) {
        this.majorCells[i].setPosition(positions[colInv[i]], 0);
      }
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
      if (this.majorCells[i]) {
        this.majorCells[i].setPosition(xPosition, 0);
        xPosition += colWidths[i];
      }
    }

    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].setColWidths(colWidths);
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

  /**
   * Updates the state of minorCols in the colIndex.
   * The state can be in three possible cases:
   * 1) the colIndex is rolled up -> move minor col behind the major col and then hide it
   * 2) the colIndex is unrolled and minorCol is visible -> move minorCol to the correct position
   * 3) the colIndex is unrolled and minorCol is hidden -> hide minor col
   *
   * In #1 - don't care about whether the minor is visible or not.
   */
  updateMinorCols(colIndex, minorColWidth, isColIndexUnrolled, isMinorCellVisible) {
    let majorCell = this.majorCells[colIndex];
    if (majorCell) {
      let minorCells = majorCell.minorCells;
      if (minorCells) {
        let position = minorColWidth;

        for (var i = 0; i < minorCells.length; ++i) {
          let cell = minorCells[i];

          if (!isColIndexUnrolled) {
            cell.setPosition(0, 0, true);
          } else {
            if (isMinorCellVisible[colIndex][i]) {
              cell.setVisible(true);
              cell.setPosition(position, 0);
              position += minorColWidth;
            } else {
              cell.setVisible(false);
            }
          }
        }

        if (!this.isMinorRow) {
          let numMinorRows = this.getNumMinorRows();
          for (i = 0; i < numMinorRows; ++i) {
            this.minorRows[i].updateMinorCols(colIndex, minorColWidth, isColIndexUnrolled, isMinorCellVisible)
          }
        }
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
