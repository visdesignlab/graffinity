export class cmModalController {
  constructor($uibModalInstance, title) {
    this.$uibModalInstance = $uibModalInstance;
    this.title = title;
  }

  ok() {
    let result = this.getResult();
    this.$uibModalInstance.close(result);
  }

  cancel() {
    this.$uibModalInstance.dismiss();
  }
}

export class cmAttributeModalController extends cmModalController {
  constructor($uibModalInstance, title, attributes, selection) {
    'ngInject';
    super($uibModalInstance, title);

    this.selection = angular.copy(selection);
    this.attributes = attributes;
  }

  getResult() {
    return this.selection;
  }
}
