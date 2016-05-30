import {cmCellVisitor} from "./cmCellVisitors";

export class cmAttributeLabelScentVisitor extends cmCellVisitor {
  constructor(attributeIndex, nodeAttributeGroup, filterRange) {
    super();
    this.attributeIndex = attributeIndex;
    this.nodeAttributeGroup = nodeAttributeGroup;
    this.filterRange = filterRange;
  }

  apply(cell) {
    if (cell.isAttributeLabelCell
      && cell.data.attributeIndex != this.attributeIndex
      && cell.data.attributeNodeGroup == this.nodeAttributeGroup) {

      if (!cell.controls) {
        throw "Something went wrong setting scents of attribute cells! The controls had not been created yet."
      }

      cell.controls.setAttributeFilterRange(this.filterRange);

    }
  }
}
