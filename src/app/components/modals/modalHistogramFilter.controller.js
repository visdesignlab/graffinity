/*globals d3
 */
import {visHistogram} from "../vis/visHistogram.js"

export class ModalHistogramFilterController {
  /**
   * Object for letting user define a filter range of a quantitative attribute.
   * @param $uibModalInstance - the modal that gets created (managed by angular-bootstrap)
   * @param $log, $timeout, $scope - angular services.
   * @param title - text displayed in modal header
   * @param values - attribute values for all nodes in nodeIndexes
   * @param range - array [minValue, maxValue] that defines the attribute filter. This is what will actually be output.
   * @param attribute - name of attribute being edited
   * @param nodeIndexes - nodeIndexes corresponding to the attributes
   */
  constructor($uibModalInstance, $log, $timeout, $scope, title, values, range, attribute, nodeIndexes) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.$log = $log;
    this.$scope = $scope;
    this.title = title;
    this.values = values;
    this.range = angular.copy(range); // copy so that we don't mess with the state if user clicks dismiss!
    this.errorMessage = ""; // will be set in this.ok() to tell the user they have made an invalid selection
    this.attribute = attribute;
    this.nodeIndexes = nodeIndexes;
    this.numBins = 10;

    /*
     * This is a hack! We cannot access the modal's DOM elements here because 'this' (an angular controller) gets
     * instantiated before its DOM elements. Here, we're telling angular to call activateUi after the current digest
     * finishes. This implies that the modal's DOM stuff will be created before activateUi runs!
     */
    let self = this;
    $timeout(function () {
      self.activateUi()
    }, 0);
  }

  /**
   * Function for populating the svg with a histogram!
   */
  activateUi() {

    // Get the modal body. Bootstrap assigns its width and height px values.
    let modalBody = d3.select(".modal-body");
    let padding = parseInt(modalBody.style("padding")) * 2; // 2 is for padding on top and bottom.
    let width = parseInt(modalBody.style("width")) - padding;
    let height = parseInt(modalBody.style("height")) - padding;

    this.$log.debug("The modal ui is being activated! It's dimensions are: ", width, height);

    // Change the size of the svg element to match the modal body.
    let histogramSvg = modalBody.select("svg")
      .attr("width", width)
      .attr("height", height);

    // Update width and height to be the size of the histogram.
    let paddingInSvg = 5;
    width = width - paddingInSvg * 2;
    height = height - paddingInSvg * 2;

    // Group is going to hold the histogram
    let group = histogramSvg.append("g")
      .attr("transform", "translate(" + paddingInSvg + ", " + paddingInSvg + ")");

    // Actually create the histogram object.
    this.histogram = new visHistogram(this.$scope, this.$log, group, width, height, this.numBins, this.values, this.range);
  }

  /**
   * Exit the modal and return info about the current atribute, the desired range, nodeIndexes, and values.
   */
  ok() {
    if (this.range[0] > this.range[1]) {
      this.errorMessage = "Enter a valid range!";
      return;
    }

    this.$uibModalInstance.close({
      attribute: this.attribute,
      range: this.range, // Here we're returning this.range which can be modified by the histogram!
      nodeIndexes: this.nodeIndexes,
      values: this.values
    });
  }

  /**
   * Dismiss w\ no-op.
   */
  cancel() {
    this.$uibModalInstance.dismiss();
  }
}
