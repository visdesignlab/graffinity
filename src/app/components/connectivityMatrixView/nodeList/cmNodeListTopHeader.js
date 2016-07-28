import {cmNodeListBase} from "./cmNodeListBase"
import {cmLabelRow} from "../rows/cmLabelRow"
import {cmAttributeRow} from "../rows/cmAttributeRow"

import {cmMatrixRow} from "../rows/cmMatrixRow"
export class cmNodeListTopHeader extends cmNodeListBase {

  constructor(svg, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(svg, model, $log, $uibModal, scope, viewState, modalService, mainController);

    this.colWidthAttr = 0;
    this.colWidthLabel = 0;
    this.colWidthControl = 0;

    this.setModel(model);
  }

  /**
   * Creates elements in the top of the matrix.
   * This will eventually need to override createAttributeEncodings for the columnLabels
   */
  createRows(model) {
    // Populate the row/col node attributes.

    // No controls row
    this.addRow(new cmMatrixRow(this.svg, 0, [], this.numHeaderCols), 0);

    // No attribute rows
    for (let i = 0; i < this.attributes.length; ++i) {
      this.addRow(new cmMatrixRow(this.svg, i, [], this.numHeaderCols), 0);
    }

    // Create the labels row
    let majorColLabels = model.getIntermediateNodePositions();
    let minorColLabels = model.getIntermediateNodePositions();

    let labelRow = new cmLabelRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
      this.labelRowHeight, majorColLabels, null, this, 3, false);

    this.addRow(labelRow, this.labelRowHeight);
  }

}
