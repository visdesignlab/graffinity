/*global d3
 */
import {SvgGroupElement} from "./svgGroupElement"

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

    if (!isMinorRow) {
      this.minorRowContainer = group.append("g")
        .attr("data-minor-row-container", rowIndex);
      this.minorRows = [];
    }

    let numCols = colNodeIndexes.length;
    let totalNumCols = numCols + numHeaderCols;
    this.createMajorCols(totalNumCols, colWidth, rowHeight);
    this.createMinorCols(numHeaderCols, colNodeIndexes);

  }

  addMinorRow(matrixRow) {
    this.minorRows.push(matrixRow);
  }

  createControlsCol(colWidth, rowHeight, callback) {
    let col = this.getMajorCol(0);
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

  createMajorCols(totalNumCols, colWidth, rowHeight) {
    let group = this.group;
    for (var i = 0; i < totalNumCols; ++i) {
      this.majorCols[i] = group.append("g")
        .attr("data-major-col", i)
        .attr("transform", "translate(" + (colWidth * i) + ",0)");

      if (this.isMinorRow) {
        this.majorCols[i].append("rect")
          .attr("data-debug", true)
          .attr("width", colWidth)
          .attr("height", rowHeight)
          .attr("stroke", "#040")
          .attr("fill", "none");
      } else {
        this.majorCols[i].append("rect")
          .attr("data-debug", true)
          .attr("width", colWidth)
          .attr("height", rowHeight)
          .attr("stroke", "#444")
          .attr("fill", "none");
      }
    }
  }

  createMinorCols(numHeaderCols, colNodeIndexes) {
    this.minorColContainers = [];
    this.minorCols = [];

    for (var i = 0; i < colNodeIndexes.length + numHeaderCols; ++i) {
      let majorCol = this.getMajorCol(i);
      this.minorColContainers[i] = majorCol.append("g")
        .attr("data-minor-col-container", i)
        .style("display", "none");

      if (i >= numHeaderCols) {
        let index = i - numHeaderCols;
        let minorCols = [];
        for (var j = 0; j < colNodeIndexes[index].length; ++j) {

          let minorCol = this.minorColContainers[i]
            .append("g")
            .attr("data-minor-col", j);

          minorCols.push(minorCol);

          minorCol.append("circle")
            .attr("data-debug", true)
            .attr("r", 6)
            .attr("cx", 6)
            .attr("cy", 6)
            .attr("fill", "none")
            .attr("stroke", "#444");

          this.minorCols[i] = minorCols;
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
    for (var i = 0; i < this.minorCols[colIndex].length; ++i) {
      let currCol = this.minorCols[colIndex][i];
      currCol.transition().duration(500)
        .attr("transform", "translate(0,0)");
    }
    this.minorColContainers[colIndex].transition().delay(500).style("display", "none");

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
      this.majorCols[i].transition().duration(500).attr("transform", "translate(" + xPosition + ",0)");
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
    this.minorColContainers[colIndex].style("display", "block");
    for (var i = 0; i < this.minorCols[colIndex].length; ++i) {
      let currCol = this.minorCols[colIndex][i];
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
