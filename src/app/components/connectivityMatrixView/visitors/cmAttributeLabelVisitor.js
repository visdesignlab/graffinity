import {cmAttributeControls} from "../controls/cmAttributeControls"
import {cmAttributeLabelVisitorBase} from "./cmAttributeLabelVisitorBase"
import {cmCategoricalAttributeControls} from "../controls/cmAttributeControls"

/**
 * Class for creating quantitative attribute labels.
 * The categorical attribute labels override this.createAttributeControls
 */
export class cmAttributeLabelVisitor extends cmAttributeLabelVisitorBase {
  constructor(attributeIndex, attributeNodeGroup, onSortRows, onSortCols, onHideRow, onHideCol, rowHeight, colWidth, rowHeightAttr, colWidthAttr, onFilterNodes, onFilterAttributes) {
    super(attributeIndex, attributeNodeGroup);

    this.rowHeight = rowHeight;
    this.colWidth = colWidth;
    this.rowHeightAttr = rowHeightAttr;
    this.colWidthAttr = colWidthAttr;

    this.callbacks = {};
    this.callbacks.onSortRows = onSortRows;
    this.callbacks.onSortCols = onSortCols;
    this.callbacks.onHideRow = onHideRow;
    this.callbacks.onHideCol = onHideCol;
    this.callbacks.onFilterNodes = onFilterNodes;
    this.callbacks.onFilterAttributes = onFilterAttributes;
  }

  apply(cell) {

    if (this.shouldVisitCell(cell)) {

      cell.controls = [];
      let isVertical = cell.data.isVertical;
      let name = cell.data.name;
      let group = cell.getGroup().append("g");
      let index = cell.data.attributeIndex; // index is the row/col index depending on if this is vertical or not.
      let attributeValues = cell.data.attributeValues;
      let onSort = isVertical ? this.callbacks.onSortCols : this.callbacks.onSortRows;
      let onHide = isVertical ? this.callbacks.onHideRow : this.callbacks.onHideCol;
      let width = isVertical ? this.rowHeightAttr : this.colWidthAttr;
      let height = isVertical ? this.colWidthAttr : this.rowHeightAttr;

      cell.controls = this.createAttributeControls(group, name, isVertical, width, height, onSort, onHide, index,
        this.callbacks.onFilterAttributes, cell.data.nodeIndexes, cell.data.attributeNodeGroup, attributeValues);
    }
  }

  createAttributeControls(group, name, isVertical, width, height, onSort, onHide, index, onFilterAttributes, nodeIndexes, attributeNodeGroup, attributeValues) {
    return new cmAttributeControls(group, name, isVertical, width, height, onSort, onHide, index, onFilterAttributes, nodeIndexes, attributeNodeGroup, attributeValues);
  }
}


export class cmCategoricalAttributeLabelVisitor extends cmAttributeLabelVisitor {
  constructor(attributeIndex, attributeNodeGroup, onSortRows, onSortCols, onHideRow, onHideCol, rowHeight, colWidth, rowHeightAttr, colWidthAttr, onFilterNodes, onFilterAttributes) {
    super(attributeIndex, attributeNodeGroup, onSortRows, onSortCols, onHideRow, onHideCol, rowHeight, colWidth, rowHeightAttr, colWidthAttr, onFilterNodes, onFilterAttributes);
  }

  createAttributeControls(group, name, isVertical, width, height, onSort, onHide, index, onFilterAttributes, nodeIndexes, attributeNodeGroup, attributeValues) {
    return new cmCategoricalAttributeControls(group, name, isVertical, width, height, onSort, onHide, index, onFilterAttributes, nodeIndexes, attributeNodeGroup, attributeValues);
  }
}
