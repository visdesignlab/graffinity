import {cmMatrixWrapper} from "./cmMatrixWrapper"
import {cmNodeListWrapper} from "./nodeList/cmNodeListWrapper"

export class cmMatrixViewFactory {
  constructor($log, $http, $uibModal, modalService, colorScaleService) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.$uibModal = $uibModal;
    this.modalService = modalService;
    this.colorScaleService = colorScaleService;
  }

  createConnectivityMatrixManager(svg, model, scope, viewState, mainController) {
    let childScope = scope.$new();
    return new cmMatrixWrapper(svg, model, this.$log, this.$uibModal, childScope, viewState, this.modalService, mainController, this.colorScaleService);
  }

  createNodeListManager(svg, model, scope, viewState, mainController) {
    let childScope = scope.$new();
    return new cmNodeListWrapper(svg, model, this.$log, this.$uibModal, childScope, viewState, this.modalService, mainController, this.colorScaleService);
  }
}
