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

  setNodes(nodeIndexes) {
    this.nodeIndexes = nodeIndexes;
  }

  apply(cell) {

    if ((cell.isDataCell || cell.isRowLabelCell || cell.isColLabelCell) && cell.interactionGroup) {
      let isCellHovered = false;
      let cellsNodes = [];

      // if this is meant to set cells as hovered - we need to find out whether cell should be hovered.
      if (this.isHovered) {

        // data cells are hovered if their paths contain a node in this.nodeIndexes
        // label cells are hovered if the intersection of their nodeIndexes and this.nodeIndexes is not null
        if (cell.isDataCell) {
          let paths = cell.getPathList();
          cellsNodes = Utils.getNodesFromPaths(paths);
        } else {
          cellsNodes = cell.data.nodeIndexes;
        }

        // determine if there's an intersection
        for (var i = 0; i < this.nodeIndexes.length; ++i) {
          if (cellsNodes.indexOf(this.nodeIndexes[i]) != -1) {
            isCellHovered = true;
            break;
          }
        }
      }

      // update cell's state
      if (!cell.interactionGroup.classed("selected")) {
        cell.interactionGroup
          .classed("hovered", this.isHovered && isCellHovered);
      }
    }
  }
}
