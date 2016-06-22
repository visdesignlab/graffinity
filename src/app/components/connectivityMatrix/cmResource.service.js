export class cmResource {
  constructor($log, $http, $q) {
    'ngInject';
    this.url = 'http://localhost:8000/';
    this.$q = $q;
    this.$http = $http;
    this.$log = $log;
  }

  getResourceUrl() {
    return this.url;
  }

  postRequest(query, database, urlExtension) {

    if (!urlExtension) {
      urlExtension = '';
    }

    // Create the http request
    let config = {};
    config.query = query;
    config.graph_name = database;

    // Create a promise object to return.
    let deferred = this.$q.defer();

    let success = function (result) {
      deferred.resolve(result.data);
    };

    let failure = function (error) {
      deferred.reject(error);
    };

    // Send off request
    this.$http.post(this.url + urlExtension, config).then(success, failure);

    return deferred.promise;
  }

  request(params, urlExtension) {

    if (!urlExtension) {
      urlExtension = '';
    }

    let deferred = this.$q.defer();

    let success = function (result) {
      deferred.resolve(result.data);
    };

    var failure = function (error) {
      deferred.reject(error);
    };

    let config = {};

    config.params = params;

    this.$http.get(this.url + urlExtension, config).then(success, failure);

    return deferred.promise;
  }

  setResourceUrl(url) {
    this.url = url;
  }

  requestMatrix(params) {
    return this.request(params, '/matrix');
  }

}

