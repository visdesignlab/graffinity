import {mock} from '../connectivityMatrix/mock'
import {Utils} from '../utils/utils'

describe('viewState', () => {
  beforeEach(angular.mock.module('connectivityMatrixJs'));

  function requestAndCreateModel($httpBackend, $q, cmModelFactory) {
    $httpBackend.when('POST', 'http://localhost:8000/').respond(
      mock.output
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

  it('create view state', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      expect(model).not.toEqual(null);
      expect(model.getCmGraph()).not.toEqual(null);
      expect(model.getCmMatrix()).not.toEqual(null);
      expect(viewState).not.toEqual(null);
    });

    $httpBackend.flush();
  }));

  it('create attribute node groups', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(modelReady);
    $httpBackend.flush();

    function modelReady(model) {
      "use strict";
      let rowNodeIndexes = Utils.getFlattenedLists(model.getRowNodeIndexes());
      let colNodeIndexes = Utils.getFlattenedLists(model.getColNodeIndexes());

      let rowAttributeNodeGroup = 0;
      let colAttributeNodeGroup = 1;

      viewState.setCurrentModel(model);
      viewState.setAttributeNodeGroup(rowNodeIndexes, rowAttributeNodeGroup);
      viewState.setAttributeNodeGroup(colNodeIndexes, colAttributeNodeGroup);

      expect(viewState.getAttributeNodeGroup(rowAttributeNodeGroup).length).toEqual(5);
      expect(viewState.getAttributeNodeGroup(colAttributeNodeGroup).length).toEqual(5);

      viewState.setAttributeNodeGroup([], colAttributeNodeGroup);
      expect(viewState.getAttributeNodeGroup(colAttributeNodeGroup).length).toEqual(0);
    }
  }));

  it('add filter to attribute node groups', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    //requestAndCreateModel($httpBackend, $q, cmModelFactory).then(modelReady);
    //$httpBackend.flush();
    //
    //function modelReady(model) {
    //  "use strict";
    //  let rowNodeIndexes = Utils.getFlattenedLists(model.getRowNodeIndexes());
    //
    //  let rowAttributeNodeGroup = 0;
    //  viewState.setCurrentModel(model);
    //  viewState.setAttributeNodeGroup(rowNodeIndexes, rowAttributeNodeGroup);
    //
    //  let rowAttributes = model.getNodeAttr(rowNodeIndexes, "area");
    //  viewState.getOrCreateFilterRange("area", rowAttributeNodeGroup, rowAttributes);
    //  viewState.setFilterRange("area", rowAttributeNodeGroup, [0, 120611001]);
    //
    //  let expectedVisibility = [false, true, false, false, false];
    //  for (var i = 0; i < rowNodeIndexes.length; ++i) {
    //    let nodeIndex = rowNodeIndexes[i];
    //    let visible = viewState.isNodeVisibleInAllFilters(nodeIndex, rowAttributeNodeGroup, viewState.filterRanges, viewState.model, viewState.isNodeIDFiltered);
    //    expect(visible).toEqual(expectedVisibility[i]);
    //  }
    //
    //  viewState.hideNodes([120]);
    //  expectedVisibility = [false, false, false, false, false];
    //  for (i = 0; i < rowNodeIndexes.length; ++i) {
    //    let nodeIndex = rowNodeIndexes[i];
    //    let visible = viewState.isNodeVisibleInAllFilters(nodeIndex, rowAttributeNodeGroup, viewState.filterRanges, viewState.model, viewState.isNodeIDFiltered);
    //    expect(visible).toEqual(expectedVisibility[i]);
    //  }
    //
    //  viewState.showNodes([120]);
    //  expectedVisibility = [false, true, false, false, false];
    //  for (i = 0; i < rowNodeIndexes.length; ++i) {
    //    let nodeIndex = rowNodeIndexes[i];
    //    let visible = viewState.isNodeVisibleInAllFilters(nodeIndex, rowAttributeNodeGroup, viewState.filterRanges, viewState.model, viewState.isNodeHidden);
    //    expect(visible).toEqual(expectedVisibility[i]);
    //  }
    //}
  }));

});
