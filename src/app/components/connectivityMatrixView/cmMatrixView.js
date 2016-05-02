/*global reorder, d3
 */
import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmLabelRow} from "./cmLabelRow"
import {cmDataRow} from "./cmDataRow"
import {cmAttributeRow} from "./cmAttributeRow"
import {cmAttributeLabelVisitor} from "./visitors/cmAttributeLabelVisitor"
import {cmScatterPlot1DVisitor} from "./visitors/cmScatterPlot1DVisitor"
import {cmScatterPlot1DPreprocessor} from "./visitors/cmScatterPlot1DVisitor"
import {cmColorMapPreprocessor} from "./visitors/cmColorMapVisitor"
import {cmColorMapVisitor} from "./visitors/cmColorMapVisitor"
import {cmColorMapLegend} from "./visitors/cmColorMapVisitor"
import {cmClearVisitor} from "./visitors/cmClearVisitor"
import {cmBarChartPreprocessor} from "./visitors/cmBarChartVisitor"
import {cmBarChartVisitor} from "./visitors/cmBarChartVisitor"
import {Utils} from "../utils/utils"
import {UtilsD3} from "../utils/utilsd3"

export class cmMatrixView extends SvgGroupElement {
  constructor(svg, model, $log) {
    super(svg);
    this.$log = $log;
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = model.getColNodeIndexes();
    this.svg = svg;
    let attributes = ['area', 'locations'];
    this.numControlCols = 1;
    this.numAttributeCols = attributes.length;
    this.numLabelCols = 1;
    this.numHeaderCols = this.numControlCols + this.numAttributeCols + this.numLabelCols;

    this.numHeaderRows = 2 + attributes.length; // 2 is the control row and the label row
    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];
    this.rowPerm = reorder.permutation(this.numHeaderRows + this.rowNodeIndexes.length);
    this.colPerm = reorder.permutation(this.numHeaderCols + this.colNodeIndexes.length);

    // Populate the row/col node attributes.
    // rowNodeAttributes[i][j] = attributes[j] for row[i]
    // colNodeAttributes[i][j] = attributes[i] for col[j]
    let colNodeAttributes = [];
    let rowAttributes = [];
    for (var i = 0; i < attributes.length; ++i) {
      colNodeAttributes[i] = model.getNodeAttrs(this.colNodeIndexes, attributes[i]);
      rowAttributes[i] = model.getNodeAttrs(this.rowNodeIndexes, attributes[i]);
    }

    let rowNodeAttributes = rowAttributes[0];
    if (attributes.length > 1) {
      for (i = 1; i < attributes.length; ++i) {
        rowNodeAttributes = d3.zip(rowNodeAttributes, rowAttributes[i]);
      }
    } else {
      for (i = 0; i < rowNodeAttributes.length; ++i) {
        rowNodeAttributes[i] = [rowNodeAttributes[i]];
      }
    }

    this.colWidthAttr = 80;
    this.colWidthLabel = 30;
    for (i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      if (this.isControlCell(i) || this.isDataCell(i)) {
        this.colWidths[i] = this.colWidth;
      } else if (this.isAttributeCell(i)) {
        this.colWidths[i] = this.colWidthAttr;
      } else if (this.isLabelCell(i)) {
        this.colWidths[i] = this.colWidthLabel;
      }
    }


    // Controls row is the only one with a onColControlsClicked callback.
    let row = new cmControlRow(svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
      this.rowHeight, model.areColsCollapsed, this);

    let callback = this.onColControlsClicked.bind(this);
    row.setColClickCallback(callback);
    this.addRow(row, this.rowHeight);

    let attributeRowHeight = 80;
    for (i = 0; i < attributes.length; ++i) {
      let attributeRow = new cmAttributeRow(svg,
        this.allRows.length,
        this.colNodeIndexes,
        this.numHeaderCols,
        this.colWidth,
        attributeRowHeight,
        false,
        colNodeAttributes[i],
        this,
        i, attributes[i]);

      this.addRow(attributeRow, attributeRowHeight);
    }

    // Create the labels row
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    let labelRowHeight = 30;
    let labelRow = new cmLabelRow(svg,
      this.allRows.length,
      this.colNodeIndexes,
      this.numHeaderCols,
      this.colWidth,
      labelRowHeight,
      majorColLabels,
      minorColLabels,
      this,
      attributes);
    this.addRow(labelRow, labelRowHeight);

