import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmMatrixRow} from "./cmMatrixRow"
export class cmMatrixView extends SvgGroupElement {
  constructor(svg, colNodeIndexes) {
    super(svg);
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = colNodeIndexes;
    this.controlRow = new cmControlRow(svg, 0, colNodeIndexes, this.colWidth, this.rowHeight);

    var callback = this.onColControlsClicked.bind(this);
    this.controlRow.setColClickCallback(callback);

    for (var i = 0; i < colNodeIndexes.length; ++i) {
      this.colWidths[i] = 15;
    }

    this.labelRow = new cmMatrixRow(svg, 1, colNodeIndexes.length, this.colWidth, this.rowHeight);
    this.labelRow.setPosition(0, this.rowHeight);
    this.labelRow.setDebugVisible(true);
  }

  onColControlsClicked(colIndex, unrolling) {
    if (unrolling) {
      this.colWidths[colIndex] = this.colNodeIndexes[colIndex].length * this.colWidths[colIndex];
    } else {
      this.colWidths[colIndex] = this.colWidth;
    }
    this.setSortOrders(this.colWidths);
  }

  setSortOrders(colWidths) {
    this.controlRow.setColWidths(colWidths);
    this.labelRow.setColWidths(colWidths);
  }
}
