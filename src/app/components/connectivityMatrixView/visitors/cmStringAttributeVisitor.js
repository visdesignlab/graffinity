import {cmAttributeCellVisitor} from "./cmAttributeCellVisitor";

export class cmStringAttributeVisitor extends cmAttributeCellVisitor {
  constructor(attributeIndex, attributeNodeGroup, labelRowWidth, labelRowHeight, labelColWidth, labelColHeight) {
    super(attributeIndex, attributeNodeGroup);
    this.labelRowHeight = labelRowHeight;
    this.labelRowWidth = labelRowWidth;
    this.labelColWidth = labelColWidth;
    this.labelColHeight = labelColHeight;
    this.isVisitingColsCollapsedAttr = false;
    this.isVisitingRowsCollapsedAttr = false;
    this.areColsCollapsed = false;
    this.areRowsCollapsed = false;
  }

  apply(cell) {
    if (this.shouldVisitCell(cell)) {
      let group = cell.getGroup();
      let text = cell.data.values[0];

      if (cell.data.isVertical) {

        if (this.areColsCollapsed && !this.isVisitingColsCollapsedAttr && cell.isMajorCell) {
          text = "----";
        }

        let textGroup = group.append("g")
          .attr("transform", "translate(" + this.labelRowWidth / 2 + "," + this.labelRowHeight + ")rotate(270)")
          .attr("clip-path", "url(#vertical-attribute-clip")
          .append("text")
          .text(text)
          .classed("matrix-view-string-attribute", true);

        if(this.isVisitingAirportOrState) {
          textGroup.attr("transform", "translate( "+ this.labelRowHeight / 2 +  ",0)" );
          textGroup
            .style("text-anchor", "middle");
        }

        this.width = this.labelRowWidth;
        this.height = this.labelRowHeight;

      } else {

        if (cell.isInMajorRow && this.areRowsCollapsed && !this.isVisitingRowsCollapsedAttr) {
          text = "----"
        }

        let textGroup = group.append("g")
          .attr("transform", "translate(" + 0 + "," + this.labelColHeight / 2 + ")")
          .attr("clip-path", "url(#horizontal-attribute-clip)")
          .append("text")
          .text(text)
          .classed("matrix-view-string-attribute", true);

        if(this.isVisitingAirportOrState) {
          textGroup.attr("transform", "translate( "+ this.labelColWidth / 2 + ", 0)" );
          textGroup
            .style("text-anchor", "middle");

        }

        this.width = this.labelColWidth;
        this.height = this.labelColHeight;

      }
      if (this.callbacks) {
        this.createInteractionGroup(cell);
      }
    }
  }
}
