import {Utils} from '../utils/utils'
import {requestAndCreateModel} from "./requestAndCreateModel"

describe('cmModelFactory', () => {
  beforeEach(angular.mock.module('connectivityMatrixJs'));

  it('should exist', inject(($httpBackend, $q, cmModelFactory)=> {
    expect(cmModelFactory).not.toEqual(null);
  }));

  it('request matrix by path', inject(($httpBackend, $q, cmModelFactory)=> {

    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      expect(model).not.toEqual(null);
      expect(model.getCmGraph()).not.toEqual(null);
      expect(model.getCmMatrix()).not.toEqual(null);
    });

    $httpBackend.flush();
  }));

  it('cmModel - getRowNodeIndexes', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var rows = model.getRowNodeIndexes();
      expect(rows.length).toEqual(5);
      for (var i = 0; i < rows.length; ++i) {
        expect(rows[i].length).toEqual(1);
      }
    });
    $httpBackend.flush();
  }));

  it('cmModel - expandRows', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var expectedRowNodeIndexes = [[168], [120], [142], [1724], [5107]];
      var rowNodeIndexes = model.getRowNodeIndexes();
      expect(Utils.compareLists(rowNodeIndexes, expectedRowNodeIndexes)).toEqual(true);
      var matrix = model.getCurrentMatrix();

      var expectedMatrix = [
        [[], [], [], [], []],
        [[], [], [], [], [[120, 3, 1, 4, 5107]]],
        [[], [], [], [], []],
        [[], [], [[1724, 1, 35894, 6, 142]], [], []],
        [[], [], [], [], []]];

      expect(Utils.compareLists(expectedMatrix, matrix)).toEqual(true);

      model.collapseRowsByAttr("label");
      rowNodeIndexes = model.getRowNodeIndexes();
      expectedRowNodeIndexes = [[168, 120, 1724], [142, 5107]];
      expect(Utils.compareLists(rowNodeIndexes, expectedRowNodeIndexes)).toEqual(true);

      model.expandRows([0]);
      matrix = model.getCurrentMatrix();

      expectedRowNodeIndexes = [[168], [120], [1724], [142, 5107]];
      expect(Utils.compareLists(model.getRowNodeIndexes(), expectedRowNodeIndexes)).toBe(true);
      expect(matrix.length == expectedRowNodeIndexes.length).toBe(true);

      model.expandRows([0]);
      matrix = model.getCurrentMatrix();

      expectedRowNodeIndexes = [[168], [120], [1724], [142, 5107]];
      expect(Utils.compareLists(model.getRowNodeIndexes(), expectedRowNodeIndexes)).toBe(true);
      expect(matrix.length == expectedRowNodeIndexes.length).toBe(true);

      model.expandRows([3]);
      matrix = model.getCurrentMatrix();
      expectedRowNodeIndexes = [[168], [120], [1724], [142], [5107]];
      expect(Utils.compareLists(model.getRowNodeIndexes(), expectedRowNodeIndexes)).toBe(true);
      expect(matrix.length == expectedRowNodeIndexes.length).toBe(true);

      model.collapseRowsByAttr("label");
      model.expandAllRows();
      expectedRowNodeIndexes = [[168], [120], [1724], [142], [5107]];
      expect(Utils.compareLists(model.getRowNodeIndexes(), expectedRowNodeIndexes)).toBe(true);
    });
    $httpBackend.flush();
  }));

  it('cmModel - expandCols', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var colNodeIndexes = model.getColNodeIndexes();
      var matrix = model.getCurrentMatrix();
      var expectedColNodeIndexes = [[168], [120], [142], [1724], [5107]];
      var expectedMatrix = [
        [[], [], [], [], []],
        [[], [], [], [], [[120, 3, 1, 4, 5107]]],
        [[], [], [], [], []],
        [[], [], [[1724, 1, 35894, 6, 142]], [], []],
        [[], [], [], [], []]];

      model.expandCols([0]);
      expect(Utils.compareLists(colNodeIndexes, expectedColNodeIndexes)).toEqual(true);
      expect(Utils.compareLists(expectedMatrix, matrix)).toEqual(true);

      model.collapseCols([[2, 4]]);

      colNodeIndexes = model.getColNodeIndexes();
      matrix = model.getCurrentMatrix();

      expectedColNodeIndexes = [[168], [120], [142, 5107], [1724]];
      expectedMatrix = [
        [[], [], [], []],
        [[], [], [[120, 3, 1, 4, 5107]], []],
        [[], [], [], []],
        [[], [], [[1724, 1, 35894, 6, 142]], []],
        [[], [], [], []]
      ];

      expect(Utils.compareLists(colNodeIndexes, expectedColNodeIndexes)).toEqual(true);
      expect(Utils.compareLists(expectedMatrix, matrix)).toEqual(true);

      model.expandCols([2]);
      matrix = model.getCurrentMatrix();

      expectedMatrix = [
        [[], [], [], [], []],
        [[], [], [], [], [[120, 3, 1, 4, 5107]]],
        [[], [], [], [], []],
        [[], [], [], [[1724, 1, 35894, 6, 142]], []],
        [[], [], [], [], []]];

      expect(Utils.compareLists(expectedMatrix, matrix)).toEqual(true);

      model.reset();
      model.collapseColsByAttr("label");
      colNodeIndexes = model.getColNodeIndexes();
      matrix = model.getCurrentMatrix();

      expect(colNodeIndexes.length == 2).toBe(true);
      expectedMatrix = [
        [[], []],
        [[], [[120, 3, 1, 4, 5107]]],
        [[], []],
        [[], [[1724, 1, 35894, 6, 142]]],
        [[], []]];

      expect(Utils.compareLists(expectedMatrix, matrix)).toEqual(true);
      model.expandCols([1]);
      matrix = model.getCurrentMatrix();

      expectedMatrix = [
        [[], [], []],
        [[], [], [[120, 3, 1, 4, 5107]]],
        [[], [], []],
        [[], [[1724, 1, 35894, 6, 142]], []],
        [[], [], []]];

      expect(Utils.compareLists(expectedMatrix, matrix)).toEqual(true);

    });
    $httpBackend.flush();
  }));

  it('cmModel - getColNodeIndexes', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var cols = model.getColNodeIndexes();
      expect(cols.length).toEqual(5);
      for (var i = 0; i < cols.length; ++i) {
        expect(cols[i].length).toEqual(1);
      }
    });
    $httpBackend.flush();
  }));

  it('cmModel - collapseRowsAndCols', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      model.collapseColsByAttr("label");
      model.collapseRowsByAttr("label");
      var expectedMatrix = [
        [[], [[1724, 1, 35894, 6, 142], [120, 3, 1, 4, 5107]]],
        [[], []]];

      var matrix = model.getCurrentMatrix();
      expect(Utils.compareLists(expectedMatrix, matrix)).toBe(true);
    });
    $httpBackend.flush();
  }));

  it('cmModel - getViewLabels', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var labels = model.getViewLabels(model.getColNodeIndexes());
      expect(labels.length).toEqual(5);

      model.collapseColsByAttr("label");
      labels = model.getViewLabels(model.getColNodeIndexes(), "label");

      var expectedLabels = [['CBb3m'], ['GC']];
      expect(labels.length).toEqual(2);
      expect(Utils.compareLists(expectedLabels, labels)).toEqual(true);
    });
    $httpBackend.flush();
  }));

  it('cmModel - getNodesFromGridCell', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var expectedRowNodeIndexes = [[168], [120], [142], [1724], [5107]];
      var rowNodeIndexes = model.getRowNodeIndexes();
      expect(Utils.compareLists(rowNodeIndexes, expectedRowNodeIndexes)).toEqual(true);

      /*
       var expectedMatrix = [
       [[], [], [], [], []],
       [[], [], [], [], [[2, 3, 4, 4, 6]]],
       [[], [], [], [], []],
       [[], [], [[5, 1, 1, 6, 3]], [], []],
       [[], [], [], [], []]];
       */

      var nodes = model.getNodesFromGridCellPaths(1, 4);

      expect(Utils.compareLists([120, 1, 5107], nodes)).toEqual(true);

      nodes = model.getNodesFromAllPaths();
      expect(Utils.compareLists([120, 1, 5107, 1724, 35894, 142], nodes)).toEqual(true);
    });
    $httpBackend.flush();
  }));

  it('cmModelRow - create', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var row = cmModelFactory.createModelRow();
      var matrix = model.getCmMatrix().getJsonMatrix().matrix;
      var rowNodeIndexes = model.getCmMatrix().getRows();
      var colNodeIndexes = model.getColNodeIndexes();

      // row should have values equal to those we just shoved into it
      row.activate(rowNodeIndexes[1], matrix[1], colNodeIndexes);
      expect(row.getValuesAsList(colNodeIndexes)[4].length).toEqual(1);

      var otherRow = cmModelFactory.createModelRow();
      otherRow.addChildRow(row);
      expect(Utils.compareLists(row.getValuesAsList(colNodeIndexes), otherRow.getAllValuesAsList(colNodeIndexes))).toBe(true);

      otherRow = cmModelFactory.createModelRow();
      otherRow.activate(rowNodeIndexes[3], matrix[3], colNodeIndexes);
      row.addChildRow(otherRow);

      model.collapseCols([[2, 4]]);
      colNodeIndexes = model.getColNodeIndexes();
      expect(row.getAllValuesAsList(colNodeIndexes)[2].length).toEqual(2);
    });
    $httpBackend.flush();
  }));

  it('cmModelRow - create', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var rows = model.getCurrentRows();
      expect(rows.length).toEqual(5);

      model.collapseRowsByAttr("label");
      rows = model.getCurrentRows();
      expect(rows.length).toEqual(2);
      var rowNodeIndexes = model.getRowNodeIndexes();

      expect(Utils.compareLists(rows[0].getAllNodeIndexes(), rowNodeIndexes[0])).toBe(true);
      var colNodeIndexes = model.getColNodeIndexes();
      expect(rows[0].getAllValuesAsList(colNodeIndexes).length).toEqual(colNodeIndexes.length);

      model.collapseColsByAttr("label");
      colNodeIndexes = model.getColNodeIndexes();
      expect(rows[0].getAllValuesAsList(colNodeIndexes).length).toEqual(colNodeIndexes.length);
    });

    $httpBackend.flush();
  }));

  it('cmModel - getIntermediateNodeIndexes', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(function (model) {
      var intermediateNodeIndexes = model.getIntermediateNodeIndexes();
      expect(intermediateNodeIndexes.length).toEqual(6);
    });
    $httpBackend.flush();
  }));

  it('cmModel - getIntermediateNodeCounts', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(function (model) {
      var intermediateNodeIndexes = model.getIntermediateNodeIndexes();
      expect(intermediateNodeIndexes.length).toEqual(6);
    });
    $httpBackend.flush();
  }));

  it('cmModel - getCurrentIntermediateNodeRows', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      var rows = model.getCurrentIntermediateNodeRows();
      expect(rows.length).toEqual(2);
    });
    $httpBackend.flush();
  }));

  it('cmModel - flights - getIntermediateNodePositions', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(function (model) {
      let positions = model.getIntermediateNodePositions();

      // numHops in the dataset range from 1,2,3
      // there should be 3 positions
      // [numHops, position]
      // [2, 1] -- 2 hops and the node in the middle
      // [3, 1] -- 3 hops and the node closer to source
      // [3, 2] -- 3 hops and the node closer to target
      expect(positions.length).toEqual(3);
    });
    $httpBackend.flush();
  }));

  it('cmModel - showing node stats in a row', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(function (model) {
      var rows = model.getCurrentIntermediateNodeRows();
      var positions = model.getIntermediateNodePositions();
      for (let i = 0; i < positions.length; ++i) {
        for (let j = 0; j < rows.length; ++j) {
          let values = rows[j].getValuesAsList([[String(positions[i])]]);
          for (let k = 0; k < values[0].length; ++k) {
            expect(values[0][k][positions[i][1]] == rows[j].nodeIndex).toBe(true);
          }
        }
      }

    });
    $httpBackend.flush();
  }));

  it('cmModel - getAvailableAttributes', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory).then(function (model) {
      let attributes = model.getAvailableAttributes();
      expect(attributes.length).toEqual(5);
    });
    $httpBackend.flush();
  }));

  it('cmModel - flights - getAvailableAttributes', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(function (model) {
      let attributes = model.getAvailableAttributes();
      expect(attributes.length).toEqual(7);
    });
    $httpBackend.flush();
  }));

  it('cmModel - flights - getPathsByNumHops', inject(($httpBackend, $q, cmModelFactory)=> {
    requestAndCreateModel($httpBackend, $q, cmModelFactory, true).then(function (model) {
      let paths = model.getAllPaths();
      expect(paths[1].length).toEqual(5);
      expect(paths[2].length).toEqual(10);
      expect(paths[3].length).toEqual(2);

      let total = model.getTotalNumPaths();
      expect(total).toEqual(17);
    });
    $httpBackend.flush();
  }));


});
