import {cmMatrixView} from "./cmMatrixView"

export class cmMatrixViewFactory {
  constructor($log, $http, $uibModal, uiModals) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.$uibModal = $uibModal;
    this.uiModals = uiModals;
  }


  createConnectivityMatrix(svg, model, scope, viewState) {
    return new cmMatrixView(svg, model, this.$log, this.$uibModal, scope, viewState, this.uiModals);
  }

}
