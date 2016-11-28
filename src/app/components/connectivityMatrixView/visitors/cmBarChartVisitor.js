/*globals d3, reorder
 */

import {cmCellVisitor} from "./cmCellVisitors"

export class cmBarChartPreprocessor extends cmCellVisitor {
  constructor(metric) {
    super();
    this.visitDataCells = true;
    this.maxDomainValue = 0;
    this.maxNumHops = 1;
    this.summaries = [];
    this.metric = metric;
    this.isList = false;
  }

  /**
   * Finds range of numPaths per numHops for all data cells. Cell are saved in this.summaries.
   * They are the count of paths for numHops.
   */
  apply(cell) {
    if (!this.shouldVisitCell(cell)) {
      return;
    }
    let paths = this.pathFilterFunction(cell.getPathList());

    if (this.isList) {
      // For each path..
      let summary = this.metric(paths);

      let maxKey = 0;
      let keys = Object.keys(summary);
      for (let i = 0; i < keys.length; ++i) {
        let numHops = keys[i];
        maxKey = Math.max(parseInt(numHops), maxKey);
        this.maxDomainValue = Math.max(this.maxDomainValue, summary[numHops]);
      }

      this.maxNumHops = Math.max(this.maxNumHops, maxKey);
      // Save summary for creating bar chart.
      this.summaries.push(summary);
    } else {
      let value = this.metric(paths);
      if (value == 0) {
        value = 1;
      }
      this.summaries.push([value]);
      this.maxDomainValue = Math.max(this.maxDomainValue, this.summaries[this.summaries.length - 1][0]);
    }
  }
}

export class cmBarChartVisitor extends cmCellVisitor {
  constructor(preprocessor, width, height, isList) {
    super();
    this.visitDataCells = true;
    this.isList = isList;

    if (this.isList) {
      // Width is shrunk by 2 so that we can offset rect by 1 in each direction.
      this.xScale = d3.scale.ordinal()
        .domain(reorder.permutation(preprocessor.maxNumHops))
        .rangeRoundBands([0, width - 2], 0.1);
    } else {
      this.xScale = d3.scale.ordinal()
        .domain([0])
        .rangeRoundBands([0, width - 2], 0);
    }


    // Height is shrunk by 3: 2 for the selection offset + 1 so bars with height 1px appear in the glyph.
    this.yScale = d3.scale.log()
      .domain([1, preprocessor.maxDomainValue])
      .range([height, 3]);

    this.preprocessor = preprocessor;

    this.width = width;
    this.height = height;
    this.visited = 0;
  }

  apply(cell) {

    if (!this.shouldVisitCell(cell)) {
      return;
    }

    // summary is map[numHops] -> numPaths
    let summary = this.preprocessor.summaries[this.visited];
    let group = cell.getGroup();
    let self = this;
    let list = [];
    this.visited += 1;


    // Skip cells with no paths.
    let paths = this.pathFilterFunction(cell.getPathList());
    if (!paths.length) {
      this.createEmptyCellOutline(cell);
      return;
    }

    if (this.isList) {
      // Fill in empty spaces in summary. If there were no n-hop paths, then put a 0 there.
      for (var i = 0; i <= self.preprocessor.maxNumHops; ++i) {
        if (summary[i] == undefined) {
          summary[i] = 1;
        }
      }

      // Convert summary to a list.
      // list[n] = num of n+1 hops paths.
      for (i = 0; i < self.preprocessor.maxNumHops; ++i) {
        list[i] = summary[i + 1];
      }


    } else {
      list = summary;
    }
    // Create the mini-bar chart. Here we offset by 1px for selection.
    let encoding = group.append("g")
      .attr("transform", "translate(1, 1)");

    encoding.selectAll("rect")
      .data(list)
      .enter()
      .append("rect")
      .attr("transform", function (d, i) {
        return "translate(" + self.xScale(i) + "," + (self.yScale(d) - 2) + ")";
      })
      .attr("width", self.xScale.rangeBand())
      .attr('height', function (d) {
        return (self.height) - self.yScale(d);
      })
      .attr("class", "matrix-view-histogram-bar");

    // Width and height get shrunk by 2 for selection.
    encoding.append("rect")
      .attr("width", this.width - 2)
      .attr("height", this.height - 2)
      .attr("rx", 2)
      .attr("ry", 2)
      .style("stroke", "lightgray")
      .style("stroke-width", "1px")
      .attr("fill", "none");

    this.createInteractionGroup(cell, paths, this.graph);

  }
}
