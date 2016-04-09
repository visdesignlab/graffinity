/*global d3
 */
import {SvgGroupElement} from "./svgGroupElement"
import {cmMatrixCell} from "./cmMatrixCell"

export class cmMatrixRow extends SvgGroupElement {
  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, isMinorRow) {
    // Create parent group for all stuff.
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
    this.isMinorRow = isMinorRow;
    this.rowIndex = rowIndex;
    this.majorCols = [];
    this.numHeaderCols = numHeaderCols;
    this.minorRows = [];
    if (!isMinorRow) {
      this.minorRowContainer = group.append("g")
        .attr("data-minor-row-container", rowIndex);
    }

    let numCols = colNodeIndexes.length;
    let totalNumCols = numCols + numHeaderCols;
    this.createMajorCols(totalNumCols, numHeaderCols, colWidth, rowHeight);

  }

  addMinorRow(matrixRow) {
    this.minorRows.push(matrixRow);
  }

  apply(cellVisitor) {
    for (var i = 0; i < this.majorCols.length; ++i) {
      this.majorCols[i].apply(cellVisitor);
    }
    for (var j = 0; j < this.minorRows.length; ++j) {
      this.minorRows[j].apply(cellVisitor);
    }
  }

  createControlsCol(colWidth, rowHeight, callback) {
    let col = this.getMajorCol(0).getD3Group();
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

  createMajorCols(totalNumCols, numHeaderCols, colWidth, rowHeight) {
    let group = this.group;
    for (var i = 0; i < totalNumCols; ++i) {
      this.majorCols[i] = new cmMatrixCell(group, i, !this.isMinorRow, true, i < numHeaderCols);
      this.majorCols[i].setPosition(colWidth * i, 0);
    }
  }

  createMinorCols(numHeaderCols, colNodeIndexes) {
    for (var i = 0; i < colNodeIndexes.length + numHeaderCols; ++i) {
      if (i >= numHeaderCols) {
        let currColNodeIndexes = colNodeIndexes[i - numHeaderCols];
        for (var j = 0; j < currColNodeIndexes.length; ++j) {
          let majorCol = this.getMajorCol(i);
          let majorGroup = majorCol.getD3Group();
          let minorCell = new cmMatrixCell(majorGroup, j, !this.isMinorRow, false, i < numHeaderCols);
          minorCell.setVisible(false);
          majorCol.addMinorCell(minorCell);
        }
      }
    }
  }

  getCurrentHeight() {
    return this.currentHeight;
  }

  getNumMajorCols() {
    return this.majorCols.length;
  }

  getNumMinorRows() {
    return this.minorRows.length;
  }

  getMajorCol(i) {
    return this.majorCols[i];
  }

  getMajorColIndex(group) {
    return group.attr("data-major-col");
  }

  isHeaderCol(colIndex) {
    return colIndex < this.numHeaderCols;
  }

  onRollupRowClicked() {
    let unrolled = false;
    this.updateControls(unrolled);
    this.updateMinorRows(unrolled);

    this.currentHeight = this.currentHeight / (this.getNumMinorRows() + 1);
    this.unrollRowCallback(this.rowIndex);
  }

  onUnrollRowClicked() {
    let unrolled = true;
    this.updateControls(unrolled);
    this.updateMinorRows(unrolled);

    this.currentHeight = this.currentHeight * (this.getNumMinorRows() + 1);
    this.unrollRowCallback(this.rowIndex);
  }

  rollupCol(colIndex) {

    let minorCells = this.majorCols[colIndex].getMinorCells();
    for (var i = 0; i < minorCells.length; ++i) {
      let currCol = minorCells[i].getD3Group();
      currCol.transition().duration(500)
        .attr("transform", "translate(0,0)");
      currCol.transition().delay(500).style("display", "none");
    }

    if (!this.isMinorRow) {
      let numMinorRows = this.getNumMinorRows();
      for (i = 0; i < numMinorRows; ++i) {
        this.minorRows[i].rollupCol(colIndex);
      }
    }
  }

  setColWidths(colWidths) {
    let numColumns = colWidths.length;
    let xPosition = 0;
    for (var i = 0; i < numColumns; ++i) {
      this.majorCols[i].getD3Group().transition().duration(500).attr("transform", "translate(" + xPosition + ",0)");
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

  unrollCol(colIndex, colWidth) {
    let minorCols = this.majorCols[colIndex].getMinorCells();
    for (var i = 0; i < minorCols.length; ++i) {
      let currCol = minorCols[i].getD3Group();
      currCol.style("display", "block");
      currCol.transition().duration(500)
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
    for (var i = 0; i < numMinorRows; ++i) {
      if (unrolled) {
        this.minorRows[i].setVisible(true);
        this.minorRows[i].setPosition(0, 0);
        this.minorRows[i].setPosition(0, this.currentHeight * (i + 1));
      } else {
        this.minorRows[i].setPosition(0, 0, true);
      }
    }
  }
}
