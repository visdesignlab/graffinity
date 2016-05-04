import {cmCellVisitor} from "./cmCellVisitors"

/**
 * Visitor for creating buttons that let the user select visible attribute rows and cols.
 * TODO: Change this so that it appends the correct looking controls -- not just rectangles.
 */
export class cmEditVisibleAttributesVisitor extends cmCellVisitor {

  constructor(width, height, editAttributeRows, editAttributeCols) {
    super(width, height);
    this.editAttributeRows = editAttributeRows;
    this.editAttributeCols = editAttributeCols;
  }

  apply(cell) {
    if (!cell.isEditAttributeCell) {
      return;
    }

    let isVertical = cell.data.isVertical;
    let group = cell.getGroup();
    let height = this.height;
    let width = this.width;

    if (!isVertical) {

      group = group.append("g")
        .attr("transform", "translate(0, " + (height) + ")");

      group.append("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .style("fill", "transparent")
        .style("stroke", "black");

    } else {

      group = group.append("g")
        .attr("transform", "translate(" + height + ", " + 0 + " )");

      group.append("circle")
        .attr("cx", 5)
        .attr("cy", 5)
        .attr("r", 5)
        .style("fill", "transparent")
        .style("stroke", "black");
    }

    cell.getGroup().select("circle")
      .on("click", cell.data.isVertical ? this.editAttributeRows : this.editAttributeCols);

  }
}
