import {Utils} from '../utils/utils'
import {requestAndCreateModel} from "../connectivityMatrix/requestAndCreateModel"

describe('viewState', () => {
  beforeEach(angular.mock.module('connectivityMatrixJs'));

  it('create view state', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      expect(model).not.toEqual(null);
      expect(model.getCmGraph()).not.toEqual(null);
      expect(model.getCmMatrix()).not.toEqual(null);
      expect(viewState).not.toEqual(null);
    });

    $httpBackend.flush();
  }));

  it('create attribute node groups - flights', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(modelReady);
    $httpBackend.flush();

    function modelReady(model) {
      "use strict";
      let rowNodeIndexes = Utils.getFlattenedLists(model.getRowNodeIndexes());
      let colNodeIndexes = Utils.getFlattenedLists(model.getColNodeIndexes());
      let intermediateNodeIndexes = Utils.getFlattenedLists(model.getIntermediateNodeIndexes());
      let rowAttributeNodeGroup = 0;
      let colAttributeNodeGroup = 1;
      let intermediateAttributeNodeGroup = 2;

      viewState.setModel(model);

      expect(viewState.getAttributeNodeGroup(rowAttributeNodeGroup).length).toEqual(rowNodeIndexes.length);
      expect(viewState.getAttributeNodeGroup(colAttributeNodeGroup).length).toEqual(colNodeIndexes.length);
      expect(viewState.getAttributeNodeGroup(intermediateAttributeNodeGroup).length).toEqual(intermediateNodeIndexes.length)
    }
  }));

  it('default filter values - flights', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(modelReady);
    $httpBackend.flush();

    function modelReady(model) {
      "use strict";
      let rowAttributeNodeGroup = 0;
      let colAttributeNodeGroup = 1;
      let intermediateAttributeNodeGroup = 2;
      let numAttributeNodeGroups = 3;

      viewState.setModel(model);

      let keys = Object.keys(viewState.categoricalFilters);

      expect(keys.length).toEqual(numAttributeNodeGroups);
      expect(Object.keys(viewState.categoricalFilters[rowAttributeNodeGroup]).length).toEqual(4); // 4 = 3 attributes + ids
      expect(Object.keys(viewState.categoricalFilters[rowAttributeNodeGroup]["state"]).length).toEqual(2);

      keys = Object.keys(viewState.quantitativeFilters);
      expect(keys.length).toEqual(numAttributeNodeGroups);
      expect(Object.keys(viewState.quantitativeFilters[colAttributeNodeGroup]).length).toEqual(3);

      expect(Object.keys(viewState.categoricalFilters[intermediateAttributeNodeGroup]["state"]).length).toEqual(6);
    }
  }));

  it('categorical filter values - flights', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(modelReady);
    $httpBackend.flush();

    function modelReady(model) {
      "use strict";
      let rowAttributeNodeGroup = 0;
      let colAttributeNodeGroup = 1;


      viewState.setModel(model);

      let paths = model.getAllPaths();
      let pathList = [];
      for (let key in paths) {
        pathList = pathList.concat(paths[key]);
      }

      // pathlist[0] = LAX -> BOS
      // pathList[4] = PDX -> BOS

      // Start with no paths filtered.
      expect(viewState.isPathFiltered(pathList[0])).toEqual(false);
      expect(viewState.isPathFiltered(pathList[4])).toEqual(false);

      // Filter paths starting at CA
      viewState.setCategoricalFilter("state", rowAttributeNodeGroup, {"OR": true, "CA": false}); // allow paths only from OR
      expect(viewState.isPathFiltered(pathList[0])).toEqual(true);  // start in LAC -> filtered
      expect(viewState.isPathFiltered(pathList[4])).toEqual(false); // starts in PDX -> visible

      // Filter paths ending at either NY or MA
      viewState.setCategoricalFilter("state", rowAttributeNodeGroup, {"OR": true, "CA": true}); // allow paths from OR or CA
      viewState.setCategoricalFilter("state", colAttributeNodeGroup, {"NY": false, "MA": true}); // allow paths to only MA
      expect(viewState.isPathFiltered(pathList[0])).toEqual(false);
      expect(viewState.isPathFiltered(pathList[4])).toEqual(false);

      // Filter paths ending at MA
      viewState.setCategoricalFilter("state", colAttributeNodeGroup, {"NY": true, "MA": false});
      expect(viewState.isPathFiltered(pathList[4])).toEqual(true);
    }
  }));

  it('categorical filter values - flights', inject(($httpBackend, $q, cmModelFactory, viewState)=> {

    //requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(modelReady);
    //$httpBackend.flush();
    //
    //function modelReady(model) {
    //  "use strict";
    //  let rowAttributeNodeGroup = 0;
    //  let colAttributeNodeGroup = 1;
    //
    //
    //  viewState.setModel(model);
    //
    //  let paths = model.getAllPaths();
    //  let pathList = [];
    //  for (let key in paths) {
    //    pathList = pathList.concat(paths[key]);
    //  }
    //
    //
    //}
  }));

//
//  it('add filter to attribute node groups', inject(($httpBackend, $q, cmModelFactory, viewState)=> {
//
//    //requestAndCreateModel($httpBackend, $q, cmModelFactory).then(modelReady);
//    //$httpBackend.flush();
//    //
//    //function modelReady(model) {
//    //  "use strict";
//    //  let rowNodeIndexes = Utils.getFlattenedLists(model.getRowNodeIndexes());
//    //
//    //  let rowAttributeNodeGroup = 0;
//    //  viewState.setCurrentModel(model);
//    //  viewState.setAttributeNodeGroup(rowNodeIndexes, rowAttributeNodeGroup);
//    //
//    //  let rowAttributes = model.getNodeAttr(rowNodeIndexes, "area");
//    //  viewState.getOrCreateFilterRange("area", rowAttributeNodeGroup, rowAttributes);
//    //  viewState.setFilterRange("area", rowAttributeNodeGroup, [0, 120611001]);
//    //
//    //  let expectedVisibility = [false, true, false, false, false];
//    //  for (var i = 0; i < rowNodeIndexes.length; ++i) {
//    //    let nodeIndex = rowNodeIndexes[i];
//    //    let visible = viewState.isNodeVisibleInAllFilters(nodeIndex, rowAttributeNodeGroup, viewState.filterRanges, viewState.model, viewState.isNodeIDFiltered);
//    //    expect(visible).toEqual(expectedVisibility[i]);
//    //  }
//    //
//    //  viewState.hideNodes([120]);
//    //  expectedVisibility = [false, false, false, false, false];
//    //  for (i = 0; i < rowNodeIndexes.length; ++i) {
//    //    let nodeIndex = rowNodeIndexes[i];
//    //    let visible = viewState.isNodeVisibleInAllFilters(nodeIndex, rowAttributeNodeGroup, viewState.filterRanges, viewState.model, viewState.isNodeIDFiltered);
//    //    expect(visible).toEqual(expectedVisibility[i]);
//    //  }
//    //
//    //  viewState.showNodes([120]);
//    //  expectedVisibility = [false, true, false, false, false];
//    //  for (i = 0; i < rowNodeIndexes.length; ++i) {
//    //    let nodeIndex = rowNodeIndexes[i];
//    //    let visible = viewState.isNodeVisibleInAllFilters(nodeIndex, rowAttributeNodeGroup, viewState.filterRanges, viewState.model, viewState.isNodeHidden);
//    //    expect(visible).toEqual(expectedVisibility[i]);
//    //  }
//    //}
//  }));
//
});
