/*globals
 colorbrewer, d3
 */

import {cmCellVisitor} from "./cmCellVisitors"
import {Utils} from "../../utils/utils"

export class cmBarChartPreprocessor extends cmCellVisitor {
  constructor() {
    super();
    this.maxDomainValue = 0;
    this.validNumHops = [];
    this.summaries = [];
  }

  /**
   * Finds range of numPaths per numHops for all data cells. Cell are saved in this.summaries.
   * They are the count of paths for numHops.
   */
  apply(cell) {
    if (!cell.isDataCell) {
      return;
    }

    let summary = {};

    // For each path..
    let paths = cell.getPathList();
    for (var i = 0; i < paths.length; ++i) {
      let path = paths[i];

      // Have we globally seen a path with this many hops before?
      let numHops = Utils.getNumHops(path);
      if (this.validNumHops.indexOf(numHops) == -1) {
        this.validNumHops.push(numHops);
      }

      // Record this numHops locally.
      if (summary[numHops] == undefined) {
        summary[numHops] = 1;
      } else {
        summary[numHops] += 1;
      }

      // Update global max paths per numHops.
      this.maxDomainValue = Math.max(this.maxDomainValue, summary[numHops]);
    }

    // Save summary for creating bar chart.
    this.summaries.push(summary);
  }
}

export class cmBarChartVisitor extends cmCellVisitor {
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
