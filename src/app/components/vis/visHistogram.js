export class visHistogram {
  /**
   * Class for representing a histogram.
   *
   * Variables are passed by reference.
   *
   * Changes to range should be done like this:
   * range[0] = minValue
   * range[1] = maxValue
   *
   * They should *not* be done like this, because it breaks the reference by creating a new array.
   * range = [minValue, maxValue]
   */

  constructor($scope, $log, parent, width, height, numBins, values, range) {
    this.$scope = $scope;
    this.$log = $log;
    this.parent = parent;
    this.width = width;
    this.height = height;
    this.numBins = numBins;
    this.values = values;
    this.range = range;

    this.$log.debug("Creating visHistogram", width, height, numBins, values, range);
    //margin allows text from axis not to go out of bounds left,right, and below.
    let margin = {top: 0, right: 30, bottom: 30, left: 30};
    let self = this;

    self.chartWidth = this.width - margin.left - margin.right;
    self.chartHeight = this.height - margin.top - margin.bottom;


    this.maxVal = d3.max(this.values);
    this.minVal = d3.min(this.values);

    // Placeholder for where the histogram will go.
    let binScale = d3.scale.linear().domain([0, numBins]).range([this.minVal, this.maxVal]);
    this.tickArray = d3.range(numBins + 1).map(binScale);

    let xScale = d3.scale.linear()
        .domain([d3.min(this.values), d3.max(this.values)])
        .range([0, self.chartWidth]);

    // Generate a histogram using uniformly-spaced bins.
    let hist = d3.layout.histogram()
        .bins(this.tickArray)
        (this.values);

    let yScale = d3.scale.linear()
        .domain([0, d3.max(hist, function(d) { return d.y; })])
        .range([self.chartHeight, 0]);

    let xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickValues(this.tickArray)
        .tickFormat(d3.format(".3s"));

    let bar = this.parent.selectAll(".bar")
        .data(hist)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {return "translate(" + (margin.left+xScale(d.x)) + "," + yScale(d.y) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", xScale(this.minVal+hist[0].dx)-1)
        .attr("height", function(d) {return (self.chartHeight - yScale(d.y)); })
        .style("fill", "steelblue");     // set the fill colour ;

    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", function(d) { return 6;})       //put label above if too small??
        .attr("x", xScale(this.minVal+hist[0].dx) / 2)  //put label in middle of bar
        .attr("text-anchor", "middle")
        .style("fill", "#fff")    // set the fill colour ;
        .text(function(d) { return d.y; }); //label is the value of the count

    this.parent.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + margin.left + "," + self.chartHeight + ")")
        .call(xAxis);

    // let clickCallback = this.onHistogramClicked.bind(this);
    // parent.append("rect")
    //   .attr("width", width)
    //   .attr("height", height)
    //   .attr("fill", "transparent")
    //   .attr("stroke-width", "1")
    //   .attr("stroke", "black")
    //   .on("click", clickCallback);

    // Draw the brush
    let brushMove = this.brushMove.bind(this);
    let brushEnd = this.brushEnd.bind(this);

    this.brush = d3.svg.brush()
        .x(xScale)
        .on("brush", brushMove)
        .on("brushend", brushEnd)

    this.parent.append("g")
      .attr("class", "brush")
      .attr("transform", "translate(" + margin.left + ", 0)")
      .call(this.brush)
      .selectAll("rect")
      .attr("stroke","#fff")
      .attr("stroke-opacity", ".6")
      .attr("stroke-width", "1")
      .attr("fill-opacity",".1")
      .attr("height", self.chartHeight);

  }

  closest (num) {
    let curr = this.tickArray[0];
    let diff = Math.abs (num - curr);
    for (let val = 0; val < this.tickArray.length; val++) {
        let newDiff = Math.abs (num - this.tickArray[val]);
        if (newDiff < diff) {
            diff = newDiff;
            curr = this.tickArray[val];
        }
    }
    return curr;
}

  brushMove(){
    let b = this.brush.extent();
    //this.$log.debug("brush moved" + b);
    let closest = this.closest.bind(this);

    let localBrushStartValue = (this.brush.empty()) ? this.minVal : closest(b[0]),
        localBrushEndValue = (this.brush.empty()) ? this.maxVal : closest(b[1]);

    d3.select("g.brush").call((this.brush.empty()) ? this.brush.clear() : this.brush.extent([localBrushStartValue, localBrushEndValue]));

    // Fade all values in the histogram not within the brush
    let self = this;

    d3.selectAll(".bar").style("opacity", function(d, i) {
      return d.x >= localBrushStartValue && d.x < localBrushEndValue || self.brush.empty() ? "1" : ".4";
    });
  }

  brushEnd(){
    let b = this.brush.extent();
    let closest = this.closest.bind(this);

    let localBrushStartValue = (this.brush.empty()) ? this.minVal : closest(b[0]),
        localBrushEndValue = (this.brush.empty()) ? this.maxVal : closest(b[1]);

    let self = this;
    d3.selectAll(".bar").style("opacity", function(d, i) {
      return d.x >= localBrushStartValue && d.x < localBrushEndValue || self.brush.empty() ? "1" : ".4";
    });

    //update range here
    this.$log.debug(localBrushStartValue + " " + localBrushEndValue);
    this.range[0] = localBrushStartValue;
    this.range[1] = localBrushEndValue;
  }

  onHistogramClicked() {
    this.$log.debug("the histogram was clicked!");
    this.$log.debug(this.minVal);
  }
}
