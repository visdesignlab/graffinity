import {cmMatrixBase} from "../cmMatrixBase"

export class cmNodeListBase extends cmMatrixBase {

  /**
   *
   */
  constructor(svg, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(svg, model, $log, $uibModal, scope, viewState, modalService, mainController);
    this.isNodeListView = true;
  }

  /**
   *
   */
  initAttributeData() {
    this.rowAttributes = this.model.getIntermediateNodeAttributeValues();
    this.rowNodeAttributes = this.model.getIntermediateRowNodeAttributeValues();
  }

  /**
   * Initializes this.row/col indexes.
   */
  initNodeIndexes(model) {
    this.rowAttributeNodeGroup = 2;
    this.rowNodeIndexes = model.getIntermediateNodeIndexes();
    this.colNodeIndexes = model.getIntermediateNodePositions();
  }

  /**
   * no-op
   */
  updateDataCols() {

  }
}
