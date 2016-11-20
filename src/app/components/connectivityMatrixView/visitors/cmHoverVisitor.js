import {cmCellVisitor} from "./cmCellVisitors";
import {Utils} from "../../utils/utils"

/**
 * Update the class of matrix cell groups to "hovered"
 */
export class cmHoverVisitor extends cmCellVisitor {
  constructor() {
    super();
    this.isHovered = true;
    this.nodeIndexes = [];
  }

  setNodes(nodeIndexes, matchPaths) {
    this.nodeIndexes = nodeIndexes;
    this.matchPaths = matchPaths;
    if (nodeIndexes) {
      this.matchAnySources = this.nodeIndexes.sources.indexOf(-1) == 0;
      this.matchAnyTargets = this.nodeIndexes.targets.indexOf(-1) == 0;
      this.matchAnyIntermediates = this.nodeIndexes.intermediates.indexOf(-1) == 0;
    }
  }

  apply(cell) {

    if ((cell.isDataCell || cell.isRowLabelCell || cell.isColLabelCell) && cell.interactionGroup) {
      let isCellHovered = false;

      // if this is meant to set cells as hovered - we need to find out whether cell should be hovered.
      if (this.isHovered) {

        // data cells are hovered if their paths contain a node in this.nodeIndexes
        // label cells are hovered if the intersection of their nodeIndexes and this.nodeIndexes is not null
        if (cell.isDataCell) {

          let ids = cell.data.ids;

          if (this.matchPaths) {
            if ((Utils.hasIntersection(this.nodeIndexes.sources, ids.sources) || this.matchAnySources) &&
              (Utils.hasIntersection(this.nodeIndexes.targets, ids.targets) || this.matchAnyTargets) &&
              (Utils.hasIntersection(this.nodeIndexes.intermediates, ids.intermediates) || this.matchAnyIntermediates)) {
              isCellHovered = true;
            }
          } else {
            if ((Utils.hasIntersection(this.nodeIndexes.sources, ids.sources) || this.matchAnySources) ||
              (Utils.hasIntersection(this.nodeIndexes.targets, ids.targets) || this.matchAnyTargets) ||
              (Utils.hasIntersection(this.nodeIndexes.intermediates, ids.intermediates) || this.matchAnyIntermediates)) {
              isCellHovered = true;
            }
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
