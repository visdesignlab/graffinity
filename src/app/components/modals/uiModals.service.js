export class uiModals {
  constructor($uibModal) {
    "ngInject";
    this.$uibModal = $uibModal;
  }

  getSelectionFromList(title, items, isItemSelected, callback) {

    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: '/app/components/modals/modals/uiAttributeModalController.html',
      controller: 'uiAttributeModalController',
      controllerAs: 'modalController',
      size: 'sm',
      resolve: {
        title: function () {
          return title;
        },
        attributes: function () {
          return items;
        },
        selection: function () {
          return isItemSelected;
        }
      }
    });

    modalInstance.result.then(callback);
  }

}
