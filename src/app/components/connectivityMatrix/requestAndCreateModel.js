import {mock} from './mock'

export function requestAndCreateModel($httpBackend, $q, cmModelFactory, flights) {
  $httpBackend.when('POST', 'http://localhost:8000/').respond(
    flights ? mock.smallFlightResult : mock.output
  );

  var deferred = $q.defer();

  cmModelFactory.requestAndCreateModel().then(dataReady, error);

  return deferred.promise;

  function dataReady(model) {
    deferred.resolve(model);
  }

  function error(result) {
    expect(result).toEqual(false);
  }

}
