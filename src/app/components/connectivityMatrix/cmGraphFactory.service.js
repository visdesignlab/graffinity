import {cmGraph} from "./cmGraph"

export class cmGraphFactory {
  constructor($log, $q, cmResource) {
    'ngInject';
    this.$log = $log;
    this.$q = $q;
    this.cmResource = cmResource;
  }

  requestGraph(name) {
    let deferred = this.$q.defer();

    let success = function (data) {
      var graph = new cmGraph(data);
      deferred.resolve(graph);
    };

    let error = function (err) {
      throw err;
    };

    this.cmResource.request({"graph": name}).then(success, error);

    return deferred.promise;
  }

  createFromJsonObject(jsonGraph, database) {
    return new cmGraph(jsonGraph, database);
  }
}
