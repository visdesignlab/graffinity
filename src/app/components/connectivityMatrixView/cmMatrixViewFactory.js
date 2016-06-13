import {cmMatrixView} from "./cmMatrixView"
import {cmMatrixManager} from "./cmMatrixManager"
import {cmNodeListManager} from "./cmNodeListManager"

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

  createConnectivityMatrixManager(svg, model, scope, viewState, mainController) {
    let childScope = scope.$new();
    return new cmMatrixManager(svg, model, this.$log, this.$uibModal, childScope, viewState, this.modalService, mainController);
  }

  createNodeListManager(svg, model, scope, viewState, mainController) {
    let childScope = scope.$new();
    return new cmNodeListManager(svg, model, this.$log, this.$uibModal, childScope, viewState, this.modalService, mainController);
  }
}
