import {cmAttributeCellVisitor} from "./cmAttributeCellVisitor";

export class cmStringAttributeVisitor extends cmAttributeCellVisitor {
  constructor(attributeIndex, labelRowWidth, labelRowHeight, labelColWidth, labelColHeight) {
    super(attributeIndex);
    this.labelRowHeight = labelRowHeight;
    this.labelRowWidth = labelRowWidth;
    this.labelColWidth = labelColWidth;
    this.labelColHeight = labelColHeight;
  }

  apply(cell) {
    if (cell.isAttributeCell && cell.data.attributeIndex == this.attributeIndex) {
      let group = cell.getGroup();

      if (cell.data.isVertical) {
        group.append("g")
          .attr("transform", "translate(" + this.labelRowWidth / 2 + "," + this.labelRowHeight + ")rotate(270)")
          .append("text")
          .attr("text-anchor", "start")
          .attr("alignment-baseline", "middle")
          .attr("font-size", 8)
          .text(cell.data.name);
      } else {
        group.append("g")
          .append("text")
          .attr("x", this.labelColWidth)
          .attr("y", this.labelColHeight / 2)
          .style("text-anchor", "end")
          .attr("alignment-baseline", "middle")
          .attr("font-size", 8)
          .text(cell.data.name);
      }
    }
  }
}
