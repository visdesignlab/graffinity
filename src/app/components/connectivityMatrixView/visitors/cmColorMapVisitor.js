/*globals
 colorbrewer, d3
 */

import {cmCellVisitor} from "./cmCellVisitors"

export class cmColorMapPreprocessor extends cmCellVisitor {
  constructor() {
    super();
    this.setRange = [0, 0];
    this.nodeRange = [0, 0];
  }

  apply(cell) {
    if (cell.isHeaderCell || !cell.isDataCell) {
      return;
    }

    if (cell.isCellBetweenSets()) {
      this.setRange[1] = Math.max(this.setRange[1], cell.getPathList().length);
    } else {
      this.nodeRange[1] = Math.max(this.nodeRange[1], cell.getPathList().length);
    }
  }
}

export class cmColorMapVisitor extends cmCellVisitor {
  constructor(preprocessor) {
    super();
    this.setColorScale = d3.scale.quantize()
      .range(colorbrewer.Blues[7])
      .domain(preprocessor.setRange);

    this.nodeColorScale = d3.scale.quantize()
      .range(colorbrewer.Oranges[7])
      .domain(preprocessor.nodeRange);

    this.preprocessor = preprocessor;
  }

  apply(cell) {
    if (!cell.isDataCell) {
      return;
    }

    let color = this.getCellColor(cell);
    cell.getGroup().append("circle")
      .attr("cx", 5)
      .attr("cy", 5)
      .attr("r", 5)
      .attr("fill", color)
      .style("stroke", color)
      .style("stroke-width", 2);
  }

  getCellColor(cell) {
    if (cell.isCellBetweenSets()) {
      return this.setColorScale(cell.getPathList().length);
    } else {
      return this.nodeColorScale(cell.getPathList().length);
    }

  }
}
