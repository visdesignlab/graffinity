export class cmCellVisitor {
  constructor() {
  }

  apply(cell) {
    let color = "lightgrey";
    if (cell.isHeaderCell || !cell.isDataCell) {
      return;
    }
    let values = cell.getPathList();
    if (values.length > 0) {
      if (cell.isMajorCell) {
        if (cell.isInMajorRow) {
          color = "green";
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
    }

    cell.getGroup().append("circle")
      .attr("cx", 5)
      .attr("cy", 5)
      .attr("r", 5)
      .attr("fill", "none")
      .style("stroke", color)
      .style("stroke-width", 2);
  }
}