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
    this.minorCells = [];
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

  setData(data) {
    this.data = data;
  }
}

