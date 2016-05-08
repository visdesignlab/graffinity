/* globals d3
 */
import {cmCellVisitor} from "./cmCellVisitors"

export class cmClearVisitor extends cmCellVisitor {
  constructor() {
    super();
    this.clearAttributeCells = false;
    this.clearDataCells = false;
  }

  apply(cell) {
    if ((cell.isDataCell && this.clearDataCells) || (cell.isAttributeCell && this.clearAttributeCells)) {

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
    this.clearAttributeCells = clearAttributeCells;
  }

  setClearDataCells(clearDataCells) {
    this.clearDataCells = clearDataCells;
  }
}
