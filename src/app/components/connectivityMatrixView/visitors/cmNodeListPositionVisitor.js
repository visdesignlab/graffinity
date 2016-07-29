import {cmAttributeCellVisitor} from "./cmAttributeCellVisitor"

/**
 * Class for creating the mini-nodelink diagrams above columsn in the intermediate node view
 */
export class cmNodeListPositionVisitor extends cmAttributeCellVisitor {
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
      group = group.append("g");
      let position = cell.data.values[0];

      this.width = this.labelRowWidth;
      this.height = this.labelRowHeight;

      // Construct arrays for the nodes/edges
      let pathLength = position[0];
      position = position[1];

      // Node array is all 0's except for the position of this column's nodes
      let array = [];
      for (let i = 0; i < pathLength; i += 2) {
        if (i == position) {
          array.push(1)
        } else {
          array.push(0);
        }
      }

      // Edge array is all 0's
      let edgeArray = [];
      for (let i = 1; i < pathLength; i += 2) {
        edgeArray.push(0);
      }

      // TODO - move maxPathLength somewhere else
      let self = this;
      let maxPathLength = 7;
      let edgeWidth = 2;

      // Create nodes - source is at the bottom
      group.selectAll("circle")
        .data(array)
        .enter()
        .append("circle")
        .attr("r", this.width / 3)
        .attr("transform", function (d, i) {
          let x = self.width / 2;
          let y = self.height - ((self.height / maxPathLength) * (i * 1.5) + x);
          return "translate(" + x + ", " + y + ")";
        })
        .style("stroke", "#337ab7")
        .style("fill", function (d) {
          return d ? "#337ab7" : "none";
        });

      // Create edges on top of nodes
      group.selectAll("rect")
        .data(edgeArray)
        .enter()
        .append("rect")
        .attr("transform", function (d, i) {
          let x = (self.width / 2) - (edgeWidth / 2);
          let y = self.height - ((self.height / maxPathLength) * (i * 1.5) + x + x + x);
          return "translate(" + x + ", " + y + ")";
        })
        .attr("width", edgeWidth)
        .attr("height", self.height / maxPathLength * 0.6)
        .style("fill", "#337ab7");

      //if (this.callbacks) {
      //  this.createInteractionGroup(cell);
      //}
    }
  }
}
