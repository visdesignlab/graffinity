/*global d3
 */

/** ScatterPlot1D
 */
export class visScatterPlot1D {

  constructor(group, width, height, radius, values, valueRange, orientation) {
    this.radius = radius;
    if (orientation == visScatterPlot1D.getOrientations().HORIZONTAL) {
      this.dataScale = visScatterPlot1D.createDataScale([5, width - 5], valueRange);
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
      this.dataScale = visScatterPlot1D.createDataScale([height - 5, 5], valueRange);
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

    // Want to be able to call these functions from inside d3 callbacks.
    this.xMarkPosition = this.xMarkPosition.bind(this);
    this.yMarkPosition = this.yMarkPosition.bind(this);
    this.dataOffset = this.dataOffset.bind(this);

    this.data = visScatterPlot1D.createData(values, this.radius, this.xMarkPosition, this.yMarkPosition);
    this.marks = visScatterPlot1D.createMarks(group, this.data, this.radius);
    this.axis = visScatterPlot1D.createAxis(group, this.dataScale, this.dataOffset, orientation);

    let mouseOverCallback = this.onMouseOverGroup.bind(this);
    let mouseOutCallback = this.onMouseOutGroup.bind(this);
    group.append("rect")
      .attr("width", width)
      .attr('height', height)
      .attr("fill", "transparent")
      .on("mouseover", mouseOverCallback)
      .on("mouseout", mouseOutCallback);
  }

  static createAxis(group, dataScale, dataOffset, orientation) {

    var axis = undefined;
    if (orientation == visScatterPlot1D.getOrientations().HORIZONTAL) {

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
        .ticks(3)
        .tickFormat(d3.format("s"));

      axis = group.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + dataOffset(1) + ",0)")
        .call(xAxis);
    }

    axis.selectAll(".tick")
      .style("display", "none");

    return axis;
  }

  static createData(values, radius, xMarkPosition, yMarkPosition) {
    var data = [];
    values.forEach(function (d) {
      var datum = {};
      datum.x = xMarkPosition(d);
      datum.y = yMarkPosition(d);
      datum.color = 'red';
      datum.radius = radius;
      datum.value = d;
      data.push(datum);
    });
    return data;
  }

  static createDataScale(range, valueRange) {
    valueRange[1] = Math.ceil(valueRange[1]);
    return d3.scale.linear()
      .range(range)
      .domain(valueRange);
  }

  static createMarks(group, data, radius) {
    return group.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", radius)
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  static getOrientations() {
    return {
      HORIZONTAL: 0,
      VERTICAL: 1
    };
  }

  onMouseOverGroup() {
    // this.axis.selectAll(".tick").style("display", "block");
  }

  onMouseOutGroup() {
    // this.axis.selectAll(".tick").style("display", "none");
  }

}
