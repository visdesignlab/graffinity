import {cmMatrixView} from "./cmMatrixView"

export class cmMatrixViewFactory {
  constructor($log, $http) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.apiHost = 'https://api.github.com/repos/Swiip/generator-gulp-angular';
  }


  createConnectivityMatrix(svg, colNodeIndexes) {
    return new cmMatrixView(svg, colNodeIndexes);
  }

}
