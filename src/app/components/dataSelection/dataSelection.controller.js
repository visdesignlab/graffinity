export class DataSelectionController {

  /**
   * Class for letting user select items from a list.
   * @param $uibModalInstance
   * @param title - displayed in modal header
   * @param items - list of items for the user to select from
   */
  constructor($uibModalInstance, title, items) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.title = title;
    this.items = items;
    this.useDefaultDataSet = true;
  }

  /**
   * Returns isItemSelected.
   */
  ok() {
    this.$uibModalInstance.close();
  }

  /**
   * Dismiss and no-op.
   */
  cancel() {
    this.$uibModalInstance.dismiss();
  }
}