    // Create each of the data rows!
    let modelRows = model.getCurrentRows();
    let majorRowLabels = model.getMajorRowLabels();
    let minorRowLabels = model.getMinorRowLabels();

    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmDataRow(svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
        this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i], rowNodeAttributes[i], this);
      if (modelRows[i].getNumChildren() > 0) {
        callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCell(this.colWidth, this.rowHeight, callback);
      }
      this.addRow(dataRow, this.rowHeight);
    }

    this.setEncoding("colormap");

    // Visitor to create scatter plots in per-cell attributes
    let visitor = null;
    for (i = 0; i < attributes.length; ++i) {
      let preprocessor = new cmScatterPlot1DPreprocessor(i);
      this.applyVisitor(preprocessor);
      let valueRange = preprocessor.getValueRange();
      visitor = new cmScatterPlot1DVisitor(i, this.rowHeight / 4, valueRange);
      this.applyVisitor(visitor);
    }

    visitor = new cmAttributeLabelVisitor(this.colWidthAttr, this.rowHeight);
    this.applyVisitor(visitor);

    this.updatePositions(this.rowPerm, this.colPerm);
  }

  addRow(row, rowHeight) {
    let y = 0;
    for (var i = 0; i < this.allRows.length; ++i) {
      y += this.rowHeights[i];
    }
    row.setPosition(0, y);
    this.allRows.push(row);
    this.rowHeights.push(rowHeight);
  }

  applyVisitor(visitor) {
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].apply(visitor);
    }
  }

  static getAvailableEncodings() {
    return ["colormap", "bar chart"];
  }

  static getColXPositions(colPerm, colWidths) {
    let positions = [];
    let x = 0;
    for (var i = 0; i < colWidths.length; ++i) {
      let logicalColIndex = colPerm[i];
      positions.push(x);
      x += colWidths[logicalColIndex];
    }
    return positions;
  }

  getAttributeColIndex(viewColIndex) {
    return viewColIndex - this.numControlCols;
  }

  getDataColIndex(viewColIndex) {
    return viewColIndex - this.numHeaderCols;
  }

  static getRowYPositions(rowPerm, rowHeights) {
    let positions = [];
    let y = 0;
    for (var i = 0; i < rowPerm.length; ++i) {
      let logicalRowIndex = rowPerm[i];
      positions.push(y);
      y += rowHeights[logicalRowIndex];
    }
    return positions;
  }

  isControlCell(colIndex) {
    return colIndex < this.numControlCols;
  }

  isAttributeCell(colIndex) {
    return colIndex >= this.numControlCols && colIndex < (this.numAttributeCols + this.numControlCols);
  }

  isLabelCell(colIndex) {
    return colIndex >= this.numAttributeCols + this.numControlCols &&
      colIndex < this.numAttributeCols + this.numControlCols + this.numLabelCols;
  }

  isDataCell(colIndex) {
    return !this.isControlCell(colIndex) && !this.isAttributeCell(colIndex) && !this.isLabelCell(colIndex);

  }

  onCellClicked(cell) {
    this.$log.log("cell clicked", cell, cell.getPathList());
  }

  onCellMouseOver(cell) {
    this.$log.log("cell hovered", cell, cell.getPathList(), cell.getGroup()[0][0]);
    let element = cell.getGroup()[0][0];
    let transform = UtilsD3.getAccumulatedTranslate(element, 1);
    console.log(transform);
    this.svg.append("rect")
      .attr("width", transform.translate[0] + this.colWidth)
      .attr("height", this.rowHeight)
      .attr("transform", "translate(0," + transform.translate[1] + ")")
      .attr("fill", "none")
      .attr("stroke", "black");

    this.$log.log(transform);
  }

  onCellMouseOut(cell) {
    console.log("mouseout");
  }

  /** Callback when user clicks on the column controls.
   * Updates width of the column and unrolls its children.
   */
  onColControlsClicked(colIndex, unrolling) {
    // Update width of the column
    if (unrolling) {
      let dataColIndex = this.getDataColIndex(colIndex);
      this.colWidths[colIndex] = (this.colNodeIndexes[dataColIndex].length + 1) * this.colWidths[colIndex];
    } else {
      this.colWidths[colIndex] = this.colWidth;
    }

    // Tell rows to unroll col.
    for (var i = 0; i < this.allRows.length; ++i) {
      if (unrolling) {
        this.allRows[i].unrollCol(colIndex, this.colWidth);
      } else {
        this.allRows[i].rollupCol(colIndex);
      }
    }

    // Update position of other cols.
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  /** Unroll the row.
   * Expands its height.
   */
  onRowControlsClicked(rowIndex) {
    this.rowHeights[rowIndex] = this.allRows[rowIndex].getCurrentHeight();
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  setEncoding(encoding) {
    let preprocessor = undefined;

    let visitor = new cmClearVisitor();
    this.applyVisitor(visitor);

    let cellWidth = this.colWidth - 2;
    let cellHeight = this.rowHeight - 2;

    let clicked = this.onCellClicked.bind(this);
    let mouseover = this.onCellMouseOver.bind(this);
    let mouseout = this.onCellMouseOut.bind(this);

    if (encoding == "bar chart") {
      preprocessor = new cmBarChartPreprocessor();
      this.applyVisitor(preprocessor);
      visitor = new cmBarChartVisitor(preprocessor, cellWidth, cellHeight);
      visitor.setCallbacks(clicked, mouseover, mouseout);
      this.applyVisitor(visitor);
      this.legend = undefined;
    } else if (encoding == "colormap") {
      preprocessor = new cmColorMapPreprocessor();
      this.applyVisitor(preprocessor);
      visitor = new cmColorMapVisitor(preprocessor, cellWidth, cellHeight);
      visitor.setCallbacks(clicked, mouseover, mouseout);
      this.applyVisitor(visitor);
      this.legend = new cmColorMapLegend(visitor);
    }
  }

  /** Used for externally setting sort orders.
   * rowPerm and colPerm get padded to account for headers rows/cols.
   */
  setSortOrders(rowPerm, colPerm) {
    let shiftedRowPerm = Utils.shiftPermutation(rowPerm, this.numHeaderRows);
    let shiftedColPerm = Utils.shiftPermutation(colPerm, this.numHeaderCols);
    this.updatePositions(shiftedRowPerm, shiftedColPerm);
  }

  /** Update positions of rows and columns in the table.
   * Used for reordering and unrolling.
   */
  updatePositions(rowPerm, colPerm) {
    this.rowPerm = rowPerm;
    let yPositions = cmMatrixView.getRowYPositions(this.rowPerm, this.rowHeights);
    this.rowInv = reorder.inverse_permutation(this.rowPerm);

    this.colPerm = colPerm;
    this.colInv = reorder.inverse_permutation(this.colPerm);
    let xPositions = cmMatrixView.getColXPositions(this.colPerm, this.colWidths);

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].setPosition(0, yPositions[this.rowInv[i]]);
      this.allRows[i].setColPositions(this.colInv, xPositions);
    }
  }

}

