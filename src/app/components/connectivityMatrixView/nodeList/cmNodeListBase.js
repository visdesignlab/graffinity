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
    for (let i = 0; i < nodePositions.length; ++i) {
      this.colNodeIndexes.push([String(nodePositions[i])]);
    }
  }

  initAttributeState(model) {
    let attributes = model.getAvailableAttributes();
    this.attributes = attributes;

    // If this is the first time setModal has been called, then by default, set all attributes as hidden. Else, show
    // attributes that the user already selected.
    if (!this.isInitialized) {
      this.isAttributeColVisible = {};
      this.isAttributeRowVisible = {};
      for (var i = 0; i < attributes.length; ++i) {
        this.isAttributeColVisible[attributes[i]] = false;
        this.isAttributeRowVisible[attributes[i]] = false;
      }
    }

    this.isAttributeColVisible["num paths"] = true;
  }

  setModel(model) {
    this.model = model;
    if (model.getIntermediateNodeIndexes().length) {
      super.setModel(model);
      this.isActive = true;
    } else {
      this.model = model;
      this.isActive = false;
    }
  }

  /**
   * no-op
   */
  updateDataCols() {

  }
}
