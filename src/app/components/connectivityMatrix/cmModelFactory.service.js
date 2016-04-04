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

  requestAndCreateModel(query) {
    var self = this;

    function success(data) {
      var graph = self.cmGraphFactory.createFromJsonObject(data.graph);
      var matrix = self.cmMatrixFactory.createFromJsonObject(data.matrix);
      return new cmModel(graph, matrix);
    }

    function error(error) {
      throw 'Something went wrong!' + error;
    }

    return this.cmResource.postRequest(query).then(success, error);
  }

  createModel(graph, matrix) {
    return new cmModel(graph, matrix);
  }

  createModelRow() {
    return new cmModelRow();
  }
}
