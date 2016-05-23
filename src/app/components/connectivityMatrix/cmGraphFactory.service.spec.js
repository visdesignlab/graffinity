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

  it('getAsD3Input', inject(($httpBackend, $q, cmGraphFactory)=> {
    requestAndCreateGraph($httpBackend, $q, cmGraphFactory).then(function (graph) {
      var result = graph.getAsD3Input();
      expect(result.nodes.length == graph.getNodes().length).toEqual(true);
      expect(result.links.length == graph.getEdges().length).toEqual(true);

      for (var i = 0; i < result.links.length; ++i) {
        var link = result.links[i];
        expect(result.nodes[link.source].attributes.structure == link.value.sourceStructureId).toBe(true);
        expect(result.nodes[link.target].attributes.structure == link.value.targetStructureId).toBe(true);
      }

      result = graph.getAsD3Input([168, 18693]);
      expect(result.nodes.length == 2).toEqual(true);
      expect(result.links.length == 1).toEqual(true);

      for (i = 0; i < result.links.length; ++i) {
        link = result.links[i];
        expect(result.nodes[link.source].attributes.structure == link.value.sourceStructureId).toBe(true);
        expect(result.nodes[link.target].attributes.structure == link.value.targetStructureId).toBe(true);
      }
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
