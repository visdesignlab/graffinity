import {cmCellVisitor} from "./cmCellVisitors";
import {cmAttributeControls} from "../cmAttributeControls";

export class cmAttributeLabelVisitor extends cmCellVisitor {
  constructor(onSortRows, onSortCols, onHideRow, onHideCol, labelColWidth, labelColHeight, attrColWidth, attrColHeight, attrRowWidth, attrRowHeight, onFilterNodes) {
    super();
    this.labelColWidth = labelColWidth;
    this.labelColHeight = labelColHeight;

    this.attrColWidth = attrColWidth;
    this.attrColHeight = attrColHeight;
    this.attrRowWidth = attrRowWidth;
    this.attrRowHeight = attrRowHeight;

    this.callbacks = {};
    this.callbacks.onSortRows = onSortRows;
    this.callbacks.onSortCols = onSortCols;
    this.callbacks.onHideRow = onHideRow;
    this.callbacks.onHideCol = onHideCol;
    this.callbacks.onFilterNodes = onFilterNodes;
  }

  apply(cell) {
    if (cell.isAttributeLabelCell) {
      cell.controls = [];
      let isVertical = cell.data.isVertical;
      let name = cell.data.name;
      let group = cell.getGroup();
      let index = cell.data.attributeIndex; // index is the row/col index depending on if this is vertical or not.
      let onSort = isVertical ? this.callbacks.onSortCols : this.callbacks.onSortRows;

      let onHide = null;
      if (cell.data.attributeIndex != -1) {
        onHide = isVertical ? this.callbacks.onHideRow : this.callbacks.onHideCol;

        let width = isVertical ? this.attrRowWidth : this.attrColWidth;
        let height = isVertical ? this.attrRowHeight : this.attrColHeight;
        cell.controls.push(new cmAttributeControls(group, name, isVertical, width, height, onSort, onHide, index));
      } else {
        // Because the matrix header is symmetric, the "id" label of rows/cols is in the same cell. Here we create both
        // controls for labels in the same cell.
        cell.controls.push(new cmAttributeControls(group, name, true, this.attrRowWidth, this.labelColWidth, this.callbacks.onSortRows, onHide, index, this.callbacks.onFilterNodes));
        cell.controls.push(new cmAttributeControls(group, name, false, this.labelColWidth, this.labelColHeight, this.callbacks.onSortRows, onHide, index, this.callbacks.onFilterNodes));
      }
    }
  }
}
