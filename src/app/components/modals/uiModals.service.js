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

  getValueRange(title, values, range, nodeIndexes, attribute, callback) {

    let modalInstance = this.$uibModal.open({
      animation: true,
      templateUrl: '/app/components/modals/modals/uiHistogramFilterModal.html',
      controller: 'uiHistogramFilterModalController',
      controllerAs: 'modalController',
      size: 'lg',
      resolve: {
        title: function () {
          return title;
        },
        values: function () {
          return values;
        },
        range: function () {
          return range;
        },
        nodeIndexes: function () {
          return nodeIndexes;
        },
        attribute: function () {
          return attribute;
        }
      }
    });

    modalInstance.result.then(callback);

  }
}
