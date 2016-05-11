/*globals d3
 */
export class uiHistogramFilterModalController {
  /**
   * Object for letting user define a filter range of a quantitative attribute.
   * @param $uibModalInstance - the modal that gets created (managed by angular-bootstrap)
   * @param title - text displayed in modal header
   * @param values - attribute values for all nodes in the model
   * @param range - array [minValue, maxValue] that the user wants to see
   */
  constructor($uibModalInstance, $log, $timeout, title, values, range, attribute, nodeIndexes) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.$log = $log;
    this.title = title;
    this.values = values;
    this.range = angular.copy(range); // copy so that we don't mess with the state if user clicks dismiss!
    this.errorMessage = "";
    this.attribute = attribute;
    this.nodeIndexes = nodeIndexes;


    /*
     * This is a hack! We cannot access the modal's DOM elements here because 'this' (an angular controller) gets
     * instantiated before its DOM elements. Here, we're telling angular to call activateUi after the current digest
     * finishes. (This implies that the modal's DOM stuff will be created by the time we call activateUi!)
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
    // In this body is where we'll put the histogram!
    let modalBody = d3.select(".modal-body");
    let width = modalBody.style("width");
    let height = modalBody.style("height");

    this.$log.debug("The modal ui is being activated! It's dimensions are: ", width, height);
  }

  /**
   * Check that the range is sane before exiting the modal.
   * This check probably won't be necessary when the GUI histogram is implemented.
   */
  ok() {
    if (this.range[0] > this.range[1]) {
      this.errorMessage = "Enter a valid range!";
      return;
    }

    this.$uibModalInstance.close({
      attribute: this.attribute,
      range: this.range,
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
