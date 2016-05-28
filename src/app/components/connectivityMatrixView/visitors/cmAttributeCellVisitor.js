import {cmCellVisitor} from "./cmCellVisitors";

export class cmAttributeCellVisitor extends cmCellVisitor {
  constructor(attributeIndex) {
    super(0, 0);
    this.attributeIndex = attributeIndex;
    this.attributeNodeGroup = -1;
  }

  /**
   *
   */
  getFilteredValues(hasNodeFilter, isNodeHidden, nodeIndexes, values) {
    if (hasNodeFilter) {
      let filteredValues = [];
      for (var i = 0; i < nodeIndexes.length; ++i) {
        if (!isNodeHidden[nodeIndexes[i]]) {
          filteredValues.push(values[i]);
        }
      }
      return filteredValues;
    }
    else {
      return values;
    }
  }

  /**
   * Set the group that this is looking for.
   */
  setAttributeNodeGroup(attributeNodeGroup) {
    this.attributeNodeGroup = attributeNodeGroup;
  }

  /**
   * Returns true only if cell is holding an attribute and this visitor is currently looking for cells in that group.
   */
  shouldVisitCell(cell) {
    return cell.isAttributeCell &&
      cell.data.attributeNodeGroup == this.attributeNodeGroup &&
      cell.data.attributeIndex == this.attributeIndex;
  }
}
