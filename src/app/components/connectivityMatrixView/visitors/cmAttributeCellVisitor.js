import {cmCellVisitor} from "./cmCellVisitors";

export class cmAttributeCellVisitor extends cmCellVisitor {
  constructor(attributeIndex) {
    super(0, 0);
    this.attributeIndex = attributeIndex;
  }

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
}
