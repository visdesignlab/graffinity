import {cmCellVisitor} from "./cmCellVisitors";
import {cmAttributeControls} from "../cmAttributeControls";

export class cmAttributeLabelVisitor extends cmCellVisitor {
  constructor(width, height, onSortRows, onSortCols) {
    super();
    this.width = width;
    this.height = height;
    this.callbacks = {};
    this.callbacks.onSortRows = onSortRows;
    this.callbacks.onSortCols = onSortCols;
  }

  apply(cell) {
    if (cell.isAttributeLabelCell) {
      let isVertical = cell.data.isVertical;
      let name = cell.data.name;
      let group = cell.getGroup();

      let onSort = isVertical ? this.callbacks.onSortCols : this.callbacks.onSortRows;

      cell.controls = new cmAttributeControls(group, name, isVertical, this.width, this.height, onSort);
    }
  }
}
