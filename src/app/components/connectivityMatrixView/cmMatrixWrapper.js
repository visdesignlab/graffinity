import {cmMatrixView} from "./cmMatrixView"
import {cmMatrixTopHeader} from "./cmMatrixTopHeader"
import {cmControlsMatrix} from "./cmControlsMatrix"
import {cmMatrixLeftHeader} from "./cmMatrixLeftHeader"
import {cmWrapperBase} from "./cmWrapperBase"

export class cmMatrixWrapper extends cmWrapperBase {

  constructor(element, model, $log, $uibModal, scope, viewState, modalService, mainController, colorScaleService) {
    super(element, $log, scope, mainController, "matrix-view", colorScaleService);
    this.$log.debug(this, colorScaleService);
    this.controlsHeader = new cmControlsMatrix(this.controlsHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController, colorScaleService);
    this.controlsHeader.setGridPosition([0, 0]);

    this.topHeader = new cmMatrixTopHeader(this.topHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController, colorScaleService);
    this.topHeader.setGridPosition([1, 0]);

    this.leftHeader = new cmMatrixLeftHeader(this.leftHeaderGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController, colorScaleService);
    this.leftHeader.setGridPosition([0, 1]);

    this.matrix = new cmMatrixView(this.matrixGroup, model, $log, $uibModal, scope, viewState,
      modalService, mainController, colorScaleService);
    this.matrix.setGridPosition([1, 1]);

    this.matrices = [this.topHeader, this.leftHeader, this.controlsHeader, this.matrix];

    this.setModel(model);

    this.updateElementPositions();
  }

  getMajorRowsAndColsAsScalarMatrix() {
    return this.matrix.getMajorRowsAndColsAsScalarMatrix();
  }

}


