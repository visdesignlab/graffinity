/*global reorder
 */
import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmLabelRow} from "./cmLabelRow"
import {cmDataRow} from "./cmDataRow"
import {cmAttributeRow} from "./cmAttributeRow"
import {cmScatterPlot1DVisitor} from "./visitors/cmScatterPlot1DVisitor"
import {cmScatterPlot1DPreprocessor} from "./visitors/cmScatterPlot1DVisitor"
import {cmColorMapPreprocessor} from "./visitors/cmColorMapVisitor"
import {cmColorMapVisitor} from "./visitors/cmColorMapVisitor"
import {cmColorMapLegend} from "./visitors/cmColorMapVisitor"
import {cmClearVisitor} from "./visitors/cmClearVisitor"
import {cmBarChartPreprocessor} from "./visitors/cmBarChartVisitor"
import {cmBarChartVisitor} from "./visitors/cmBarChartVisitor"
import {Utils} from "../utils/utils"

export class cmMatrixView extends SvgGroupElement {
  constructor(svg, model, $log) {
    super(svg);
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = model.getColNodeIndexes();
    this.numHeaderCols = 3;
    this.numHeaderRows = 3;
    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];
    this.selectedAttribute = "locations";
    this.rowPerm = reorder.permutation(this.numHeaderRows + this.rowNodeIndexes.length);
    this.colPerm = reorder.permutation(this.numHeaderCols + this.colNodeIndexes.length);

    let colNodeAttributes = model.getNodeAttrs(this.colNodeIndexes, this.selectedAttribute);
    let rowNodeAttributes = model.getNodeAttrs(this.rowNodeIndexes, this.selectedAttribute);

    for (var i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      this.colWidths[i] = this.colWidth;
    }
    this.colWidths[2] = 30;
    this.colWidths[1] = 80;

    this.$log = $log;

    // Controls row is the only one with a onColControlsClicked callback.
    let row = new cmControlRow(svg, 0, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight, model.areColsCollapsed);
    let callback = this.onColControlsClicked.bind(this);
    row.setColClickCallback(callback);
    this.addRow(row, this.rowHeight);

    let attributeRowHeight = 80;
    let attributeRow = new cmAttributeRow(svg, 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, attributeRowHeight, false, colNodeAttributes);
    this.addRow(attributeRow, attributeRowHeight);

    // Create the labels row
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    let labelRowHeight = 30;
    let labelRow = new cmLabelRow(svg, 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, labelRowHeight,
      majorColLabels, minorColLabels);
    this.addRow(labelRow, labelRowHeight);

    // Create each of the data rows!
    let modelRows = model.getCurrentRows();
    let majorRowLabels = model.getMajorRowLabels();
    let minorRowLabels = model.getMinorRowLabels();

    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmDataRow(svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
        this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i], rowNodeAttributes[i]);
      if (modelRows[i].getNumChildren() > 0) {
        callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCell(this.colWidth, this.rowHeight, callback);
      }
      this.addRow(dataRow, this.rowHeight);
    }

    this.setEncoding("colormap");

    // Visitor to create scatter plots in per-cell attributes
    let preprocessor = new cmScatterPlot1DPreprocessor();
    this.applyVisitor(preprocessor);
    let valueRange = preprocessor.getValueRange();
    let visitor = new cmScatterPlot1DVisitor(this.rowHeight / 4, valueRange);
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

  onCellClicked(cell) {
    this.$log.log("cell clicked", cell, cell.getPathList());
  }

  onCellHovered(cell) {
    this.$log.log("cell hovered", cell, cell.getPathList());
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
    let hovered = this.onCellHovered.bind(this);

    if (encoding == "bar chart") {
      preprocessor = new cmBarChartPreprocessor();
      this.applyVisitor(preprocessor);
      visitor = new cmBarChartVisitor(preprocessor, cellWidth, cellHeight);
      visitor.setCallbacks(clicked, hovered);
      this.applyVisitor(visitor);
      this.legend = undefined;
    } else if (encoding == "colormap") {
      preprocessor = new cmColorMapPreprocessor();
      this.applyVisitor(preprocessor);
      visitor = new cmColorMapVisitor(preprocessor, cellWidth, cellHeight);
      visitor.setCallbacks(clicked, hovered);
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

