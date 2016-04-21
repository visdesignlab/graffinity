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

  postRequest(query, urlExtension) {

    if (!urlExtension) {
      urlExtension = '';
    }

    let config = {};
    config.query = query;

    let deferred = this.$q.defer();

    let success = function (result) {
      deferred.resolve(result.data);
    };

    let error = function (err) {
      throw err;
    };
    this.$http.post(this.url + urlExtension, config).then(success, error);

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

    var error = function (err) {
      throw err;
    };

    let config = {};

    config.params = params;

    this.$http.get(this.url + urlExtension, config).then(success, error);

    return deferred.promise;
  }

  setResourceUrl(url) {
    this.url = url;
  }

  requestMatrix(params) {
    return this.request(params, '/matrix');
  }

}

