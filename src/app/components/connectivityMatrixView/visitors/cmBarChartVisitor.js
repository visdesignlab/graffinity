/*globals
 colorbrewer, d3
 */

import {cmCellVisitor} from "./cmCellVisitors"
import {Utils} from "../../utils/utils"

export class cmBarChartPreprocessor extends cmCellVisitor {
  constructor() {
    super();
    this.maxDomainValue = 0;
    this.maxNumHops = [];
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
      this.maxNumHops = Math.max(numHops, this.maxNumHops);

      // Record this numHops locally. Summary is map[numHops] -> numPaths.
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
  constructor(preprocessor, width, height) {
    super();

    this.xScale = d3.scale.ordinal()
      .domain(reorder.permutation(preprocessor.maxNumHops))
      .rangeRoundBands([0, width], 0.1);

    this.yScale = d3.scale.linear()
      .domain([0, preprocessor.maxDomainValue])
      .range([height, 1]);

    this.preprocessor = preprocessor;

    this.width = width;
    this.height = height;
    this.visited = 0;
  }

  apply(cell) {

    if (!cell.isDataCell) {
      return;
    }

    // summary is map[numHops] -> numPaths
    let summary = this.preprocessor.summaries[this.visited];
    let group = cell.getGroup();
    let self = this;

    // Fill in empty spaces in summary. If there were no n-hop paths, then put a 0 there.
    for (var i = 0; i <= self.preprocessor.maxNumHops; ++i) {
      if (summary[i] == undefined) {
        summary[i] = 0;
      }
    }

    // Convert summary to a list.
    // list[n] = num of n+1 hops paths.
    let list = [];
    for (i = 0; i < self.preprocessor.maxNumHops; ++i) {
      list[i] = summary[i + 1];
    }

    this.visited += 1;

    // Skip cells with no paths.
    if (!cell.getPathList().length) {
      return;
    }


    // Create the mini-bar chart.
    let encoding = group.append("g");
    encoding.selectAll("rect")
      .data(list)
      .enter()
      .append("rect")
      .attr("transform", function (d, i) {
        return "translate(" + self.xScale(i) + "," + self.yScale(d) + ")";
      })
      .attr("width", self.xScale.rangeBand())
      .attr('height', function (d) {
        return self.height - self.yScale(d);
      })
      .attr("class", "histogramBar");

    group.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("rx", 2)
      .attr("ry", 2)
      .style("stroke", "gray")
      .style("stroke-width", "1px")
      .attr("fill", "none");

  }
}
