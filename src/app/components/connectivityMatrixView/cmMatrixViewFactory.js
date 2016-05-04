import {cmMatrixView} from "./cmMatrixView"

export class cmMatrixViewFactory {
  constructor($log, $http, $uibModal) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.$uibModal = $uibModal;
  }


  createConnectivityMatrix(svg, model) {
    console.log('creating matrix', this.$uibModal);
    return new cmMatrixView(svg, model, this.$log, this.$uibModal);
  }

}
