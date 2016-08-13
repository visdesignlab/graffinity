import {cmCellVisitor} from "./cmCellVisitors"

export class cmColorMapVisitorBase extends cmCellVisitor {
  constructor(width, height) {
    super(width, height);
    this.metric = undefined;
    this.graph = undefined;
    this.visitDataCells = true;
  }

  applyMetric(paths) {
    return this.metric(paths, this.graph);
  }

  setMetricFunction(metric) {
    this.metric = metric;
  }
}

export class cmColorMapPreprocessor extends cmColorMapVisitorBase {
  constructor() {
    super();
    this.setRange = [1, 1];
    this.nodeRange = [1, 0];
    this.visitDataCells = true;
  }

  apply(cell) {
    if (!this.shouldVisitCell(cell)) {
      return;
    }
    let paths = this.pathFilterFunction(cell.getPathList());
    let value = this.applyMetric(paths);
    if (cell.isCellBetweenSets()) {
      this.setRange[1] = Math.max(this.setRange[1], value);
    } else {
      this.nodeRange[1] = Math.max(this.nodeRange[1], value);
    }
  }
}

export class cmColorMapVisitor extends cmColorMapVisitorBase {
  constructor(colorScale, colorMapIndex, width, height) {
    super(width, height);
    this.visitDataCells = true;
    this.colorMapIndex = colorMapIndex;
    this.colorScale = colorScale;
  }

  apply(cell) {
    if (!this.shouldVisitCell(cell)) {
      return;
    }

    let paths = this.pathFilterFunction(cell.getPathList());
    let value = this.applyMetric(paths);
    let isCorrectAggregation = (cell.isCellBetweenSets() && this.colorMapIndex == 0) || (!cell.isCellBetweenSets() && this.colorMapIndex == 1);
    let color = this.colorScale(value);
    let group = cell.getGroup();
    if (paths.length && isCorrectAggregation) {

      // Shrink the rect by 1x1 so that it doesn't take up the entire cell. This is for pretty selection.
      group.append("rect")
        .attr("width", this.width - 2)
        .attr("height", this.height - 2)
        .attr("transform", "translate(1, 1)")
        .attr("rx", this.rx)
        .attr("ry", this.ry)
        .style("stroke", color)
        .style("stroke-width", "1px")
        .attr("fill", color);


      this.createInteractionGroup(cell);

      group.select(".matrix-view-interaction-group")
        .select("rect")
        .attr("data-toggle", "tooltip")
        .attr("data-title", function () {
          return paths.length + (paths.length == 1 ? " path" : " paths");
        })
        .attr("data-placement", "right")
        .attr("data-container", "body");

      angular.element('[data-toggle="tooltip"]').tooltip();

    } else {
      this.createEmptyCellOutline(cell);
    }
  }

  static getColorScaleRange(colors, range) {
    if (range[0] == 1 && range[1] == 1) {
      return [colors[3][2]];
    } else if (range[0] == 1 && range[1] == 2) {
      return [colors[3][0], colors[3][2]];
    } else if (range[1] >= 2 && range[1] < 7) {
      return colors[range[1] + 1];
    } else {
      return colors[7];
    }
  }
}
