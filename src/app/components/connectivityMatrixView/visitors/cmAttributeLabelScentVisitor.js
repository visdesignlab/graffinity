import {cmAttributeLabelVisitorBase} from "./cmAttributeLabelVisitorBase"

/**
 * Class used to apply new filters to the quantitative attribute scents.
 */
export class cmAttributeLabelScentVisitor extends cmAttributeLabelVisitorBase {
  constructor(attributeIndex, attributeNodeGroup, filterRange) {
    super(attributeIndex, attributeNodeGroup);
    this.filterRange = filterRange;
  }

  apply(cell) {
    if (this.shouldVisitCell(cell)) {

      if (!cell.controls) {
        throw "Something went wrong setting scents of attribute cells! The controls had not been created yet."
      }

      cell.controls.setAttributeFilterRange(this.filterRange);
    }
  }
}
