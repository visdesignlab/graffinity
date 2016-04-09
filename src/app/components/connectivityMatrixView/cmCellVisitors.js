export class cmCellVisitor {
  apply(cell) {
    let color = "red";

    if (cell.isHeaderCell) {
      return;
    }

    if (cell.isMajorCell) {
      if (cell.isInMajorRow) {
        color = "red";
      } else {
        color = "red";
      }
    } else { // !majorCell
      if (cell.isInMajorRow) {
        color = "red";
      } else {
        color = "black";
      }
    }

    cell.getD3Group().append("circle")
      .attr("cx", 5)
      .attr("cy", 5)
      .attr("r", 5)
      .attr("fill", "none")
      .style("stroke", color)
      .style("stroke-width", 2);
  }
}
