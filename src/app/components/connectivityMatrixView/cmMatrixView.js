import {SvgGroupElement} from "./svgGroupElement"
import {ControlRow} from "./controlRow"
export class cmMatrixView extends SvgGroupElement {
  constructor(svg, colNodeIndexes) {
    super(svg);
    this.colWidth = 15;
    this.colHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = colNodeIndexes;
    this.controlRow = new ControlRow(svg, 0, colNodeIndexes, this.colWidth, this.colHeight);

    var callback = this.onColControlsClicked.bind(this);
    this.controlRow.setColClickCallback(callback);

    for (var i = 0; i < colNodeIndexes.length; ++i) {
      this.colWidths[i] = 15;
    }
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
  }
}
