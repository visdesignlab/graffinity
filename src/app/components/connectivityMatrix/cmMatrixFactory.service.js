import {cmMatrix} from "./cmMatrix"

export class cmMatrixFactory {
  constructor($log, $q, cmResource) {
    'ngInject';
    this.$log = $log;
    this.$q = $q;
    this.cmResource = cmResource;
  }

  createFromJsonObject(jsonMatrix) {
    return new cmMatrix(jsonMatrix);
  }

  requestMatrix(name, path) {
    var deferred = this.$q.defer();

    var success = function (data) {
      var matrix = new cmMatrix(data);
      deferred.resolve(matrix);
    };

    var error = function (err) {
      throw err;
    };

    var request = {
      "graph": name,
      "path": path
    };

    this.cmResource.requestMatrix(request).then(success, error);

    return deferred.promise;
  }


}
