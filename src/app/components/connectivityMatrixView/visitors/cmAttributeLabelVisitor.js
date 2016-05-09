import {cmCellVisitor} from "./cmCellVisitors";
import {cmAttributeControls} from "../cmAttributeControls";

export class cmAttributeLabelVisitor extends cmCellVisitor {
  constructor(width, height, onSortRows, onSortCols, onHideRow, onHideCol, labelColWidth, labelColHeight) {
    super();
    this.width = width;
    this.height = height;
    this.labelColWidth = labelColWidth;
    this.labelColHeight = labelColHeight;
    this.callbacks = {};
    this.callbacks.onSortRows = onSortRows;
    this.callbacks.onSortCols = onSortCols;
    this.callbacks.onHideRow = onHideRow;
    this.callbacks.onHideCol = onHideCol;
  }

  apply(cell) {
    if (cell.isAttributeLabelCell) {
      let isVertical = cell.data.isVertical;
      let name = cell.data.name;
      let group = cell.getGroup();
      let index = cell.data.attributeIndex; // index is the row/col index depending on if this is vertical or not.
      let onSort = isVertical ? this.callbacks.onSortCols : this.callbacks.onSortRows;

      let onHide = null;
      if (cell.data.attributeIndex != -1) {
        onHide = isVertical ? this.callbacks.onHideRow : this.callbacks.onHideCol;
        cell.controls = new cmAttributeControls(group, name, isVertical, this.width, this.height, onSort, onHide, index);
      } else {
        // Because the matrix header is symmetric, the "id" label of rows/cols is in the same cell. Here we create both
        // controls for labels in the same cell.
        cell.controls = [];
        cell.controls[0] = new cmAttributeControls(group, name, isVertical, this.labelColWidth, this.labelColHeight, this.callbacks.onSortRows, onHide, index);
        cell.controls[1] = new cmAttributeControls(group, name, !isVertical, this.labelColWidth, this.labelColHeight, this.callbacks.onSortCols, onHide, index);
      }
    }
  }
}
