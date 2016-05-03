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
    this.highlights = [];

    this.numControlRows = 1;
    this.numAttributeRows = attributes.length;
    this.numLabelRows = 1;
    this.numHeaderRows = this.numControlRows + this.numAttributeRows + this.numLabelRows;

    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];
    this.rowPerm = reorder.permutation(this.numHeaderRows + this.rowNodeIndexes.length);
    this.colPerm = reorder.permutation(this.numHeaderCols + this.colNodeIndexes.length);
    this.model = model;

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

    this.rowHeightAttr = 80;
    for (i = 0; i < attributes.length; ++i) {
      let attributeRow = new cmAttributeRow(svg,
        this.allRows.length,
        this.colNodeIndexes,
        this.numHeaderCols,
        this.colWidth,
        this.rowHeightAttr,
        false,
        colNodeAttributes[i],
        this,
        i, attributes[i]);

      this.addRow(attributeRow, this.rowHeightAttr);
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
      dataRow.setLabelColWidth(this.colWidthLabel);
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

    let sortRows = this.onSortRowsByAttribute.bind(this);
    let sortCols = this.onSortColsByAttribute.bind(this);
    let hideRows = this.hideRow.bind(this);
    let hideCols = this.hideCol.bind(this);
    visitor = new cmAttributeLabelVisitor(this.colWidthAttr, this.rowHeight, sortRows, sortCols, hideRows, hideCols);
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

  /**
   * Returns transform of cell in this.svg's coordinate system.
   * Accumulates transforms of the cells ancestors, depending on how deep the cell is in the tree.
   */
  static getCellTransform(cell) {
    let transform = {};
    let element = cell.getGroup()[0][0];
    if (cell.isMajorCell && cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 1);
    } else if (cell.isMajorCell && !cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 3);
    } else if (!cell.isMajorCell && cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 2);
    } else if (!cell.isMajorCell && !cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 4);
    }
    return transform;
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

  static getHeight(rowPerm, rowHeights) {
    let y = 0;
    for (var i = 0; i < rowPerm.length; ++i) {
      let logicalRowIndex = rowPerm[i];
      y += rowHeights[logicalRowIndex];
    }
    return y;
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

  static getWidth(colPerm, colWidths) {
    let x = 0;
    for (var i = 0; i < colWidths.length; ++i) {
      let logicalColIndex = colPerm[i];
      x += colWidths[logicalColIndex];
    }
    return x;
  }

  hideCol(colIndex) {
    this.colWidths[colIndex] = 0;

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].majorCells[colIndex].setVisible(false);
    }

    this.updatePositions(this.rowPerm, this.colPerm);
  }

  hideRow(rowIndex) {
    this.allRows[rowIndex].setVisible(false);
    this.rowHeights[rowIndex] = 0;
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  showCol(colIndex) {
    if (this.isAttributeCell(colIndex)) {
      this.colWidths[colIndex] = this.colWidthAttr;
    }

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].majorCells[colIndex].setVisible(true);
    }

    this.updatePositions(this.rowPerm, this.colPerm);
  }

  showRow(rowIndex) {
    this.allRows[rowIndex].setVisible(true);
    if (this.isAttributeRow) {
      this.rowHeights[rowIndex] = this.rowHeightAttr;
    }
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  isControlCell(colIndex) {
    return colIndex < this.numControlCols;
  }

  isControlRow(rowIndex) {
    return rowIndex < this.numControlRows;
  }

  isAttributeCell(colIndex) {
    return colIndex >= this.numControlCols && colIndex < (this.numAttributeCols + this.numControlCols);
  }

  isAttributeRow(rowIndex) {
    return rowIndex >= this.numControlRows && rowIndex < (this.numAttributeRows + this.numControlRows);
  }

  isLabelCell(colIndex) {
    return colIndex >= this.numAttributeCols + this.numControlCols &&
      colIndex < this.numAttributeCols + this.numControlCols + this.numLabelCols;
  }

  isLabelRow(rowIndex) {
    return rowIndex >= this.numAttributeRows + this.numControlRows &&
      rowIndex < this.numAttributeRows + this.numControlRows + this.numLabelRows;
  }

  isDataCell(colIndex) {
    return !this.isControlCell(colIndex) && !this.isAttributeCell(colIndex) && !this.isLabelCell(colIndex);
  }

  isDataRow(rowIndex) {
    return !this.isControlRow(rowIndex) && !this.isAttributeRow(rowIndex) && !this.isLabelRow(rowIndex);
  }

  onCellClicked(cell) {
    this.$log.log("cell clicked", cell, cell.getPathList());
  }

  onCellMouseOver(cell) {

    // If first time, then create highlight rectangles.
    if (this.highlights.length == 0) {
      this.highlights[0] = this.svg.append("rect")
        .classed("matrix-view-highlight-rect", true);
      this.highlights[1] = this.svg.append("rect")
        .classed("matrix-view-highlight-rect", true);
    } else {
      this.highlights.forEach(function (highlight) {
        highlight.style("display", "block");
      });
    }

    // Position highlight rectangles.
    let width = cmMatrixView.getWidth(this.colPerm, this.colWidths);
    let height = cmMatrixView.getHeight(this.rowPerm, this.rowHeights);
    let transform = cmMatrixView.getCellTransform(cell);

    this.highlights[0]
      .attr("width", width)
      .attr("height", this.rowHeight)
      .attr("transform", "translate(0," + transform.translate[1] + ")");

    this.highlights[1]
      .attr("width", this.colWidth)
      .attr("height", height)
      .attr("transform", "translate(" + transform.translate[0] + ",0)");
  }

  onCellMouseOut() {
    // Hide highlights.
    this.highlights.forEach(function (highlight) {
      highlight.style("display", "none");
    });
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

  onSortRowsByAttribute(attribute, ascending) {
    let rowPerm = this.model.getRowsSortedByAttr(attribute, ascending);
    let shiftedRowPerm = Utils.shiftPermutation(rowPerm, this.numHeaderRows);
    this.updatePositions(shiftedRowPerm, this.colPerm);
  }

  onSortColsByAttribute(attribute, ascending) {
    let colPerm = this.model.getColsSortedByAttr(attribute, ascending);
    let shiftedColPerm = Utils.shiftPermutation(colPerm, this.numHeaderCols);
    this.updatePositions(this.rowPerm, shiftedColPerm);
  }

  setEncoding(encoding) {
    let preprocessor = undefined;

    let visitor = new cmClearVisitor();
    this.applyVisitor(visitor);

    let cellWidth = this.colWidth;
    let cellHeight = this.rowHeight;

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

