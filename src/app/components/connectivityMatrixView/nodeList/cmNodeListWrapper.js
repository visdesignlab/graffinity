import {cmNodeListControls} from "./cmNodeListControls"
import {cmNodeListLeftHeader} from "./cmNodeListLeftHeader"
import {cmWrapperBase} from "./../cmWrapperBase"
import {cmNodeListTopHeader} from "./cmNodeListTopHeader"
import {cmNodeListView} from "./cmNodeListView"

export class cmNodeListWrapper extends cmWrapperBase {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(element, $log, scope, mainController, "node-list");

    this.controlsHeader = new cmNodeListControls(this.controlsHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.controlsHeader.setGridPosition([0, 0]);

    this.topHeader = new cmNodeListTopHeader(this.topHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.topHeader.setGridPosition([1, 0]);

    this.leftHeader = new cmNodeListLeftHeader(this.leftHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.leftHeader.setGridPosition([0, 1]);

    this.matrix = new cmNodeListView(this.matrixGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController);
    this.matrix.setGridPosition([1, 1]);

    this.matrices = [this.topHeader, this.leftHeader, this.controlsHeader, this.matrix];

    this.setModel(model);

    this.updateElementPositions();
  }
}


