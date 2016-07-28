import {cmNodeListBase} from "./cmNodeListBase"
import {cmControlsMatrixColHeaderRow} from "../rows/cmControlsMatrixColHeaderRow"

export class cmNodeListControls extends cmNodeListBase {
  /**
   * Binds data to the svg matrix - this doesn't get filled in until setEncodings gets called.
   */
  createRows(model) {
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    let labelRow = new cmControlsMatrixColHeaderRow(this.svg,
      this.allRows.length,
      this.colNodeIndexes,
      this.numHeaderCols,
      this.colWidth,
      this.labelRowHeight,
      majorColLabels,
      minorColLabels,
      this,
      this.attributes,
      this.rowNodeIndexes,
      this.rowAttributeNodeGroup,
      this.rowAttributes);
    this.addRow(labelRow, this.labelRowHeight);
  }
}
