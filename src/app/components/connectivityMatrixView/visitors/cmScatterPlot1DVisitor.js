
/*global d3
 */

export class cmScatterPlot1DPreprocessor {
  constructor() {
    this.values = [];
  }

  apply(cell) {
    if (cell.isAttributeCell) {
      if(cell.data.values.length) {
        for (var i = 0; i < cell.data.values.length; ++i) {
          this.values.push(cell.data.values[i]);
        }
      } else {
        this.values.push(cell.data.values);
      }
    }
  }

  getValueRange() {
    return [Math.min(d3.min(this.values), 0), d3.max(this.values)];
  }
}
export class cmScatterPlot1DVisitor {
  constructor(radius, valueRange) {
    this.radius = radius;
    this.valueRange = valueRange;
  }

  apply(cell) {
    if (cell.isAttributeCell) {
      let data = cell.data;
      let group = cell.getGroup()
        .append("g");
      if (data.orientation) {
        if (data.values.length) {
          new ScatterPlot1D(group, 15, 80, this.radius, data.values, this.valueRange, data.orientation);
        } else {
          new ScatterPlot1D(group, 15, 80, this.radius, [data.values], this.valueRange, data.orientation);
        }
      } else {
         if (data.values.length) {
          new ScatterPlot1D(group, 80, 15, this.radius, data.values, this.valueRange, data.orientation);
        } else {
          new ScatterPlot1D(group, 80, 15, this.radius, [data.values], this.valueRange, data.orientation);
        }
      }
    }
  }
}


class ScatterPlot1D {
  static getOrientations() {
    return {
      HORIZONTAL: 0,
      VERTICAL: 1
    };
  }

  constructor(group, width, height, radius, values, valueRange, orientation) {
    console.log(values);
    this.radius = radius;
    if (orientation == ScatterPlot1D.getOrientations().HORIZONTAL) {
      this.dataScale = this.createDataScale([10, width - 10], valueRange);
      this.dataOffset = function () {
        return height / 4;
      };
      this.xMarkPosition = function (d) {
        return this.dataScale(d);
      };
      this.yMarkPosition = function (d) {
        return this.dataOffset(d);
      };
    } else {
      this.dataScale = this.createDataScale([height - 10, 10], valueRange);
      this.dataOffset = function () {
        return width / 2;
      };
      this.yMarkPosition = function (d) {
        return this.dataScale(d);
      };
      this.xMarkPosition = function (d) {
        return this.dataOffset(d);
      };
    }

    this.data = this.createData(values, this.yMarkPosition, this.xMarkPosition);
    this.marks = this.createMarks(group, this.data);
    this.axis = this.createAxis(group, this.dataScale, this.dataOffset, orientation);

    let mouseOverCallback = this.onMouseOverGroup.bind(this);
    let mouseOutCallback = this.onMouseOutGroup.bind(this);
    group.append("rect")
      .attr("width", width)
      .attr('height', height)
      .attr("fill", "transparent")
      .on("mouseover", mouseOverCallback)
      .on("mouseout", mouseOutCallback);
  }

  createAxis(group, dataScale, dataOffset, orientation) {

    var axis = undefined;
    if (orientation == ScatterPlot1D.getOrientations().HORIZONTAL) {

      var xAxis = d3.svg.axis()
        .scale(dataScale)
        .orient("bottom")
        .ticks(3)
        .tickFormat(d3.format("s"));

      axis = group.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dataOffset(1) + ")")
        .call(xAxis);

    } else {
      xAxis = d3.svg.axis()
        .scale(dataScale)
        .orient("left")
        .ticks(2);

      axis = group.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + dataOffset(1) + ",0)")
        .call(xAxis);
    }

    axis.selectAll(".tick")
      .style("display", "none");

    return axis;
  }

  createData(values) {
    var data = [];
    let self = this;
    values.forEach(function (d) {
      var datum = {};
      datum.x = self.xMarkPosition(d);
      datum.y = self.yMarkPosition(d);
      datum.color = 'red';
      datum.radius = self.radius;
      datum.value = d;
      data.push(datum);
    });
    return data;
  }

  createDataScale(range, valueRange) {
    valueRange[1] = Math.round(valueRange[1]);
    return d3.scale.linear()
      .range(range)
      .domain(valueRange).nice();
  }

  createMarks(group, data) {
    return group.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", this.radius)
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  onMouseOverGroup() {
    this.axis.selectAll(".tick").style("display", "block");
  }

  onMouseOutGroup() {
    this.axis.selectAll(".tick").style("display", "none");
  }

}
