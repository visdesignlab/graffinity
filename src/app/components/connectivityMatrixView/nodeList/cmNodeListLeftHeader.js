import {cmNodeListBase} from "./cmNodeListBase"
import {cmNodeListRow} from "./cmNodeListRow"
import {cmMatrixRow} from "../rows/cmMatrixRow"

export class cmNodeListLeftHeader extends cmNodeListBase {

  constructor(svg, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(svg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.setModel(model);
  }
  /**
   * Creates empty rows at top of the matrix
   * Creates rows using the intermediate node row indexes
   */
  createRows(model) {

    // Create empty rows at the top.
    for (var i = 0; i < this.numHeaderCols; ++i) {
      this.addRow(new cmMatrixRow(this.svg, i, [], this.numHeaderCols), 0);
    }

    // Create each of the data rows!
    let modelRows = model.getCurrentIntermediateNodeRows();
    let majorRowLabels = model.getMajorLabels(model.getIntermediateNodeIndexes());
    let minorRowLabels = model.getMinorRowLabels();
    let rowNodeAttributes = this.rowNodeAttributes;
    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmNodeListRow(this.svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
        this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i], rowNodeAttributes[i], this, this.rowAttributeNodeGroup);

      // If row has minor rows, then we want the controls to be visible!
      if (modelRows[i].getNumChildren() > 0) {
        let callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCell(this.colWidth, this.rowHeight, callback);
      }

      dataRow.setLabelColWidth(this.colWidthLabel);
      this.addRow(dataRow, this.rowHeight);
    }
  }
}
