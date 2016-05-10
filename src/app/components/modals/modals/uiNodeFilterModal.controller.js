export class uiNodeFilterModalController {
  constructor($uibModalInstance, title, ids, attributes, selection) {
    'ngInject';
    this.$uibModalInstance = $uibModalInstance;
    this.title = title;
    this.ids = ids;
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
