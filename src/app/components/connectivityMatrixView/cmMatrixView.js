import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmLabelRow} from "./cmLabelRow"
import {cmDataRow} from "./cmDataRow"
import {cmCellVisitor} from "./cmCellVisitors"
export class cmMatrixView extends SvgGroupElement {
  constructor(svg, model) {
    super(svg);
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = model.getColNodeIndexes();
    this.numHeaderCols = 3;
    this.numHeaderRows = 2;
    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];

    for (var i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      this.colWidths[i] = this.colWidth;
    }

    for (i = 0; i < this.rowNodeIndexes.length + this.numHeaderRows; ++i) {
      this.rowHeights[i] = this.rowHeight;
    }
    this.rowHeights[1] = 40;

    // Controls row is the only one with a onColControlsClicked callback.
    this.controlRow = new cmControlRow(svg, 0, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight);
    let callback = this.onColControlsClicked.bind(this);
    this.controlRow.setColClickCallback(callback);
    this.allRows.push(this.controlRow);

    // Create the labels row
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    this.labelRow = new cmLabelRow(svg, 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeights[1],
      majorColLabels, minorColLabels);
    this.labelRow.setPosition(0, this.rowHeights[0]);
    this.allRows.push(this.labelRow);

    // Create each of the data rows!
    let modelRows = model.getCurrentRows();
    let majorRowLabels = model.getMajorRowLabels();
    let minorRowLabels = model.getMinorRowLabels();
    let y = this.rowHeights[0] + this.rowHeights[1];
    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmDataRow(svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i]);
      dataRow.setPosition(0, y);
      dataRow.setDebugVisible(true);
      if (modelRows[i].getNumChildren() > 0) {
        callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCell(this.colWidth, this.rowHeight, callback);
      }
      this.allRows.push(dataRow);
      y += this.rowHeights[i + 2];
    }

    // Visitor will set colors of all the cells.
    let visitor = new cmCellVisitor();
    for (i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].apply(visitor);
    }
  }

  getDataColIndex(viewColIndex) {
    return viewColIndex - this.numHeaderCols;
  }

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
    this.setSortOrders(this.colWidths, this.rowHeights);
  }

  onRowControlsClicked(rowIndex) {
    this.rowHeights[rowIndex] = this.allRows[rowIndex].getCurrentHeight();
    this.setSortOrders(this.colWidths, this.rowHeights);
  }

  setSortOrders(colWidths, rowHeights) {
    let y = 0;
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].setColWidths(colWidths);
      this.allRows[i].setPosition(0, y);
      y += rowHeights[i];

    }
  }
}

