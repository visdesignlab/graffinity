import {mock} from './mock'

describe('cmGraphFactory', () => {
  beforeEach(angular.mock.module('connectivityMatrixJs'));

  it('should exist', inject(($httpBackend, cmMatrixFactory)=> {
    expect(cmMatrixFactory).not.toEqual(null);
  }));

  it('request matrix by path', inject(($httpBackend, cmMatrixFactory)=> {
    $httpBackend.when('GET', 'http://localhost:8000//matrix?graph=feedback&path=%7B%22nodeConstraints%22:%5B%22CBb.*%22,%22AC%22,%22GC%22%5D,%22edgeConstraints%22:%5B%22.*%22,%22.*%22%5D%7D').respond(
      mock.output.matrix
    );

    var matrix = undefined;

    function success(result) {
      matrix = result;
      var jsonMatrix = matrix.getJsonMatrix();
      expect(jsonMatrix).not.toEqual(null);
    }

    function error(result) {
      expect(result).toEqual(false);
    }

    var path = {
      "nodeConstraints": ["CBb.*", "AC", "GC"],
      "edgeConstraints": [".*", ".*"]
    };

    cmMatrixFactory.requestMatrix("feedback", path).then(success, error);

    $httpBackend.flush();
  }));
});
