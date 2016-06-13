/*globals d3
 */
export class visHistogramScent {

  /**
   * Class for representing a histogram.
   */
  constructor($scope, parent, width, height, numBins, isVertical, values) {

    this.$scope = $scope;
    this.parent = parent;
    this.numBins = numBins;
    this.values = values;

    this.maxValue = d3.max(this.values);
    this.minValue = d3.min(this.values);

    this.width = width;
    this.height = height;

    this.createHistogramData();

    if (isVertical)
    {
      // margin allows for histogram to be properly placed -- note can change the right to 2 if you want histogram farther way from 1D scatterplots
      this.margin = {top: 5, right: 0, bottom: 5, left: 0};

      this.chartWidth = this.width - this.margin.left - this.margin.right;
      this.chartHeight = this.height - this.margin.top - this.margin.bottom;

      this.xScale = d3.scale.linear()
         .domain([d3.min(this.values), d3.max(this.values)])
         .range([0, this.chartHeight]);

      this.yScale = d3.scale.linear()
        .domain([0, d3.max(this.histogramData, function (d) {
          return d.y;
        })])
        .range([this.chartWidth, 0]);

      this.createHistogramBarsVertical();
    }
    else {
      // margin allows for histogram to be properly placed-- note can change the bottom to 2 if you want histogram farther way from 1D scatterplots
      this.margin = {top: 0, right: 5, bottom: 0, left: 5};
      this.chartWidth = this.width - this.margin.left - this.margin.right;
      this.chartHeight = this.height - this.margin.top - this.margin.bottom;

      this.xScale = d3.scale.linear()
         .domain([d3.min(this.values), d3.max(this.values)])
         .range([0, this.chartWidth]);

      this.yScale = d3.scale.linear()
        .domain([0, d3.max(this.histogramData, function (d) {
          return d.y;
        })])
        .range([this.chartHeight, 0]);

      this.createHistogramBarsHorizontal();
    }

    //TODO probably delete this ugly black line entirely
    //draw black line around histogram
    // this.parent.append("rect")
    //   .attr("width", this.width)
    //   .attr("height", this.height)
    //   .attr("fill", "transparent")
    //   .style("outline", "thin solid black");

  }

 /**
   * Create horizontal bars of the histogram.
   */
  createHistogramBarsHorizontal() {
    let self = this;

    //draw bars on histogram
    let bar = this.parent.selectAll(".bar")
      .data(this.histogramData)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function (d) {
        return "translate(" + (self.margin.left + self.xScale(d.x)) + "," + (self.yScale(d.y) - self.margin.bottom) + ")";
      });

    bar.append("rect")
      .attr("x", 1)
      .attr("width", self.xScale(this.minValue + this.histogramData[0].dx) - 1)
      .attr("height", function (d) {
        return (self.chartHeight - self.yScale(d.y));
      })
      .style("fill", "steelblue");
  }

   /**
   * Create bars vertical of the histogram.
   */
  createHistogramBarsVertical() {
     let self = this;

    //draw bars on histogram
    let bar = this.parent.selectAll(".bar")
      .data(this.histogramData)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("id", 1)
      .attr("transform", function (d) {
        //draws upper left corner of bar, so must subtract width of bar (self.xScale(d.dx)) for vertical bars
        return "translate(" + (self.yScale(d.y) - self.margin.right) + "," + (self.margin.top + self.chartHeight - self.xScale(d.dx + d.x)) + ")";
      });

    bar.append("rect")
      .attr("x", 1)
      .attr("height", self.xScale(this.minValue + this.histogramData[0].dx) - 1)
      .attr("width", function (d) {
        return (self.chartWidth - self.yScale(d.y));
      })
      .style("fill", "steelblue");
  }


  /**
   * Generate histogram with numBins bins.
   */
  createHistogramData() {
    // Create the numBins bins for the horizontal axis of histogram
    let binScale = d3.scale.linear().domain([0, this.numBins]).range([this.minValue, this.maxValue]);
    this.tickArray = d3.range(this.numBins + 1).map(binScale);

    // Generate a histogram using uniformly-spaced bins.
    this.histogramData = d3.layout.histogram()
      .bins(this.tickArray)
      (this.values);
  }

  /**
   * set the range for which histogram values should be highlighted.
   * all other bars are given opacity of .2
   */
  setFilterRange(filterRange) {
    this.parent.selectAll(".bar").style("opacity", function (d) {
       return d.x >= filterRange[0] && d.x < filterRange[1] ? "1" : ".2";
     });
  }
}