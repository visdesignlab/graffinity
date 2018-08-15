export class DataSelectionService {

  /**
   * Singleton service for asking user to select a dataset.
   */
  constructor($uibModal) {
    "ngInject";
    this.$uibModal = $uibModal;
  }

  /**
   * Asks the user which dataset to use
   * @param defaultDataNames - list of file names for pre-loaded data
   * @param defaultData - list of pre-loaded data.
   * @param callback - called when the user clicks 'go' - returns the selected data
   */
  getSelectionFromList(defaultDataNames, defaultData, callback) {

    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: 'app/components/dataSelection/dataSelection.html',
      controller: 'DataSelectionController',
      controllerAs: 'controller',
      bindToController: true,
      size: 'lg',
      backdrop  : 'static',
      keyboard  : false,
      resolve: {
        defaultData: function () {
          return defaultData;
        },
        defaultDataNames: function() {
          return defaultDataNames;
        }

      }
    });
    modalInstance.result.then(callback);
  }
}
