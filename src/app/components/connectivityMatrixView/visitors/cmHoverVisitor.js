import {cmCellVisitor} from "./cmCellVisitors";
import {Utils} from "../../utils/utils"

/**
 * Update the class of matrix cell groups to "hovered"
 */
export class cmHoverVisitor extends cmCellVisitor {
  constructor() {
    super();
    this.isHovered = true;
  }

  setNodes(nodeIndex) {
    this.nodeIndex = nodeIndex;
  }

  apply(cell) {
    if (cell.isDataCell) {
      let paths = cell.getPathList();
      let nodes = Utils.getNodesFromPaths(paths);
      if (nodes.indexOf(this.nodeIndex) != -1) {
        if (!cell.interactionGroup.classed("selected")) {
          cell.interactionGroup
            .classed("hovered", this.isHovered);
        }
      }
    }
  }
}
