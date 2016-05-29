import {cmCellVisitor} from "./cmCellVisitors"
import {cmNodeLabelControls} from "../cmNodeLabelControls"
export class cmNodeLabelVisitor extends cmCellVisitor {
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
    if (cell.isAttributeLabelCell && cell.data.attributeIndex == -1) {
      cell.controls = [];
      let name = cell.data.name;
      let group = cell.getGroup();

      cell.controls.push(new cmNodeLabelControls(group, name, this.colWidthAttr, this.rowHeightAttr, this.colWidth,
        this.rowHeight, this.callbacks.onFilterNodes, cell.data.nodeIndexes, this.callbacks.onSortRows,
        this.callbacks.onSortCols));
    }
  }
}
