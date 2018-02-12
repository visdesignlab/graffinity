export class DataSelectionService {

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
   * @param callback - called with isItemSelected when user resolves modal
   */
  getSelectionFromList(title, items, callback) {

    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: '/app/components/dataSelection/dataSelection.html',
      controller: 'DataSelectionController',
      controllerAs: 'modalController',
      size: 'lg',
      resolve: {
        title: function () {
          return title;
        },
        items: function () {
          return items;
        }
      }
    });
    modalInstance.result.then(callback);
  }
}
