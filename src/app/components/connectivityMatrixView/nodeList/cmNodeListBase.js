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
    this.rowAttributeNodeGroup = model.AttributeNodeGroups.INTERMEDIATE;
    this.colAttributeNodeGroup = Object.keys(model.AttributeNodeGroups).length;
    this.attributeNodeGroupsBeingDisplayed = [this.rowAttributeNodeGroup, this.colAttributeNodeGroup];
    this.rowNodeIndexes = model.getIntermediateNodeIndexes();
    let nodePositions = model.getIntermediateNodePositions();
    this.colNodeIndexes = [];
    for(let i=0; i<nodePositions.length; ++i) {
      this.colNodeIndexes.push([String(nodePositions[i])]);
    }
  }

  /**
   * no-op
   */
  updateDataCols() {

  }
}
