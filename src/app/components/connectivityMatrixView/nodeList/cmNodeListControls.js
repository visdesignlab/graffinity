/*global reorder d3
 */

import {cmMatrixBase} from "../cmMatrixBase"
import {Utils} from "../../utils/utils"

import {cmControlsMatrixColHeaderRow} from "../cmControlsMatrixColHeaderRow"
export class cmNodeListControls extends cmMatrixBase {
  /**
   * Binds data to the svg matrix - this doesn't get filled in until setEncodings gets called.
   */
  createRows(model) {

    //// Populate the row/col node attributes.
    // rowNodeAttributes[i][j] = attributes[j] for row[i]
    // colNodeAttributes[i][j] = attributes[i] for col[j]
    let colNodeAttributes = [];
    let rowAttributes = [];
    for (var i = 0; i < this.attributes.length; ++i) {
      colNodeAttributes[i] = model.getNodeAttrs(this.colNodeIndexes, this.attributes[i]);
      rowAttributes[i] = model.getNodeAttrs(this.rowNodeIndexes, this.attributes[i]);
    }

    let rowNodeAttributes = rowAttributes[0];
    if (this.attributes.length > 1) {
      for (i = 1; i < this.attributes.length; ++i) {
        rowNodeAttributes = d3.zip(rowNodeAttributes, rowAttributes[i]);
      }
    } else {
      for (i = 0; i < rowNodeAttributes.length; ++i) {
        rowNodeAttributes[i] = [rowNodeAttributes[i]];
      }
    }

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
      rowAttributes);
    this.addRow(labelRow, this.labelRowHeight);
  }

  /**
   * Assigns this.rowNodeIndexes and this.colNodeIndexes their own attributeNodeGroups in the view state.
   */
  initAttributeNodeGroups() {
    this.viewState.setAttributeNodeGroup(Utils.getFlattenedLists(this.rowNodeIndexes), this.rowAttributeNodeGroup);
    this.viewState.setAttributeNodeGroup(Utils.getFlattenedLists(this.colNodeIndexes), this.colAttributeNodeGroup);
  }

  /**
   * Fills this.attributes with the model's quantitative attributes.
   * Creates this.isAttributeRow/Col visible.
   */
  initAttributeState(model) {
    let attributes = model.graph.getQuantNodeAttrNames();
    this.attributes = attributes;

    // If this is the first time setModal has been called, then by default, set all attributes as hidden. Else, show
    // attributes that the user already selected.
    if (!this.isInitialized) {
      this.isAttributeColVisible = {};
      this.isAttributeRowVisible = {};
      for (var i = 0; i < attributes.length; ++i) {
        this.isAttributeColVisible[attributes[i]] = true;
        this.isAttributeRowVisible[attributes[i]] = true;
      }
    }
  }

  /**
   * Fills this.isMajorColUnrolled, this.isMinorColVisible
   */
  initColStates() {
    this.isMajorColUnrolled = [];
    this.isMinorColVisible = [];
    for (let i = 0; i < this.numHeaderCols + this.colNodeIndexes.length; ++i) {
      this.isMajorColUnrolled[i] = false;
      this.isMinorColVisible[i] = [];
      if (this.isDataCell(i)) {
        let dataIndex = this.getDataColIndex(i);
        for (let j = 0; j < this.colNodeIndexes[dataIndex].length; ++j) {
          this.isMinorColVisible[i][j] = true;
        }
      }
    }
  }

  /**
   * Fills this.colWidths using the data/view/attribute indexes.
   */
  initColWidths() {
    for (let i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      if (this.isControlCell(i) || this.isDataCell(i)) {
        this.colWidths[i] = this.colWidth;
      } else if (this.isAttributeCell(i)) {
        this.colWidths[i] = this.colWidthAttr;
      } else if (this.isLabelCell(i)) {
        this.colWidths[i] = this.colWidthLabel;
      }
    }
  }

  /**
   * Initializes this.row/col indexes.
   */
  initNodeIndexes(model) {
    this.rowNodeIndexes = model.getIntermediateNodeIndexes();
    this.colNodeIndexes = [];
  }

  /**
   * Creates indexes for the data/header/attribute/label rows and cols.
   */
  initViewIndexes(attributes) {
    this.numControlCols = 1;
    this.numAttributeCols = attributes.length;
    this.numLabelCols = 1;
    this.numHeaderCols = this.numControlCols + this.numAttributeCols + this.numLabelCols;

    this.numControlRows = 1;
    this.numAttributeRows = attributes.length;
    this.numLabelRows = 1;
    this.numHeaderRows = this.numControlRows + this.numAttributeRows + this.numLabelRows;

    this.rowHeights = [];
    this.colWidths = [];
    this.allRows = [];
    this.rowPerm = reorder.permutation(this.numHeaderRows + this.rowNodeIndexes.length);
    this.colPerm = reorder.permutation(this.numHeaderCols + this.colNodeIndexes.length);
  }

  /**
   * Update the attributes so that the previous state attributes are displayed. This assumes the model's attributes
   * do not change between queries.
   */
  updateAttributeView() {
    for (var i = 0; i < this.attributes.length; ++i) {
      if (!this.isAttributeColVisible[this.attributes[i]]) {
        this.onHideAttributeCol(i, true, true);
      }
      if (!this.isAttributeRowVisible[this.attributes[i]]) {
        this.onHideAttributeRow(i, true, true);
      }
    }
  }
}
