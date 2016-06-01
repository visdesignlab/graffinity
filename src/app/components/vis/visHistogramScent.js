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

    this.xScale = d3.scale.linear()
       .domain([d3.min(this.values), d3.max(this.values)])
       .range([0, this.width]);

    this.yScale = d3.scale.linear()
      .domain([0, d3.max(this.histogramData, function (d) {
        return d.y;
      })])
      .range([this.height, 0]);

    if (isVertical)
    {
      this.xScale = d3.scale.linear()
         .domain([d3.min(this.values), d3.max(this.values)])
         .range([0, this.height]);

      this.yScale = d3.scale.linear()
        .domain([0, d3.max(this.histogramData, function (d) {
          return d.y;
        })])
        .range([this.width, 0]);

      this.createHistogramBarsVertical();
    }
    else {

      this.xScale = d3.scale.linear()
         .domain([d3.min(this.values), d3.max(this.values)])
         .range([0, this.width]);

      this.yScale = d3.scale.linear()
        .domain([0, d3.max(this.histogramData, function (d) {
          return d.y;
        })])
        .range([this.height, 0]);

      this.createHistogramBarsHorizontal();
    }
    this.parent.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "transparent")
      .style("outline", "thin solid black");

  }

   /**
   * Create bars of the histogram.
   */
  createHistogramBarsVertical() {
     let self = this;

    //draw bars on histogram
    let bar = this.parent.selectAll(".bar")
      .data(this.histogramData)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("transform", function (d) {
        console.log(self.xScale(d.dx))  //draws upper left corner of bar, so must subtract more 
        return "translate(" + (self.yScale(d.y)) + "," + (self.height - self.xScale(d.dx) - self.xScale(d.x)) + ")";
      });

    bar.append("rect")
      .attr("x", 1)
      .attr("height", self.xScale(this.minValue + this.histogramData[0].dx) - 1)
      .attr("width", function (d) {
        return (self.width - self.yScale(d.y));
      })
      .style("fill", "steelblue");
  }


  /**
   * Create bars of the histogram.
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
        return "translate(" + (self.xScale(d.x)) + "," + self.yScale(d.y) + ")";
      });

    bar.append("rect")
      .attr("x", 1)
      .attr("width", self.xScale(this.minValue + this.histogramData[0].dx) - 1)
      .attr("height", function (d) {
        return (self.height - self.yScale(d.y));
      })
      .style("fill", "steelblue");
  }


  /**
   * Generate histogram with this.numBins bins.
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
}
