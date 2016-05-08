/*global d3
 */

import {ScatterPlot1D} from "../svg/scatterPlot1D";
import {cmCellVisitor} from "./cmCellVisitors";


export class cmAttributeCellVisitor extends cmCellVisitor {
  constructor(attributeIndex) {
    super(0, 0);
    this.attributeIndex = attributeIndex;
  }

  getFilteredValues(hasNodeFilter, isNodeHidden, nodeIndexes, values) {
    if (hasNodeFilter) {
      let filteredValues = [];
      for (var i = 0; i < nodeIndexes.length; ++i) {
        if (!isNodeHidden[nodeIndexes[i]]) {
          filteredValues.push(values[i]);
        }
      }
      return filteredValues;
    }
    else {
      return values;
    }
  }
}

/**
 * Visitor to preprocess per-node attributes and find valueRange.
 * This finds the value range of all attribute cells.
 */
export class cmScatterPlot1DPreprocessor extends cmAttributeCellVisitor {
  constructor(attributeIndex) {
    super(attributeIndex);
    this.values = [];
  }

  apply(cell) {
    if (cell.isAttributeCell && cell.data.attributeIndex == this.attributeIndex) {
      let filteredValues = this.getFilteredValues(this.hasNodeFilter, this.isNodeHidden, cell.data.nodeIndexes, cell.data.values);
      for (var i = 0; i < filteredValues.length; ++i) {
        this.values.push(filteredValues[i]);
      }
    }
  }

  getValueRange() {
    return [Math.min(d3.min(this.values), 0), d3.max(this.values)];
  }
}

/**
 * Visitor to create 1D scatterplots in per-node attribute cells.
 * valueRange should be generated by the proceprocessor.
 */
export class cmScatterPlot1DVisitor extends cmAttributeCellVisitor {
  constructor(attributeIndex, radius, valueRange) {
    super(attributeIndex);
    this.radius = radius;
    this.valueRange = valueRange;
  }

  apply(cell) {
    if (cell.isAttributeCell && cell.data.attributeIndex == this.attributeIndex) {
      let data = cell.data;
      let values = this.getFilteredValues(this.hasNodeFilter, this.isNodeHidden, cell.data.nodeIndexes, cell.data.values);
      console.log(cell.data.isVertical, cell.data.nodeIndexes, cell.data.values);
      let group = cell.getGroup()
        .append("g");
      if (data.isVertical) {
        new ScatterPlot1D(group, 15, 80, this.radius, values, this.valueRange, data.orientation);
      } else {
        new ScatterPlot1D(group, 80, 15, this.radius, values, this.valueRange, data.orientation);
      }
    }
  }
}

