/* globals d3
 */
import {cmCellVisitor} from "./cmCellVisitors"

export class cmClearVisitor extends cmCellVisitor {
  constructor() {
    super();
  }

  apply(cell) {
    if(this.shouldVisitCell(cell)) {

      let children = cell.getGroup()
        .selectAll("*");

      children = children.filter(function () {
        let attribute = d3.select(this)
          .attr("data-major-col");
        return attribute == undefined;
      });

      children.remove();
    }
  }

  setClearAttributeCells(clearAttributeCells) {
    this.visitAttributeCells = clearAttributeCells;
  }

  setClearAttributeLabelCells(clearAttributeLabelCells) {
    this.visitAttributeLabelCells = clearAttributeLabelCells;
  }

  setClearDataCells(clearDataCells) {
    this.visitDataCells = clearDataCells;
  }
}
