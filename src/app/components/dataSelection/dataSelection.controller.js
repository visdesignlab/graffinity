export class DataSelectionController {

  /**
   * Class for letting user select items from a list.
   * @param $uibModalInstance
   * @param title - displayed in modal header
   */
  constructor($uibModalInstance, defaultDataNames, defaultData) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.isParsingFile = false;
    this.defaultData = defaultData;
    this.defaultDataName = defaultDataNames;
  }

  /**
   *
   */
  onFileChanged(inputTag) {
    let self = this;
    let reader = new FileReader();
    self.isParsingFile = true;
    self.userDataError = false;
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
    self.userData = angular.fromJson(contents.target.result);
    self.isUserDataOk = self.userData.nodes && self.userData.edges;
    self.userDataError = !self.isUserDataOk;
    self.isParsingFile = false;
    self.$root.$apply();
  }

  go(data) {
    let self = this;
    self.$uibModalInstance.close(data);
  }
}
