import {cmMatrixBase} from "./cmMatrixBase"
import {cmControlRow} from "./cmControlRow"
import {cmLabelRow} from "./cmLabelRow"
import {cmAttributeRow} from "./cmAttributeRow"

export class cmMatrixTopHeader extends cmMatrixBase {

  constructor(svg, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(svg, model, $log, $uibModal, scope, viewState, modalService, mainController);

    this.colWidthAttr = 0;
    this.colWidthLabel = 0;
    this.colWidthControl = 0;

    this.setModel(model);
  }

  /**
   * Creates elements in the top of the matrix:
   *  - cmControlRow
   *  - cmAttributeRow
   *  - cmLabelRow
   */
  createRows(model) {
    // Populate the row/col node attributes.
    let colNodeAttributes = this.colNodeAttributes;

    // Controls row is the only one with a onColControlsClicked callback.
    let row = new cmControlRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
      this.rowHeight, model.areColsCollapsed, this);

    let callback = this.onColControlsClicked.bind(this);
    row.setColClickCallback(callback);
    this.addRow(row, this.rowHeight);

    for (let i = 0; i < this.attributes.length; ++i) {
      let attributeRow = new cmAttributeRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols,
        this.colWidth, this.rowHeightAttr, false, colNodeAttributes[i], this, i, this.attributes[i],
        this.colAttributeNodeGroup, model.areColsCollapsed);

      this.addRow(attributeRow, this.rowHeightAttr);
    }

    // Create the labels row
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();

    let labelRow = new cmLabelRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
      this.labelRowHeight, majorColLabels, minorColLabels, this, model.areColsCollapsed);

    this.addRow(labelRow, this.labelRowHeight);
  }

}