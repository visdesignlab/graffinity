import {cmMatrixBase} from "./cmMatrixBase"
import {cmDataAttributeRow} from "./rows/cmDataAttributeRow"
import {cmMatrixRow} from "./rows/cmMatrixRow"

export class cmMatrixLeftHeader extends cmMatrixBase {

  constructor(svg, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(svg, model, $log, $uibModal, scope, viewState, modalService, mainController);

    this.labelRowHeight = 0;
    this.rowHeightAttr = 0;

    this.setModel(model);
  }

  /**
   * Creates (empty) cmMatrixRows and cmDataAttributeRows
   */
  createRows(model) {

    // Creates empty rows
    // TODO - optimize this to remove empty svg elements.
    for (var i = 0; i < this.numHeaderCols; ++i) {
      this.addRow(new cmMatrixRow(this.svg, i, [], this.numHeaderCols), 0);
    }

    let rowNodeAttributes = this.rowNodeAttributes;

    // Create each of the data rows!
    let modelRows = model.getCurrentRows();
    let majorRowLabels = model.getMajorRowLabels();
    let minorRowLabels = model.getMinorRowLabels();

    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let row = new cmDataAttributeRow(this.svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols,
        this.colWidth, this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i], rowNodeAttributes[i],
        this, this.rowAttributeNodeGroup, model.areColsCollapsed, model.areRowsCollapsed);

      // If row has minor rows, then we want the controls to be visible!
      if (model.areRowsCollapsed) {
        let callback = this.onRowControlsClicked.bind(this);
        row.createControlsCell(this.colWidth, this.rowHeight, callback);
      }

      row.setLabelColWidth(this.colWidthLabel);
      this.addRow(row, this.rowHeight);
    }
  }

}
