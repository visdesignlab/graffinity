import {cmAttributeCellVisitor} from "./cmAttributeCellVisitor"

export class cmAttributeLabelVisitorBase extends cmAttributeCellVisitor {
  constructor(attributeIndex, attributeNodeGroup) {
    super(attributeIndex, attributeNodeGroup);
    this.visitAttributeCells = false;
    this.visitAttributeLabelCells = true;
  }
}
