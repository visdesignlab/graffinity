import {SvgGroupElement} from "./svgGroupElement"

export class cmMatrixCell extends SvgGroupElement {
  constructor(parent, colIndex, isInMajorRow, isMajorCol, isHeaderCell) {
    let group = parent.append("g");
    group.attr("data-major-col", colIndex);
    super(group);
    this.isInMajorRow = isInMajorRow;
    this.isMajorCell = isMajorCol;
    this.minorCells = [];
    this.isHeaderCell = isHeaderCell;
  }

  addMinorCell(cell) {
    this.minorCells.push(cell);
  }

  apply(cellVisitor) {
    cellVisitor.apply(this);
    for(var i=0; i<this.minorCells.length; ++i) {
      this.minorCells[i].apply(cellVisitor);
    }
  }

  getMinorCells() {
    return this.minorCells;
  }

  isMajorCell() {
    return this.isMajorCell;
  }

  isInMajorRow() {
    return this.isInMajorRow;
  }

  setData(data) {
    let group = this.getD3Group();
    group.append("text")
    .text(data);
  }
}

