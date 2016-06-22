import {cmModel} from "./cmModel"
import {cmModelRow} from "./cmModelRow"

export class cmModelFactory {

  constructor($log, $q, cmGraphFactory, cmMatrixFactory, cmResource) {
    'ngInject';
    this.$log = $log;
    this.$q = $q;
    this.cmResource = cmResource;
    this.cmGraphFactory = cmGraphFactory;
    this.cmMatrixFactory = cmMatrixFactory;
  }

  requestAndCreateModel(query, database) {
    var self = this;

    // Promise that represents the response we'll be expecting from the server.
    let deferred = this.$q.defer();

    // We got something back from the server! Create a model.
    let success = function (data) {
      var graph = self.cmGraphFactory.createFromJsonObject(data.graph);
      var matrix = self.cmMatrixFactory.createFromJsonObject(data.matrix);
      deferred.resolve(new cmModel(graph, matrix));
    };

    // Something went wrong!
    let failure = function (error) {
      deferred.reject(error);
    };

    // Send the request to the server.
    this.cmResource.postRequest(query, database).then(success, failure);

    // Return the promise. It will be resolved when we hear back from the server.
    return deferred.promise;
  }

  createModel(graph, matrix) {
    return new cmModel(graph, matrix);
  }

  createModelRow() {
    return new cmModelRow();
  }
}
