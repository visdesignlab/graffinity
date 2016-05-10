export class uiAttributeModalController {
  constructor($uibModalInstance, title, attributes, selection) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.title = title;
    this.selection = angular.copy(selection);
    this.attributes = attributes;
  }

  ok() {
    this.$uibModalInstance.close(this.selection);
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}
