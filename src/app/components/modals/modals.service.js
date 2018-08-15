export class ModalService {

  /**
   * Singleton service for getting user input through a bootstrap modal.
   *
   * Whenever this launches a modal, the arguments to 'callback' get passed from inside the modal's controller's
   * ok() function.
   */
  constructor($uibModal) {
    "ngInject";
    this.$uibModal = $uibModal;
  }

  /**
   * Ask the user to select items with a checkbox list. Callback will be called with isItemSelected updated
   * to match the user's preference.
   * @param title - displayed in modal header
   * @param items - list of items to be selected
   * @param isItemSelected - isItemSelected[items[i]] is true only if user selects item[i]
   * @param callback - called with isItemSelected when user resolves modal
   */
  getSelectionFromList(title, items, isItemSelected, callback) {

    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: 'app/components/modals/modalListFilter.html',
      controller: 'ModalListFilterController',
      controllerAs: 'modalController',
      size: 'sm',
      resolve: {
        title: function () {
          return title;
        },
        items: function () {
          return items;
        },
        isItemSelected: function () {
          return isItemSelected;
        }
      }
    });
    modalInstance.result.then(callback);
  }

  /**
   * Ask the user to select a range from a list of values using a histogram.
   * @param title - displayed in modal header
   * @param values - list of values displayed in the histogram
   * @param range - list of [minValue, maxValue] desired by user
   * @param nodeIndexes - list of nodeIndexes corresponding to values
   * @param attribute - name of the current attribute that the user is selecting
   * @param callback - gets called when user resolves modal. it is passed an object containing
   *        { nodeIndexes, values, attribute, range }
   */
  getValueRange(title, values, range, nodeIndexes, attribute, callback) {

    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: 'app/components/modals/modalHistogramFilter.html',
      controller: 'ModalHistogramFilterController',
      controllerAs: 'modalController',
      size: 'lg',
      resolve: {
        title: function () {
          return title;
        },
        values: function () {
          return values;
        },
        range: function () {
          return range;
        },
        nodeIndexes: function () {
          return nodeIndexes;
        },
        attribute: function () {
          return attribute;
        }
      }
    });

    modalInstance.result.then(callback);
  }
}
