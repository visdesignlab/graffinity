import {cmCellVisitor} from "./cmCellVisitors"

export class cmClearVisitor extends cmCellVisitor {
  constructor() {
    super();
  }

  apply(cell) {
    if (!cell.isDataCell) {
      return;
    }

    cell.getGroup()
      .selectAll("*")
      .remove();
  }
}
