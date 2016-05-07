/*global reorder, d3
 */
import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmLabelRow} from "./cmLabelRow"
import {cmDataRow} from "./cmDataRow"
import {cmAttributeRow} from "./cmAttributeRow"
import {cmAttributeLabelVisitor} from "./visitors/cmAttributeLabelVisitor"
import {cmScatterPlot1DVisitor} from "./visitors/cmScatterPlot1DVisitor"
import {cmScatterPlot1DPreprocessor} from "./visitors/cmScatterPlot1DVisitor"
import {cmColorMapPreprocessor} from "./visitors/cmColorMapVisitor"
import {cmColorMapVisitor} from "./visitors/cmColorMapVisitor"
import {cmColorMapLegend} from "./visitors/cmColorMapVisitor"
import {cmClearVisitor} from "./visitors/cmClearVisitor"
import {cmBarChartPreprocessor} from "./visitors/cmBarChartVisitor"
import {cmBarChartVisitor} from "./visitors/cmBarChartVisitor"
import {cmEditVisibleAttributesVisitor} from "./visitors/cmEditVisibleAttributesVisitor"
import {Utils} from "../utils/utils"
import {UtilsD3} from "../utils/utilsd3"

export class cmMatrixView extends SvgGroupElement {
  constructor(svg, model, $log, $uibModal, scope, viewState) {
    super(svg);
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.$scope = scope;
    this.viewState = viewState;
    this.$log.debug(this.$scope, this.viewState);

    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = model.getColNodeIndexes();
    this.svg = svg;

    let attributes = ['area', 'locations'];
    this.attributes = attributes;
    this.numControlCols = 1;

    this.isAttributeColVisible = {};
    this.isAttributeRowVisible = {};
    for (var i = 0; i < attributes.length; ++i) {
      this.isAttributeColVisible[attributes[i]] = true;
      this.isAttributeRowVisible[attributes[i]] = true;
    }

    this.numAttributeCols = attributes.length;
    this.numLabelCols = 1;
    this.numHeaderCols = this.numControlCols + this.numAttributeCols + this.numLabelCols;
    this.highlights = [];

    this.numControlRows = 1;
    this.numAttributeRows = attributes.length;
    this.numLabelRows = 1;
    this.numHeaderRows = this.numControlRows + this.numAttributeRows + this.numLabelRows;

    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];
    this.rowPerm = reorder.permutation(this.numHeaderRows + this.rowNodeIndexes.length);
    this.colPerm = reorder.permutation(this.numHeaderCols + this.colNodeIndexes.length);
    this.model = model;

    // Create state for whether cols are unrolled and visible.
    this.isMajorColUnrolled = [];
    this.isMinorColVisible = [];
    for (i = 0; i < this.numHeaderCols + this.colNodeIndexes.length; ++i) {
      this.isMajorColUnrolled[i] = false;
      this.isMinorColVisible[i] = [];
      if (this.isDataCell(i)) {
        let dataIndex = this.getDataColIndex(i);
        for (var j = 0; j < this.colNodeIndexes[dataIndex].length; ++j) {
          this.isMinorColVisible[i][j] = true;
        }
      }
    }

    // Populate the row/col node attributes.
    // rowNodeAttributes[i][j] = attributes[j] for row[i]
    // colNodeAttributes[i][j] = attributes[i] for col[j]
    let colNodeAttributes = [];
    let rowAttributes = [];
    for (i = 0; i < attributes.length; ++i) {
      colNodeAttributes[i] = model.getNodeAttrs(this.colNodeIndexes, attributes[i]);
      rowAttributes[i] = model.getNodeAttrs(this.rowNodeIndexes, attributes[i]);
    }

    let rowNodeAttributes = rowAttributes[0];
    if (attributes.length > 1) {
      for (i = 1; i < attributes.length; ++i) {
        rowNodeAttributes = d3.zip(rowNodeAttributes, rowAttributes[i]);
      }
    } else {
      for (i = 0; i < rowNodeAttributes.length; ++i) {
        rowNodeAttributes[i] = [rowNodeAttributes[i]];
      }
    }

    this.colWidthAttr = 80;
    this.colWidthLabel = 30;
    for (i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      if (this.isControlCell(i) || this.isDataCell(i)) {
        this.colWidths[i] = this.colWidth;
      } else if (this.isAttributeCell(i)) {
        this.colWidths[i] = this.colWidthAttr;
      } else if (this.isLabelCell(i)) {
        this.colWidths[i] = this.colWidthLabel;
      }
    }


