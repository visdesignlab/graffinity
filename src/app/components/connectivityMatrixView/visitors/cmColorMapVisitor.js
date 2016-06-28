/*globals
 colorbrewer, d3
 */

import {cmCellVisitor} from "./cmCellVisitors"
import {Utils} from "../../utils/utils"

export class cmColorMapVisitorBase extends cmCellVisitor {
  constructor(width, height) {
    super(width, height);
    this.metric = undefined;
    this.graph = undefined;
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
  }

  apply(cell) {
    if (cell.isHeaderCell || !cell.isDataCell) {
      return;
    }
    let paths = Utils.getFilteredPaths(cell.getPathList(), this.hasNodeFilter, this.isNodeHidden);
    let value = this.applyMetric(paths);
    if (cell.isCellBetweenSets()) {
      this.setRange[1] = Math.max(this.setRange[1], value);
    } else {
      this.nodeRange[1] = Math.max(this.nodeRange[1], value);
    }
  }
}

export class cmColorMapVisitor extends cmColorMapVisitorBase {
  constructor(preprocessor, width, height) {
    super(width, height);
    let colorRange = cmColorMapVisitor.getColorScaleRange(colorbrewer.Blues, preprocessor.setRange);
    let domain = [0, 1];

    if (colorRange.length != 1) {
      domain = preprocessor.setRange;
    }

    this.setColorScale = d3.scale.quantize()
      .range(colorRange)
      .domain(domain);

    colorRange = cmColorMapVisitor.getColorScaleRange(colorbrewer.Oranges, preprocessor.nodeRange);
    domain = [0, 1];
    if (colorRange.length != 1) {
      domain = preprocessor.nodeRange;
    }

    this.nodeColorScale = d3.scale.quantize()
      .range(colorRange)
      .domain(domain);

    this.preprocessor = preprocessor;
  }

  apply(cell) {
    if (!cell.isDataCell) {
      return;
    }

    let paths = Utils.getFilteredPaths(cell.getPathList(), this.hasNodeFilter, this.isNodeHidden);
    let value = this.applyMetric(paths);
    let color = this.getCellColor(cell, value);
    let group = cell.getGroup();
    if (paths.length) {

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

    } else {
      this.createEmptyCellOutline(cell);
    }
  }

  getCellColor(cell, value) {
    if (cell.isCellBetweenSets()) {
      return this.setColorScale(value);
    } else {
      return this.nodeColorScale(value);
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

export class cmColorMapLegend {
  constructor(visitor) {
    this.visitor = visitor;
  }

  createView(parent, width) {
    let group = parent.append('g');

    // Create the color legend for major rows/cols
    let swatchWidth = 20;
    let swatchHeight = Math.min(width, 20);
    cmColorMapLegend.createColorScaleLegend(this.visitor.setColorScale, group, swatchWidth, swatchHeight);
    group = parent.append('g').attr('transform', function () {
      return 'translate(' + swatchWidth * 3 + ',0)';
    });

    // If there are minor rows/cols, create the legend.
    if (this.visitor.nodeColorScale.domain()[1] != 0) {
      cmColorMapLegend.createColorScaleLegend(this.visitor.nodeColorScale, group, swatchWidth, swatchHeight);
    }
  }

  static createColorScaleLegend(colorScale, group, swatchWidth, swatchHeight) {

    let data = colorScale.range();

    let swatchPositionFn = function (d, i) {
      return "translate(0" + ", " + (i * swatchHeight) + ")";
    };

    // Create square swatches.
    group.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', swatchWidth)
      .attr('height', swatchHeight)
      .attr('rx', 2)
      .attr('ry', 2)
      .attr('transform', swatchPositionFn)
      .style('fill', function (d) {
        return d;
      });


    let textPositionFn = function (d, i) {
      return "translate(" + (swatchWidth * 1.1) + ", " + ((i * swatchHeight) + (0.5 * swatchHeight)) + ")";
    };

    // Create text labels to the right of the swatches.
    group.append('g')
      .selectAll('text')
      .data(data)
      .enter()
      .append('text')
      .text(function (d) {
        let value = colorScale.invertExtent(d);
        return Math.floor(value[1]);
      })
      .attr('transform', textPositionFn)
      .style('alignment-baseline', 'mathematical')
      .style('text-anchor', 'start');
  }
}
