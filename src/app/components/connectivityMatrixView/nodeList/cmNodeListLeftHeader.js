import {cmMatrixBase} from "../cmMatrixBase"
import {cmNodeListRow} from "./cmNodeListRow"
import {cmMatrixRow} from "../cmMatrixRow"

export class cmNodeListLeftHeader extends cmMatrixBase {

  /**
   * Binds data to the svg matrix - this doesn't get filled in until setEncodings gets called.
   */
  createRows(model) {

    // Populate the row/col node attributes.
    // rowNodeAttributes[i][j] = attributes[j] for row[i]
    // colNodeAttributes[i][j] = attributes[i] for col[j]
    for (var i = 0; i < this.numHeaderCols; ++i) {
      this.addRow(new cmMatrixRow(this.svg, i, [], this.numHeaderCols), 0);
    }

    let rowAttributes = [];
    for (i = 0; i < this.attributes.length - 1; ++i) {
      rowAttributes[i] = model.getNodeAttrs(this.rowNodeIndexes, this.attributes[i]);
    }

    let countRows = model.getCurrentIntermediateNodeRows();
    let countRowsList = [];
    for (i = 0; i < countRows.length; ++i) {
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

    //// Controls row is the only one with a onColControlsClicked callback.
    //let row = new cmControlRow(this.svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
    //  this.rowHeight, model.areColsCollapsed, this);

    //let callback = this.onColControlsClicked.bind(this);
    //row.setColClickCallback(callback);
    //this.addRow(row, this.rowHeight);

    //for (i = 0; i < this.attributes.length; ++i) {
    //  let attributeRow = new cmAttributeRow(this.svg,
    //    this.allRows.length,
    //    this.colNodeIndexes,
    //    this.numHeaderCols,
    //    this.colWidth,
    //    this.rowHeightAttr,
    //    false,
    //    colNodeAttributes[i],
    //    this,
    //    i,
    //    this.attributes[i],
    //    this.colAttributeNodeGroup
    //  );
    //
    //  this.addRow(attributeRow, this.rowHeightAttr);
    //}
    //
    //// Create the labels row
    //let majorColLabels = model.getMajorColLabels();
    //let minorColLabels = model.getMinorColLabels();
    //let labelRow = new cmLabelRow(this.svg,
    //  this.allRows.length,
    //  this.colNodeIndexes,
    //  this.numHeaderCols,
    //  this.colWidth,
    //  this.labelRowHeight,
    //  majorColLabels,
    //  minorColLabels,
    //  this,
    //  this.attributes,
    //  this.rowNodeIndexes,
    //  this.rowAttributeNodeGroup,
    //  rowAttributes);
    //this.addRow(labelRow, this.labelRowHeight);

    // Create each of the data rows!
    let modelRows = model.getCurrentIntermediateNodeRows();
    let majorRowLabels = model.getMajorLabels(model.getIntermediateNodeIndexes());
    let minorRowLabels = model.getMinorRowLabels();

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
        this.isAttributeRowVisible[attributes[i]] = false;
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
    this.colNodeIndexes = model.getAvailableIntermediateNodeStats();
  }
}
