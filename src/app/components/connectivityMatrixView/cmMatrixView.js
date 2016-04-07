import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmMatrixRow} from "./cmMatrixRow"
import {cmDataRow} from "./cmDataRow"
export class cmMatrixView extends SvgGroupElement {
  constructor(svg, model) {
    super(svg);
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = model.getColNodeIndexes();
    this.numHeaderCols = 3;
    this.numHeaderRows = 1;
    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];

    for (var i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      this.colWidths[i] = this.colWidth;
    }

    for (i = 0; i < this.rowNodeIndexes.length + this.numHeaderRows; ++i) {
      this.rowHeights[i] = this.rowHeight;
    }

    // Controls row is the only one with a onColControlsClicked callback.
    this.controlRow = new cmControlRow(svg, 0, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight);
    let callback = this.onColControlsClicked.bind(this);
    this.controlRow.setColClickCallback(callback);
    this.allRows.push(this.controlRow);

    /*
     this.labelRow = new cmMatrixRow(svg, 1, this.colNodeIndexes.length, this.colWidth, this.rowHeight);
     this.labelRow.setPosition(0, this.rowHeight);
     this.labelRow.setDebugVisible(true);
     */

    let modelRows = model.getCurrentRows();
    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmDataRow(svg, i + 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight, false, modelRows[i]);
      dataRow.setPosition(0, this.rowHeight * (i + 1));
      dataRow.setDebugVisible(true);
      if (modelRows[i].getNumChildren() > 0) {
        callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCol(this.colWidth, this.rowHeight, callback);
      }
      this.allRows.push(dataRow);
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
