import {mock} from './mock'
import {Utils} from '../utils/utils'

describe('cmGraphFactory', () => {
  beforeEach(angular.mock.module('connectivityMatrixJs'));

  function requestAndCreateGraph($httpBackend, $q, cmGraphFactory) {
    $httpBackend.when('GET', 'http://localhost:8000/?graph=feedback').respond(
      mock.output.graph
    );

    var deferred = $q.defer();

    var graph = undefined;

    function success(result) {
      graph = result;
      expect(graph.getJsonGraph()).not.toEqual(null);
      deferred.resolve(graph);
    }

    function error(result) {
      expect(result).toEqual(false);
    }

    cmGraphFactory.requestGraph("feedback").then(success, error);

    return deferred.promise;
  }

  it('should exist', inject(($httpBackend, cmGraphFactory)=> {
    expect(cmGraphFactory).not.toEqual(null);
  }));

  it('getNodes', inject(($httpBackend, $q, cmGraphFactory)=> {
    requestAndCreateGraph($httpBackend, $q, cmGraphFactory).then(function (graph) {
      var edges = graph.getEdges();
      expect(edges.length).toEqual(7);
    });
    $httpBackend.flush();
  }));

  it('getNodeAttributes', inject(($httpBackend, $q, cmGraphFactory)=> {
    requestAndCreateGraph($httpBackend, $q, cmGraphFactory).then(function (graph) {
      expect(Utils.compareLists(['label'], graph.getCategoricalNodeAttrNames())).toEqual(true);
      expect(Utils.compareLists(['completeness', 'area', 'locations'], graph.getQuantNodeAttrNames())).toEqual(true);
      expect(graph.getNodeIdName() == "structure").toBe(true);
    });
    $httpBackend.flush();
  }));

  it('getSubgraph', inject(($httpBackend, $q, cmGraphFactory)=> {
    requestAndCreateGraph($httpBackend, $q, cmGraphFactory).then(function (graph) {
      let paths = [[120, 3, 1, 4, 5107]];
      let subgraph = graph.getSubgraph(paths);
      expect(subgraph.nodes().length).toEqual(3);
      expect(subgraph.edges().length).toEqual(2);
    });
    $httpBackend.flush();
  }));
});
