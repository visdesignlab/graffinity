import {SvgGroupElement} from "./svgGroupElement"

export class cmMatrixCell extends SvgGroupElement {
  constructor(parent, colIndex, isInMajorRow, isMajorCell, isHeaderCell, isDataCell) {
    let group = parent.append("g");
    group.attr("data-major-col", colIndex);
    super(group);

    this.isInMajorRow = isInMajorRow;
    this.isHeaderCell = isHeaderCell;
    this.isMajorCell = isMajorCell;
    this.isDataCell = isDataCell;
    this.isAttributeCell = false;
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
    let values = null;
    if (this.isInMajorRow) {
      if (this.isMajorCell) {
        values = this.data.modelRow.getAllValuesAsList([this.data.colNodeIndexes])[0];
      } else {
        values = this.data.modelRow.getValuesAsList([[this.data.colNodeIndexes]])[0];
      }
    } else {
      if (this.isMajorCell) {
        values = this.data.modelRow.getValuesAsList([this.data.colNodeIndexes])[0];
      } else {
        values = this.data.modelRow.getValuesAsList([[this.data.colNodeIndexes]])[0];
      }
    }
    return values;
  }

  isCellBetweenSets() {
    return this.isInMajorRow || this.isMajorCell;
  }
}

