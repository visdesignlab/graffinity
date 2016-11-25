import {cmCellVisitor} from "./cmCellVisitors"


export class cmRawValueVisitor extends cmCellVisitor {
  constructor(width, height) {
    super(width, height);
    this.visitDataCells = true;
  }

  applyMetric(paths) {
    return this.metric(paths, this.graph);
  }

  setMetricFunction(metric) {
    this.metric = angular.copy(metric);
  }

  apply(cell) {
    if (!this.shouldVisitCell(cell)) {
      return;
    }

    let paths = this.pathFilterFunction(cell.getPathList());
    let value = this.applyMetric(paths);

    let group = cell.getGroup();
    if (paths.length) {

      // Shrink the rect by 1x1 so that it doesn't take up the entire cell. This is for pretty selection.
      group.append("text")
        .attr("width", this.width - 2)
        .attr("height", this.height - 2)
        .attr("transform", "translate(0, 8)")
        .attr("rx", this.rx)
        .attr("ry", this.ry)
        .style("stroke-width", "1px")
        .attr("font-size", "8px")
        .text(value);


      this.createInteractionGroup(cell);

      group.select(".matrix-view-interaction-group")
        .select("rect")
        .attr("data-toggle", "tooltip")
        .attr("data-title", function () {
          return paths.length + (paths.length == 1 ? " path" : " paths");
        })
        .attr("data-placement", "right")
        .attr("data-container", "body");


    } else {
      this.createEmptyCellOutline(cell);
    }
  }
}
