/*globals d3
 */
export class visHistogram {
  /**
   * Class for representing a histogram.
   *
   * Variables are passed by reference.
   *
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

    //margin allows text from axis not to go out of bounds left,right, and below.
    this.margin = {top: 5, right: 30, bottom: 15, left: 30};

    let self = this;

    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    this.maxVal = d3.max(this.values);
    this.minVal = d3.min(this.values);

    this.numBins = numBins;

    this.generateHistogram();

    this.xScale = d3.scale.linear()
      .domain([d3.min(this.values), d3.max(this.values)])
      .range([0, self.chartWidth]);

    this.generateYAxis();
    this.drawHistogramBars();
    this.drawAxes();
    this.generateBrush();
  }

  // creates brush that will respond to user clicks.
  // selects range of values to filter the display
  generateBrush()
  {
    let brushMove = this.brushMove.bind(this);
    let brushEnd = this.brushEnd.bind(this);

    this.brush = d3.svg.brush()
      .x(this.xScale)
      .on("brush", brushMove)
      .on("brushend", brushEnd)

    let arc = d3.svg.arc()
      .outerRadius(this.chartHeight / 10)
      .startAngle(0)
      .endAngle(function (d, i) {
        return i ? -Math.PI : Math.PI;
      });


    let brushg = this.parent.append("g")
      .attr("class", "brush")
      .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
      .call(this.brush)

    brushg.selectAll(".resize").append("path")
      .attr("transform", "translate(0," + self.chartHeight / 2 + ")")
      .attr("d", arc)
      .attr("fill", "#666")
      .attr("fill-opacity", ".8")
      .attr("stroke-width", "1")
      .attr("stroke", "#000");

    brushg.selectAll("rect")
      .attr("stroke", "#fff")
      .attr("stroke-opacity", ".6")
      .attr("stroke-width", "1")
      .attr("fill-opacity", ".1")
      .attr("height", self.chartHeight);
  }

  generateYAxis()
  {
    //create y-axis; using 4 tick marks
    let maxHistValue = d3.max(this.hist, function (d) {
      return d.y;
    });

    let yBinScale = d3.scale.linear().domain([0, 4]).range([0, maxHistValue]);
    this.yTickArray = d3.range(5).map(yBinScale);

    this.yScale = d3.scale.linear()
      .domain([0, d3.max(this.hist, function (d) {
      return d.y;
      })])
      .range([this.chartHeight, 0]);
  }


  generateHistogram()
  {
    //create the numBins bins for the horizontal axis of histogram
    let binScale = d3.scale.linear().domain([0, this.numBins]).range([this.minVal, this.maxVal]);
    this.tickArray = d3.range(this.numBins + 1).map(binScale);

    // Generate a histogram using uniformly-spaced bins.
    this.hist = d3.layout.histogram()
        .bins(this.tickArray)
        (this.values);
  }


  drawAxes()
  {
     let xAxis = d3.svg.axis()
      .scale(this.xScale)
      .orient("bottom")
      .tickValues(this.tickArray)
      .tickFormat(d3.format(".3s"));

    let yAxis = d3.svg.axis()
      .scale(this.yScale)
      .orient("left")
      .tickValues(this.yTickArray)
      .tickFormat(d3.format("3d"));

    //place the x and y axis on the histogram
    this.parent.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(" + self.margin.left + "," + (self.margin.top + self.chartHeight) + ")")
      .call(xAxis);

    this.parent.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")")
      .call(yAxis);
  }

  drawHistogramBars()
  {
    self = this;

    //draw bars on histogram
    let bar = this.parent.selectAll(".bar")
        .data(this.hist)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) {return "translate(" + (self.margin.left+self.xScale(d.x)) + "," + (self.margin.top+ self.yScale(d.y)) + ")"; });

    bar.append("rect")
        .attr("x", 1)
        .attr("width", self.xScale(this.minVal+this.hist[0].dx)-1)
        .attr("height", function(d) {return (self.chartHeight - self.yScale(d.y)); })
        .style("fill", "steelblue");     // set the fill colour ;

    //place label of value within the bar
    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", this.xScale(this.minVal+this.hist[0].dx) / 2)  //put label in middle of bar
        .attr("text-anchor", "middle")
        .style("fill", "#fff")    // set the fill colour ;
        .text(function(d) { return d.y; }); //label is the value of the count
  }

  // mutator method called when the text box is changed
  // updates the axes and redraws the histogram apporpriately
  setNumBins(inputNumBins)
  {
    this.numBins = inputNumBins;
    this.generateHistogram();
    this.generateYAxis();

    this.parent.selectAll("g.x.axis").remove();
    this.parent.selectAll("g.y.axis").remove();
    this.parent.selectAll("g.bar").remove();
    this.parent.selectAll("g.brush").remove();

    this.drawHistogramBars();
    this.drawAxes();
    this.generateBrush(); //redraw brush on top (over bars) so it is easier to interact with.
  }


  //returns the tick mark of the tickArray that is closest to the input parameter num
  //used for snapping the brush to the closest value in the histogram
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

  //called when brush is moved
  brushMove(){
    let b = this.brush.extent();
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

    //update range
    this.range[0] = localBrushStartValue;
    this.range[1] = localBrushEndValue;
  }

}
