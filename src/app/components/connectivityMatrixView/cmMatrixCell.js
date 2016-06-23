import {SvgGroupElement} from "./svgGroupElement"

export class cmMatrixCell extends SvgGroupElement {
  constructor(parent, colIndex, isInMajorRow, isMajorCell, isHeaderCell, isDataCell) {
    let group = parent.append("g");
    group.attr("data-major-col", colIndex);
    super(group);

    // Header cells are all cells that to the left of the data cells. E.g., control, label and attribute cells.
    this.isHeaderCell = isHeaderCell;

    // Data cells are at the core of the matrix.
    this.isDataCell = isDataCell;

    // AttributeCells hold a list of per-node attribute values for a given row/col.
    this.isAttributeCell = false;

    // AttributeLabelCells hold a 'name' of the attribute it controls.
    this.isAttributeLabelCell = false;

    // EditAttributeCells hold controls for manipulating what attributes are displayed
    this.isEditAttributeCell = false;

    this.isInMajorRow = isInMajorRow;
    this.isMajorCell = isMajorCell;

    this.isRowLabelCell = false;
    this.isColLabelCell = false;

    this.minorCells = [];

    this.data = {};
  }

  addMinorCell(cell) {
    this.minorCells.push(cell);
  }

  apply(cellVisitor) {
    cellVisitor.apply(this);
    for (var i = 0; i < this.minorCells.length; ++i) {
      this.minorCells[i].apply(cellVisitor);
    }
  }

  setData(data) {
    this.data = data;
  }

  getPathList() {
    let key = [];
    if (this.isInMajorRow) {
      if (this.isMajorCell) {
        key = [this.data.colNodeIndexes];
      } else {
        key = [[this.data.colNodeIndexes]];
      }
      return this.data.modelRow.getAllValuesAsList(key)[0];
    } else {
      if (this.isMajorCell) {
        key = [this.data.colNodeIndexes];
      } else {
        key = [[this.data.colNodeIndexes]];
      }
    }
    return this.data.modelRow.getValuesAsList(key)[0];
  }

  isCellBetweenSets() {
    return this.isInMajorRow && this.isMajorCell;
  }
}

