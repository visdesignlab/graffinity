export class ModalListFilterController {

  /**
   * Class for letting user select items from a list.
   * @param $uibModalInstance
   * @param title - displayed in modal header
   * @param items - list of items for the user to select from
   * @param isItemSelected - isItemSelected[item[i]] is true only if user selected item[i]
   */
  constructor($uibModalInstance, title, items, isItemSelected) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.title = title;
    this.isItemSelected = angular.copy(isItemSelected);
    this.items = items;
  }

  /**
   * Returns isItemSelected.
   */
  ok() {
    this.$uibModalInstance.close(this.isItemSelected);
  }

  /**
   * Dismiss and no-op.
   */
  cancel() {
    this.$uibModalInstance.dismiss();
  }
}
