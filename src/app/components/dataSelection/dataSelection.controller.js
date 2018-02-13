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
    this.isParsingFile = false;
    this.data = {};
    this.hasError = false;
  }

  /**
   * Why does changing self here not update what gets rendered in the modal?
   */
  onFileChanged(inputTag) {
    let self = this;
    let reader = new FileReader();

    self.isParsingFile = true;
    self.hasError = false;
    console.log(inputTag);
    self.filename = inputTag.files[0].name;
    self.$root.$apply();
    reader.onload = self.onFileLoadedSuccess.bind(self);
    reader.readAsText(inputTag.files[0]);
  }

  /**
   *
   */
  onFileLoadedSuccess(contents) {
    let self = this;
    self.data = angular.fromJson(contents.target.result);
    self.isDataOk = self.data.nodes && self.data.edges;
    if(!self.isDataOk) {
      self.hasError = true;
    }
    self.isParsingFile = false;
    self.$root.$apply();
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
