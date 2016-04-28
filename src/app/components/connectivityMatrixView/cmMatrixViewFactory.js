import {cmMatrixView} from "./cmMatrixView"

export class cmMatrixViewFactory {
  constructor($log, $http) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
  }


  createConnectivityMatrix(svg, model) {
    return new cmMatrixView(svg, model, this.$log);
  }

}
