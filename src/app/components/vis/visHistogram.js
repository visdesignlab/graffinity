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

  //this is a git push test -- Urness
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

    // Placeholder for where the histogram will go.
    let clickCallback = this.onHistogramClicked.bind(this);
    parent.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "transparent")
      .attr("stroke-width", "1")
      .attr("stroke", "black")
      .on("click", clickCallback);
  }

  onHistogramClicked() {
    this.$log.debug("the histogram was clicked!");
  }
}
