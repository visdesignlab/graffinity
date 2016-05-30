import {cmCellVisitor} from "./cmCellVisitors";
import {cmAttributeControls} from "../cmAttributeControls";

export class cmAttributeLabelVisitor extends cmCellVisitor {
  constructor(onSortRows, onSortCols, onHideRow, onHideCol, rowHeight, colWidth, rowHeightAttr, colWidthAttr, onFilterNodes, onFilterAttributes) {
    super();

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
    if (cell.isAttributeLabelCell && cell.data.attributeIndex != -1) {
      console.log(cell);
      cell.controls = [];
      let isVertical = cell.data.isVertical;
      let name = cell.data.name;
      let group = cell.getGroup();
      let index = cell.data.attributeIndex; // index is the row/col index depending on if this is vertical or not.
      let attributeValues = cell.data.attributeValues;
      let onSort = isVertical ? this.callbacks.onSortCols : this.callbacks.onSortRows;
      let onHide = isVertical ? this.callbacks.onHideRow : this.callbacks.onHideCol;
      let width = isVertical ? this.rowHeightAttr : this.colWidthAttr;
      let height = isVertical ? this.colWidthAttr : this.rowHeightAttr;

      cell.controls = new cmAttributeControls(group, name, isVertical, width, height, onSort, onHide, index,
        this.callbacks.onFilterAttributes, cell.data.nodeIndexes, cell.data.attributeNodeGroup, attributeValues);
    }
  }
}
