import {cmMatrixBase} from "./cmMatrixBase"
import {cmControlsMatrixRow} from "./cmControlsMatrixRow"
import {cmEditAttributeRow} from "./cmEditAttributeRow"
import {cmControlsMatrixColHeaderRow} from "./cmControlsMatrixColHeaderRow"

export class cmControlsMatrix extends cmMatrixBase {

  /**
   * Create:
   *  - cmEditAttributeRow holds button that lets user select visible attribute rows
   *  - cmControlsMatrixRow holds col attribute labels
   *  - cmControlsMatrixColHeaderRow holds attribute col labels
   */
  createRows(model) {

    let colNodeAttributes = this.colNodeAttributes;
    let rowAttributes = this.rowNodeAttributes;

    // Controls row is the only one with a onColControlsClicked callback.
    let row = new cmEditAttributeRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
      this.rowHeight, model.areColsCollapsed, this);

    this.addRow(row, this.rowHeight);

    for (var i = 0; i < this.attributes.length; ++i) {
      row = new cmControlsMatrixRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols,
        this.colWidth, this.rowHeightAttr, false, colNodeAttributes[i], this, i, this.attributes[i],
        this.colAttributeNodeGroup);

      this.addRow(row, this.rowHeightAttr);
    }

    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    row = new cmControlsMatrixColHeaderRow(this.svg, this.allRows.length, this.colNodeIndexes,
      this.numHeaderCols, this.colWidth, this.labelRowHeight, majorColLabels, minorColLabels, this, this.attributes,
      this.rowNodeIndexes, this.rowAttributeNodeGroup, rowAttributes);

    this.addRow(row, this.labelRowHeight);
  }

}
