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
    this.controlRow = new cmControlRow(svg, 0, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight);

    var callback = this.onColControlsClicked.bind(this);
    this.controlRow.setColClickCallback(callback);

    for (var i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      this.colWidths[i] = 15;
    }

    /*
     this.labelRow = new cmMatrixRow(svg, 1, this.colNodeIndexes.length, this.colWidth, this.rowHeight);
     this.labelRow.setPosition(0, this.rowHeight);
     this.labelRow.setDebugVisible(true);
     */

    let modelRows = model.getCurrentRows();
    this.dataRows = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      this.dataRows[i] = new cmDataRow(svg, i + 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight, false, modelRows[i]);
      this.dataRows[i].setPosition(0, this.rowHeight * (i + 1));
      this.dataRows[i].setDebugVisible(true);
      console.debug("Creating a major row with minor rows:", this.dataRows[i].getNumMinorRows());
    }

  }

  getDataColIndex(viewColIndex) {
    return viewColIndex - this.numHeaderCols;
  }

  onColControlsClicked(colIndex, unrolling) {
    if (unrolling) {
      let dataColIndex = this.getDataColIndex(colIndex);
      this.colWidths[colIndex] = this.colNodeIndexes[dataColIndex].length * this.colWidths[colIndex];
    } else {
      this.colWidths[colIndex] = this.colWidth;
    }
    this.setSortOrders(this.colWidths);
  }

  setSortOrders(colWidths) {
    this.controlRow.setColWidths(colWidths);
    //this.labelRow.setColWidths(colWidths);
    for (var i = 0; i < this.dataRows.length; ++i) {
      this.dataRows[i].setColWidths(colWidths);
    }
  }
}
