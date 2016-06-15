import {cmMatrixWrapper} from "./cmMatrixWrapper"
import {cmNodeListWrapper} from "./nodeList/cmNodeListWrapper"

export class cmMatrixViewFactory {
  constructor($log, $http, $uibModal, modalService) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.$uibModal = $uibModal;
    this.modalService = modalService;
  }

  createConnectivityMatrixManager(svg, model, scope, viewState, mainController) {
    let childScope = scope.$new();
    return new cmMatrixWrapper(svg, model, this.$log, this.$uibModal, childScope, viewState, this.modalService, mainController);
  }

  createNodeListManager(svg, model, scope, viewState, mainController) {
    let childScope = scope.$new();
    return new cmNodeListWrapper(svg, model, this.$log, this.$uibModal, childScope, viewState, this.modalService, mainController);
  }
}
