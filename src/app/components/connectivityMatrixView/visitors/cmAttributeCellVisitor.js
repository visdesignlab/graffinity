import {cmCellVisitor} from "./cmCellVisitors";

/**
 * Class for visiting cells that have attribute data bound to them.
 * Requires the cell's attributeIndex and attributeNodeGroup match
 */
export class cmAttributeCellVisitor extends cmCellVisitor {
  constructor(attributeIndex, attributeNodeGroup) {
    super(0, 0);
    this.attributeIndex = attributeIndex;
    this.attributeNodeGroup = attributeNodeGroup;
    this.visitAttributeCells = true;
  }

  /**
   * Returns true only if cell is holding an attribute and this visitor is currently looking for cells in that group.
   */
  shouldVisitCell(cell) {
    return super.shouldVisitCell(cell) &&
      cell.data.attributeNodeGroup == this.attributeNodeGroup &&
      cell.data.attributeIndex == this.attributeIndex;
  }
}
