import {ConnectivityMatrix} from "./connectivityMatrix"

export class ConnectivityMatrixFactory {
  constructor($log, $http) {
    'ngInject';

    this.$log = $log;
    this.$http = $http;
    this.apiHost = 'https://api.github.com/repos/Swiip/generator-gulp-angular';
  }

  createConnectivityMatrix(svg, colNodeIndexes) {
    return new ConnectivityMatrix(svg, colNodeIndexes);
  }

}