    // Controls row is the only one with a onColControlsClicked callback.
    let row = new cmControlRow(svg, this.allRows.length, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
      this.rowHeight, model.areColsCollapsed, this);

    let callback = this.onColControlsClicked.bind(this);
    row.setColClickCallback(callback);
    this.addRow(row, this.rowHeight);

    this.rowHeightAttr = 80;
    for (i = 0; i < attributes.length; ++i) {
      let attributeRow = new cmAttributeRow(svg,
        this.allRows.length,
        this.colNodeIndexes,
        this.numHeaderCols,
        this.colWidth,
        this.rowHeightAttr,
        false,
        colNodeAttributes[i],
        this,
        i, attributes[i]);

      this.addRow(attributeRow, this.rowHeightAttr);
    }

    // Create the labels row
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    let labelRowHeight = 30;
    let labelRow = new cmLabelRow(svg,
      this.allRows.length,
      this.colNodeIndexes,
      this.numHeaderCols,
      this.colWidth,
      labelRowHeight,
      majorColLabels,
      minorColLabels,
      this,
      attributes);
    this.addRow(labelRow, labelRowHeight);

    // Create each of the data rows!
    let modelRows = model.getCurrentRows();
    let majorRowLabels = model.getMajorRowLabels();
    let minorRowLabels = model.getMinorRowLabels();

    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmDataRow(svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
        this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i], rowNodeAttributes[i], this);

      // If row has minor rows, then we want the controls to be visible!
      if (modelRows[i].getNumChildren() > 0) {
        callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCell(this.colWidth, this.rowHeight, callback);
      }

      dataRow.setLabelColWidth(this.colWidthLabel);
      this.addRow(dataRow, this.rowHeight);
    }

    // Data is all set. Now create encodings and controls.
    this.setEncoding("colormap");
    this.createAttributeEncodings();

    // Put stuff in the correct place.
    this.updatePositions(this.rowPerm, this.colPerm);
    this.connectToViewState(this.$scope);
  }

  addRow(row, rowHeight) {
    let y = 0;
    for (var i = 0; i < this.allRows.length; ++i) {
      y += this.rowHeights[i];
    }
    row.setPosition(0, y);
    this.allRows.push(row);
    this.rowHeights.push(rowHeight);
  }

  applyVisitor(visitor) {
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].apply(visitor);
    }
  }

  createAttributeEncodings() {
    // Create visual encodings for all the quantitative attributes.
    let visitor = null;
    for (var i = 0; i < this.attributes.length; ++i) {
      let preprocessor = new cmScatterPlot1DPreprocessor(i);
      this.applyVisitor(preprocessor);
      let valueRange = preprocessor.getValueRange();
      visitor = new cmScatterPlot1DVisitor(i, this.rowHeight / 4, valueRange);
      this.applyVisitor(visitor);
    }

    // Create controls for all attributes.
    let sortRows = this.onSortRowsByAttribute.bind(this);
    let sortCols = this.onSortColsByAttribute.bind(this);
    let hideRows = this.onHideAttributeRow.bind(this);
    let hideCols = this.onHideAttributeCol.bind(this);
    visitor = new cmAttributeLabelVisitor(this.colWidthAttr, this.rowHeight, sortRows, sortCols, hideRows, hideCols);
    this.applyVisitor(visitor);

    // Create controls for editing visible attributes.
    let editAttributeCols = this.onEditVisibleAttributeCols.bind(this);
    let editAttributeRows = this.onEditVisibleAttributeRows.bind(this);
    visitor = new cmEditVisibleAttributesVisitor(this.colWidth, this.rowHeight, editAttributeRows, editAttributeCols);
    this.applyVisitor(visitor);
  }

  /**
   * Connects this to signals broadcast by the global scope.
   */
  connectToViewState(scope) {
    let onHideNodes = this.onHideNodes.bind(this);
    let onShowNodes = this.onShowNodes.bind(this);
    scope.$on("hideNodes", onHideNodes);
    scope.$on("showNodes", onShowNodes);
  }

  getAttributeColIndex(viewColIndex) {
    return viewColIndex - this.numControlCols;
  }

  static getAvailableEncodings() {
    return ["colormap", "bar chart"];
  }

  /**
   * Returns transform of cell in this.svg's coordinate system.
   * Accumulates transforms of the cells ancestors, depending on how deep the cell is in the tree.
   */
  static getCellTransform(cell) {
    let transform = {};
    let element = cell.getGroup()[0][0];
    if (cell.isMajorCell && cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 1);
    } else if (cell.isMajorCell && !cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 3);
    } else if (!cell.isMajorCell && cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 2);
    } else if (!cell.isMajorCell && !cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 4);
    }
    return transform;
  }

  static getColXPositions(colPerm, colWidths) {
    let positions = [];
    let x = 0;
    for (var i = 0; i < colWidths.length; ++i) {
      let logicalColIndex = colPerm[i];
      positions.push(x);
      x += colWidths[logicalColIndex];
    }
    return positions;
  }

  getColWidth(colIndex, unrolled) {
    if (unrolled) {
      let numVisibleMinorCells = this.getNumVisibleMinorCells(colIndex);
      return (numVisibleMinorCells + 1) * this.colWidth; // +1 is for the width of the major cells
    } else {
      return this.colWidth;
    }
  }

  getDataColIndex(viewColIndex) {
    return viewColIndex - this.numHeaderCols;
  }

  getDataRowIndex(viewRowIndex) {
    return viewRowIndex - this.numHeaderRows;
  }

  getNumVisibleMinorCells(colIndex) {
    console.log("matrixview - getNumVisibleMinorCells");
    console.log(this.isMinorColVisible[colIndex]);
    let isMinorColVisible = this.isMinorColVisible[colIndex];
    let numVisibleMinorCols = 0;
    for (var i = 0; i < isMinorColVisible.length; ++i) {
      if (isMinorColVisible[i]) {
        numVisibleMinorCols += 1;
      }
    }
    return numVisibleMinorCols;
  }

  // TODO - review this. flatten into getNumVisibleMinorCells ?
  getFirstDataRowIndex() {
    return this.numControlRows + this.numAttributeRows + this.numLabelRows;
  }

  static getHeight(rowPerm, rowHeights) {
    let y = 0;
    for (var i = 0; i < rowPerm.length; ++i) {
      let logicalRowIndex = rowPerm[i];
      y += rowHeights[logicalRowIndex];
    }
    return y;
  }

  static getRowYPositions(rowPerm, rowHeights) {
    let positions = [];
    let y = 0;
    for (var i = 0; i < rowPerm.length; ++i) {
      let logicalRowIndex = rowPerm[i];
      positions.push(y);
      y += rowHeights[logicalRowIndex];
    }
    return positions;
  }

  getViewIndexFromAttributeIndex(attributeIndex) {
    return attributeIndex + this.numControlCols;
  }

  getViewColIndexFromDataIndex(dataColIndex) {
    return dataColIndex + this.numHeaderCols;
  }

  static getWidth(colPerm, colWidths) {
    let x = 0;
    for (var i = 0; i < colWidths.length; ++i) {
      let logicalColIndex = colPerm[i];
      x += colWidths[logicalColIndex];
    }
    return x;
  }

  hideCol(colIndex) {
    this.colWidths[colIndex] = 0;

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].majorCells[colIndex].setVisible(false);
    }

    this.updatePositions(this.rowPerm, this.colPerm);
  }

  hideMinorCol(colIndex, minorColIndex) {
    console.log("hiding minor col");
    this.isMinorColVisible[colIndex][minorColIndex] = false;

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].hideMinorCol(colIndex, minorColIndex, this.colWidth, this.isMajorColUnrolled[colIndex], this.isMinorColVisible);
    }

    if (this.isMajorColUnrolled[colIndex]) {
      this.colWidths[colIndex] = this.getColWidth(colIndex, true);
      this.updatePositions(this.rowPerm, this.colPerm);
    }
  }

  hideRow(rowIndex) {
    this.allRows[rowIndex].setVisible(false);
    this.rowHeights[rowIndex] = 0;
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  isAttributeCell(colIndex) {
    return colIndex >= this.numControlCols && colIndex < (this.numAttributeCols + this.numControlCols);
  }

  isAttributeRow(rowIndex) {
    return rowIndex >= this.numControlRows && rowIndex < (this.numAttributeRows + this.numControlRows);
  }

  isControlCell(colIndex) {
    return colIndex < this.numControlCols;
  }

  isControlRow(rowIndex) {
    return rowIndex < this.numControlRows;
  }

  isDataCell(colIndex) {
    return !this.isControlCell(colIndex) && !this.isAttributeCell(colIndex) && !this.isLabelCell(colIndex);
  }

  isDataRow(rowIndex) {
    return !this.isControlRow(rowIndex) && !this.isAttributeRow(rowIndex) && !this.isLabelRow(rowIndex);
  }

  isLabelCell(colIndex) {
    return colIndex >= this.numAttributeCols + this.numControlCols &&
      colIndex < this.numAttributeCols + this.numControlCols + this.numLabelCols;
  }

  isMajorCellUnrolled(colIndex) {
    let rowIndex = this.getFirstDataRowIndex();
    let row = this.allRows[rowIndex];
    return row.isMajorCellUnrolled[colIndex];
  }

  isLabelRow(rowIndex) {
    return rowIndex >= this.numAttributeRows + this.numControlRows &&
      rowIndex < this.numAttributeRows + this.numControlRows + this.numLabelRows;
  }

  onCellClicked(cell) {
    this.$log.log("cell clicked", cell, cell.getPathList());
  }

  onCellMouseOver(cell) {

    // If first time, then create highlight rectangles.
    if (this.highlights.length == 0) {
      this.highlights[0] = this.svg.append("rect")
        .classed("matrix-view-highlight-rect", true);
      this.highlights[1] = this.svg.append("rect")
        .classed("matrix-view-highlight-rect", true);
    } else {
      this.highlights.forEach(function (highlight) {
        highlight.style("display", "block");
      });
    }

    // Position highlight rectangles.
    let width = cmMatrixView.getWidth(this.colPerm, this.colWidths);
    let height = cmMatrixView.getHeight(this.rowPerm, this.rowHeights);
    let transform = cmMatrixView.getCellTransform(cell);

    this.highlights[0]
      .attr("width", width)
      .attr("height", this.rowHeight)
      .attr("transform", "translate(0," + transform.translate[1] + ")");

    this.highlights[1]
      .attr("width", this.colWidth)
      .attr("height", height)
      .attr("transform", "translate(" + transform.translate[0] + ",0)");
  }

  onCellMouseOut() {
    // Hide highlights.
    this.highlights.forEach(function (highlight) {
      highlight.style("display", "none");
    });
  }

  /** Callback when user clicks on the column controls.
   * Updates width of the column and unrolls its children.
   */
  onColControlsClicked(colIndex, unrolling) {
    this.isMajorColUnrolled[colIndex] = unrolling;

    // TODO - review this for symmetry with show/hide minor cols.
    // Update width of the column

    this.colWidths[colIndex] = this.getColWidth(colIndex, unrolling);

    // Tell rows to unroll col.
    for (var i = 0; i < this.allRows.length; ++i) {
      if (unrolling) {
        this.allRows[i].unrollCol(colIndex, this.colWidth, this.isMinorColVisible);
      } else {
        this.allRows[i].rollupCol(colIndex, this.isMinorColVisible);
      }
    }

    // Update position of other cols.
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  onEditVisibleAttributeCols() {
    let updateRowAttributes = this.updateRowAttributes.bind(this);
    this.onEditVisibleAttributes(this.attributes, this.isAttributeColVisible, updateRowAttributes);
  }

  onEditVisibleAttributeRows() {
    let updateColAttributes = this.updateColAttributes.bind(this);
    this.onEditVisibleAttributes(this.attributes, this.isAttributeRowVisible, updateColAttributes);
  }

  onEditVisibleAttributes(attributes, isAttributeVisible, updateVisibleAttributes) {
    var modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: '/app/components/connectivityMatrixView/modals/cmAttributeModalController.html',
      controller: 'cmAttributeModalController',
      controllerAs: 'modalController',
      size: 'sm',
      resolve: {
        title: function () {
          return "Select attributes";
        },
        attributes: function () {
          return attributes;
        },
        selection: function () {
          return isAttributeVisible;
        }
      }
    });

    let modalSuccess = function (selection) {
      updateVisibleAttributes(selection, isAttributeVisible);
    };

    modalSuccess = modalSuccess.bind(this);
    modalInstance.result.then(modalSuccess);
  }

  onHideAttributeRow(attributeIndex) {
    let attribute = this.attributes[attributeIndex];
    let viewIndex = this.getViewIndexFromAttributeIndex(attributeIndex);
    this.isAttributeRowVisible[attribute] = false;
    this.hideRow(viewIndex);
  }

  onHideAttributeCol(attributeIndex) {
    let attribute = this.attributes[attributeIndex];
    let viewIndex = this.getViewIndexFromAttributeIndex(attributeIndex);
    this.isAttributeColVisible[attribute] = false;
    this.hideCol(viewIndex);
  }

  onHideNodes(event, nodeIndexes) {
    this.updateDataRows(nodeIndexes, true);
    this.updateDataCols(nodeIndexes, true);
  }

  /**
   * Unroll the row and expands its height.
   */
  onRowControlsClicked(rowIndex) {
    this.rowHeights[rowIndex] = this.allRows[rowIndex].getCurrentHeight();
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  onShowNodes(event, nodeIndexes) {
    this.updateDataRows(nodeIndexes, false);
    this.updateDataCols(nodeIndexes, false);
  }

  onSortRowsByAttribute(attribute, ascending) {
    let rowPerm = this.model.getRowsSortedByAttr(attribute, ascending);
    let shiftedRowPerm = Utils.shiftPermutation(rowPerm, this.numHeaderRows);
    this.updatePositions(shiftedRowPerm, this.colPerm);
  }

  onSortColsByAttribute(attribute, ascending) {
    let colPerm = this.model.getColsSortedByAttr(attribute, ascending);
    let shiftedColPerm = Utils.shiftPermutation(colPerm, this.numHeaderCols);
    this.updatePositions(this.rowPerm, shiftedColPerm);
  }

  setEncoding(encoding) {
    let preprocessor = undefined;

    let visitor = new cmClearVisitor();
    this.applyVisitor(visitor);

    let cellWidth = this.colWidth;
    let cellHeight = this.rowHeight;

    let clicked = this.onCellClicked.bind(this);
    let mouseover = this.onCellMouseOver.bind(this);
    let mouseout = this.onCellMouseOut.bind(this);

    if (encoding == "bar chart") {
      preprocessor = new cmBarChartPreprocessor();
      this.applyVisitor(preprocessor);
      visitor = new cmBarChartVisitor(preprocessor, cellWidth, cellHeight);
      visitor.setCallbacks(clicked, mouseover, mouseout);
      this.applyVisitor(visitor);
      this.legend = undefined;
    } else if (encoding == "colormap") {
      preprocessor = new cmColorMapPreprocessor();
      this.applyVisitor(preprocessor);
      visitor = new cmColorMapVisitor(preprocessor, cellWidth, cellHeight);
      visitor.setCallbacks(clicked, mouseover, mouseout);
      this.applyVisitor(visitor);
      this.legend = new cmColorMapLegend(visitor);
    }
  }

  /** Used for externally setting sort orders.
   * rowPerm and colPerm get padded to account for headers rows/cols.
   */
  setSortOrders(rowPerm, colPerm) {
    let shiftedRowPerm = Utils.shiftPermutation(rowPerm, this.numHeaderRows);
    let shiftedColPerm = Utils.shiftPermutation(colPerm, this.numHeaderCols);
    this.updatePositions(shiftedRowPerm, shiftedColPerm);
  }

  showCol(colIndex) {
    if (this.isAttributeCell(colIndex)) {
      this.colWidths[colIndex] = this.colWidthAttr;
    } else if (this.isDataCell(colIndex)) {
      this.colWidths[colIndex] = this.colWidth;
    } else {
      this.$log.error("Showing a column type not yet handled!");
    }

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].majorCells[colIndex].setVisible(true);
    }

    this.updatePositions(this.rowPerm, this.colPerm);
  }

  showMinorCol(colIndex, minorColIndex) {
    this.isMinorColVisible[colIndex][minorColIndex] = true;
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].showMinorCol(colIndex, minorColIndex, this.colWidth, this.isMajorColUnrolled[colIndex], this.isMinorColVisible);
    }

    if (this.isMajorColUnrolled[colIndex]) {
      this.colWidths[colIndex] = this.getColWidth(colIndex, this.isMajorColUnrolled[colIndex]);
      this.updatePositions(this.rowPerm, this.colPerm);
    }
  }

  showRow(rowIndex) {
    this.allRows[rowIndex].setVisible(true);
    if (this.isAttributeRow(rowIndex)) {
      this.rowHeights[rowIndex] = this.rowHeightAttr;
    } else if (this.isDataRow(rowIndex)) {
      this.rowHeights[rowIndex] = this.rowHeight;
    }
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  /**
   * Function called when the user changed the visible attribute rows or cols.
   * @param selection - selection[attribute] is a boolean for whether attribute should be displayed
   * @param isAttributeVisible - state of what attributes are displayed. Needs to be updated.
   * @param show - callback to show rows/cols
   * @param hide - callback to hide rows/cols
   */
  updateAttributes(selection, isAttributeVisible, show, hide) {
    let attributes = this.attributes;
    for (var i = 0; i < attributes.length; ++i) {
      let attribute = attributes[i];
      if (selection[attribute]) {
        show(this.getViewIndexFromAttributeIndex(i));
      } else {
        hide(this.getViewIndexFromAttributeIndex(i));
      }
      isAttributeVisible[attribute] = selection[attribute];
    }
  }

  updateColAttributes(selection) {
    let showRow = this.showRow.bind(this);
    let hideRow = this.hideRow.bind(this);
    this.updateAttributes(selection, this.isAttributeRowVisible, showRow, hideRow);
  }

  // TODO - review this. Check for symmetry with updateDataRows
  updateDataCols(nodeIndexes, hide) {

    // Loop over all indexes who we are showing/hiding.
    for (var i = 0; i < nodeIndexes.length; ++i) {

      // Loop over all major cols
      for (var colIndex = 0; colIndex < this.colNodeIndexes.length; ++colIndex) {

        let isOnlyNodeInCol = this.colNodeIndexes[colIndex].length == 1;
        let minorColIndex = this.colNodeIndexes[colIndex].indexOf(nodeIndexes[i]);
        let isNodeInCol = minorColIndex != -1;
        let viewColIndex = this.getViewColIndexFromDataIndex(colIndex);

        if (isOnlyNodeInCol && isNodeInCol) {
          if (hide) {
            this.hideCol(viewColIndex);
          } else {
            this.showCol(viewColIndex);
          }
        } else if (isNodeInCol && !isOnlyNodeInCol) {
          if (hide) {
            this.hideMinorCol(viewColIndex, minorColIndex);
          } else {
            this.showMinorCol(viewColIndex, minorColIndex);
          }
        }
      }
    }
    this.updatePositions(this.rowPerm, this.colPerm);
    // if nodeIndex[i] is in colNodeIndex and the only one
    // hide colNodeIndex.indexOf(nodeIndex[i])
    // if nodeIndex[i] is in colNodeIndex and not the only one
    // hide minorColNodeIndex.indexOf(nodeIndex[i])

  }

  // TODO - review this.
  updateDataRows(nodeIndexes, hide) {
    let rowNodeIndexes = this.rowNodeIndexes;

    // Loop over all indexes who we are showing/hiding.
    for (var i = 0; i < nodeIndexes.length; ++i) {

      // Loop over all major rows
      for (var rowIndex = 0; rowIndex < this.allRows.length; ++rowIndex) {

        // Only check rows that have data bound.
        if (this.isDataRow(rowIndex)) {

          let dataIndex = this.getDataRowIndex(rowIndex);

          let isOnlyNodeInRow = rowNodeIndexes[dataIndex].length == 1;
          let minorRowIndex = rowNodeIndexes[dataIndex].indexOf(nodeIndexes[i]);
          let isNodeInRow = minorRowIndex != -1;

          if (isNodeInRow && isOnlyNodeInRow) {
            if (hide) {
              this.hideRow(rowIndex);
            } else {
              this.showRow(rowIndex);
            }
          } else if (isNodeInRow && !isOnlyNodeInRow) {
            if (hide) {
              this.allRows[rowIndex].hideMinorRow(minorRowIndex);
            } else {
              this.allRows[rowIndex].showMinorRow(minorRowIndex);
            }
            this.rowHeights[rowIndex] = this.allRows[rowIndex].getCurrentHeight();
            this.updatePositions(this.rowPerm, this.colPerm);
          }
        }
      }
    }
  }

  /** Update positions of rows and columns in the table.
   * Used for reordering and unrolling.
   */
  updatePositions(rowPerm, colPerm) {
    this.rowPerm = rowPerm;
    let yPositions = cmMatrixView.getRowYPositions(this.rowPerm, this.rowHeights);
    this.rowInv = reorder.inverse_permutation(this.rowPerm);

    this.colPerm = colPerm;
    this.colInv = reorder.inverse_permutation(this.colPerm);
    let xPositions = cmMatrixView.getColXPositions(this.colPerm, this.colWidths);

    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].setPosition(0, yPositions[this.rowInv[i]]);
      this.allRows[i].setColPositions(this.colInv, xPositions);
    }
  }

  updateRowAttributes(selection) {
    let showCol = this.showCol.bind(this);
    let hideCol = this.hideCol.bind(this);
    this.updateAttributes(selection, this.isAttributeColVisible, showCol, hideCol);
  }

}

