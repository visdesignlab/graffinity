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
          .text(cell.data.name)
          .classed("matrix-view-string-attribute", true);

        this.width = this.labelRowWidth;
        this.height = this.labelRowHeight;
        this.createInteractionGroup(cell);
      } else {

        group.append("g")
          .append("text")
          .text(cell.data.name)
          .attr("x", 0)
          .attr("y", this.labelColHeight / 2)
          .classed("matrix-view-string-attribute", true);

        this.width = this.labelColWidth;
        this.height = this.labelColHeight;
        this.createInteractionGroup(cell);
      }
    }
  }
}
