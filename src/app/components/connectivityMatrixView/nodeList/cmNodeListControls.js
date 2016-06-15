import {cmMatrixBase} from "../cmMatrixBase"
import {cmControlsMatrixColHeaderRow} from "../rows/cmControlsMatrixColHeaderRow"

export class cmNodeListControls extends cmMatrixBase {
  /**
   * Binds data to the svg matrix - this doesn't get filled in until setEncodings gets called.
   */
  createRows(model) {

    //// Populate the row/col node attributes.
    // rowNodeAttributes[i][j] = attributes[j] for row[i]
    // colNodeAttributes[i][j] = attributes[i] for col[j]

    let rowAttributes = [];
    for (i = 0; i < this.attributes.length - 1; ++i) {
      rowAttributes[i] = model.getNodeAttrs(this.rowNodeIndexes, this.attributes[i]);
    }

    let countRows = model.getCurrentIntermediateNodeRows();
    let countRowsList = [];
    for (var i = 0; i < countRows.length; ++i) {
      countRowsList.push(countRows[i].getAllValuesAsList([['count']])[0]);
    }
    rowAttributes[2] = countRowsList;


    let rowNodeAttributes = [];
    if (this.attributes.length > 1) {
      for (i = 0; i < this.attributes.length; ++i) {
        for (var j = 0; j < rowAttributes[i].length; ++j) {
          if (rowNodeAttributes[j]) {
            rowNodeAttributes[j] = rowNodeAttributes[j].concat([rowAttributes[i][j]]);
          } else {
            rowNodeAttributes[j] = [rowAttributes[i][j]];
          }
        }

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
   * Fills this.attributes with the model's quantitative attributes.
   * Creates this.isAttributeRow/Col visible.
   */
  initAttributeState(model) {
    let attributes = model.graph.getQuantNodeAttrNames().concat(["count"]);
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

  initAttributeData() {

  }


  /**
   * Initializes this.row/col indexes.
   */
  initNodeIndexes(model) {
    this.rowNodeIndexes = model.getIntermediateNodeIndexes();
    this.colNodeIndexes = [];
  }
}
