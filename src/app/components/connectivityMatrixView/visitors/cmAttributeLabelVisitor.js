import {cmCellVisitor} from "./cmCellVisitors";
import {cmAttributeControls} from "../cmAttributeControls";

export class cmAttributeLabelVisitor extends cmCellVisitor {
  constructor(width, height, onSortRows, onSortCols, onHideRow, onHideCol) {
    super();
    this.width = width;
    this.height = height;
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
      let onHide = isVertical ? this.callbacks.onHideRow : this.callbacks.onHideCol;

      cell.controls = new cmAttributeControls(group, name, isVertical, this.width, this.height, onSort, onHide, index);
    }
  }
}
