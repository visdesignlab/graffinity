import {cmMatrixView} from "./cmMatrixView"

export class cmMatrixViewFactory {
  constructor($log, $http, $uibModal, modalService) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.$uibModal = $uibModal;
    this.modalService = modalService;
  }


  createConnectivityMatrix(svg, model, scope, viewState, mainController) {
    return new cmMatrixView(svg, model, this.$log, this.$uibModal, scope, viewState, this.modalService, mainController);
  }

}
