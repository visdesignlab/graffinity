import {cmModelRow} from './cmModelRow'
import {Utils} from '../utils/utils'

export class cmModel {

  constructor(graph, matrix, pathLengths) {
    var self = this;
    self.graph = graph;
    self.matrix = matrix;
    self.current = {};
    self.reset();
    self.pathLengths = pathLengths;

    self.colsCollapseAttr = "";
    self.rowCollapseAttr = "";

    self.areColsCollapsed = false;
    self.areRowsCollapsed = false;

    self.avilableAttributes = null;
  }

  collapseCols(colIndexesToCollapse) {
    var self = this;
    self.areColsCollapsed = true;
    // get the current matrix.
    var colNodeIndexes = self.getColNodeIndexes();
    var collapsedColIndexes = [];
    var numCols = colNodeIndexes.length;

    // for each list of col indexes to collapse...
    var currentColIndexesToCollapse = colIndexesToCollapse.pop();
    while (currentColIndexesToCollapse != undefined) {

      // for each index in the list...
      currentColIndexesToCollapse.reverse();
      var currentTargetCol = currentColIndexesToCollapse.pop();
      var currentColIndexCollapsing = currentColIndexesToCollapse.pop();
      while (currentColIndexCollapsing != undefined) {

        // remember that we collapsed the col
        collapsedColIndexes.push(currentColIndexCollapsing);

        // update the list of col indexes
        colNodeIndexes[currentTargetCol] = colNodeIndexes[currentTargetCol].concat(colNodeIndexes[currentColIndexCollapsing]);

        // move onto the next index
        currentColIndexCollapsing = currentColIndexesToCollapse.pop();
      }

      // move onto the next list
      currentColIndexesToCollapse = colIndexesToCollapse.pop();
    }

    // cut out the colNodeIndexes that we merged
    var numRemoved = 0;
    for (var i = 0; i < numCols; ++i) {
      if (collapsedColIndexes.indexOf(i) != -1) {
        colNodeIndexes.splice(i - numRemoved, 1);
        numRemoved += 1;
      }
    }

    // save results
    self.current.colNodeIndexes = colNodeIndexes;
  }

  collapseColsByAttr(attr) {
    var self = this;
    self.colsCollapseAttr = attr;
    var labels = [];
    var colIndexes = [];
    var colNodeIndexes = self.getColNodeIndexes();

    for (var i = 0; i < colNodeIndexes.length; ++i) {
      var label = self.getNodeAttr([colNodeIndexes[i]], attr);

      if (label.length > 1) {
        throw 'Trying to collapse cols by label but one was already collapsed!';
      }

      labels.push(label[0]);
      colIndexes.push(i);
    }

    var map = Utils.createMap(colIndexes, labels);
    labels = Object.keys(map);

    var colIndexesToCollapse = [];
    for (i = 0; i < labels.length; ++i) {
      colIndexesToCollapse.push(map[labels[i]]);
    }

    self.collapseCols(colIndexesToCollapse);
  }

  collapseRows(rowIndexesToCollapse) {
    var self = this;
    self.rowsAreDirty = true;
    var rowNodeIndexes = self.getRowNodeIndexes();
    var oldNumRows = rowNodeIndexes.length;

    var collapsedRowIndexes = [];
    var newRowNodeIndexes = [];

    rowIndexesToCollapse = rowIndexesToCollapse.reverse();
    var currentRowIndexesToCollapse = rowIndexesToCollapse.pop();

    // for each list of indexes to collapse...
    while (currentRowIndexesToCollapse != undefined) {
      currentRowIndexesToCollapse.reverse();
      var currentRowIndexCollapsing = currentRowIndexesToCollapse.pop();
      var currentNewRowNodeIndexes = [];

      // for each index in the current list....
      while (currentRowIndexCollapsing != undefined) {
        // mark this row as collapsed
        collapsedRowIndexes.push(currentRowIndexCollapsing);
        currentNewRowNodeIndexes = currentNewRowNodeIndexes.concat(rowNodeIndexes[currentRowIndexCollapsing]);
        currentRowIndexCollapsing = currentRowIndexesToCollapse.pop();
      }

      newRowNodeIndexes.push(currentNewRowNodeIndexes);
      currentRowIndexesToCollapse = rowIndexesToCollapse.pop();
    }

    // for all the rows that we didn't collapse, copy them into the new matrix
    for (var i = 0; i < oldNumRows; ++i) {
      if (collapsedRowIndexes.indexOf(i) == -1) {
        newRowNodeIndexes.push(rowNodeIndexes[i]);
      }
    }

    // update the current matrix
    self.current.rowNodeIndexes = newRowNodeIndexes;

  }

  collapseRowsByAttr(attr) {
    var self = this;
    self.rowCollapseAttr = attr;
    self.areRowsCollapsed = true;
    var rowNodeIndexes = self.getRowNodeIndexes();

    // labels[i] will contain the label of rowNodeIndexes[i].
    var labels = [];
    var rowIndexes = [];
    for (var i = 0; i < rowNodeIndexes.length; ++i) {
      var label = self.getNodeAttr([rowNodeIndexes[i]], attr);

      if (label.length > 1) {
        throw 'Trying to collapse rows by column, but there was already a collapsed row!';
      }

      labels.push(label[0]);
      rowIndexes.push(i);
    }

    // map['label'] = [list of rows to be combined]
    var map = Utils.createMap(rowIndexes, labels);
    labels = Object.keys(map);

    var rowIndexesToCollapse = [];
    // rowIndexesToCollapse is a list of lists.
    // rowIndexesToCollapse[i] - list of rows that will be collapsed to a new aggregate row.
    for (i = 0; i < labels.length; ++i) {
      rowIndexesToCollapse.push(map[labels[i]]);
    }

    self.collapseRows(rowIndexesToCollapse);
  }

  expandAllCols() {
    var self = this;
    self.areColsCollapsed = false;
    var colNodeIndexes = self.current.colNodeIndexes;
    var colsToExpand = [];
    for (var i = 0; i < colNodeIndexes.length; ++i) {
      if (colNodeIndexes[i].length > 1) {
        colsToExpand.push(i);
      }
    }
    self.expandCols(colsToExpand);
  }

  expandAllRows() {
    var self = this;
    self.areRowsCollapsed = false;
    var rowNodeIndexes = self.current.rowNodeIndexes;
    var rowsToExpand = [];
    for (var i = 0; i < rowNodeIndexes.length; ++i) {
      if (rowNodeIndexes[i].length > 1) {
        rowsToExpand.push(i);
      }
    }
    self.expandRows(rowsToExpand);
  }

  expandCols(colIndexesToExpand) {
    var self = this;
    self.colsCollapseAttr = "";
    var colNodeIndexes = self.current.colNodeIndexes;
    var colIndexesToDelete = [];

    // for each col index to expand...
    for (var i = 0; i < colIndexesToExpand.length; ++i) {
      var currentCol = colIndexesToExpand[i];
      var currentColNodeIndexes = colNodeIndexes[currentCol];

      // if col index has only one node index then finished.
      if (currentColNodeIndexes.length == 1) {
        continue;
      }

      // remember to delete this column
      colIndexesToDelete.push(currentCol);

      // add the individual node indexes to the list
      for (var j = 0; j < currentColNodeIndexes.length; ++j) {
        colNodeIndexes.push([currentColNodeIndexes[j]])
      }
    }

    // delete columns that we expanded
    var numColsDeleted = 0;
    for (i = 0; i < colIndexesToDelete.length; ++i) {
      colNodeIndexes.splice(colIndexesToDelete[i - numColsDeleted], 1);
      numColsDeleted++;
    }

    self.current.colNodeIndexes = colNodeIndexes;
  }

  expandRows(rowIndexesToExpand) {
    var self = this;
    self.rowsAreDirty = true;
    self.rowCollapseAttr = "";
    self.areRowsCollapsed = false;

    var newRowNodeIndexes = [];
    var rowNodeIndexes = self.current.rowNodeIndexes;
    var numRows = rowNodeIndexes.length;

    for (var i = 0; i < numRows; ++i) {
      var rowIndex = rowIndexesToExpand.indexOf(i);
      if (rowIndex == -1) {
        newRowNodeIndexes.push(rowNodeIndexes[i]);
      } else {
        var expandingRowIndex = rowIndexesToExpand[rowIndex];
        var currentRowNodeIndexes = rowNodeIndexes[expandingRowIndex];
        if (currentRowNodeIndexes.length == 1) {
          newRowNodeIndexes.push(currentRowNodeIndexes);
        } else {
          for (var j = 0; j < currentRowNodeIndexes.length; ++j) {
            var currentRowNodeIndex = currentRowNodeIndexes[j];
            newRowNodeIndexes.push([currentRowNodeIndex]);
          }
        }
      }
    }

    self.current.rowNodeIndexes = newRowNodeIndexes;
  }

  getAllPaths() {
    let self = this;
    let colNodeIndexes = self.getColNodeIndexes();
    let rows = self.getCurrentRows();
    let paths = {};
    for (let i = 0; i < rows.length; ++i) {
      let currentRowPaths = rows[i].getAllValuesAsList(colNodeIndexes);
      for (let j = 0; j < currentRowPaths.length; ++j) {
        let currentRowPathsByTarget = currentRowPaths[j];
        for (let k = 0; k < currentRowPathsByTarget.length; ++k) {
          let currentPath = currentRowPathsByTarget[k];
          let numHops = Utils.getNumHops(currentPath);
          if (paths[numHops]) {
            paths[numHops].push(currentPath);
          } else {
            paths[numHops] = [currentPath];
          }
        }
      }
    }

    // Error-check.
    for (let key in self.pathLengths) {
      if (paths[key].length != self.pathLengths[key]) {
        self.$log.error("Something went wrong. We lost some paths");
      }
    }

    return paths;
  }

  getAttributeType(attribute) {
    if (this.getCmGraph().getQuantNodeAttrNames().indexOf(attribute) != -1) {
      return "quantitative"
    } else {
      return "categorical";
    }
  }

  getAttributeValues(nodeIndexes) {
    let self = this;
    let attributes = self.getAvailableAttributes();
    let attributeValues = [];
    for (let i = 0; i < attributes.length; ++i) {
      let values = self.getNodeAttrs(nodeIndexes, attributes[i]);
      attributeValues.push(values);
    }
    return attributeValues;
  }

  getAvailableAttributes() {
    if (this.availableAttributes == null) {
      this.availableAttributes = this.getCmGraph().getQuantNodeAttrNames();
      this.availableAttributes = this.availableAttributes.concat(this.getCmGraph().getCategoricalNodeAttrNames());
    }
    return this.availableAttributes;
  }

  getAvailableIntermediateNodeStats() {
    return [['count']]; // list of lists to match col node index format.
  }

  getColNodeIndexes() {
    var self = this;
    return self.current.colNodeIndexes;
  }

  getCmGraph() {
    var self = this;
    return self.graph;
  }

  getCmMatrix() {
    var self = this;
    return self.matrix;
  }

  getColAttributeValues() {
    let self = this;
    return self.getAttributeValues(self.getColNodeIndexes());
  }

  getColsSortedByAttr(attribute, ascending) {
    var self = this;
    return self.getSortedIndexesOfNodeIndexAttr(self.current.colNodeIndexes, attribute, ascending);
  }

  // TODO - enable people to collapse these rows by attributes.
  getCurrentIntermediateNodeRows() {
    var self = this;
    return self.current.intermediateRows;
  }

  getCurrentMatrix() {
    var self = this;
    var colNodeIndexes = self.getColNodeIndexes();
    var rows = self.getCurrentRows();
    var matrix = [];
    for (var i = 0; i < rows.length; ++i) {
      matrix.push(rows[i].getAllValuesAsList(colNodeIndexes));
    }
    return matrix;
  }

  getCurrentRows() {
    var self = this;
    if (self.rowsAreDirty) {
      self.rowsAreDirty = false;
      self.current.rows = [];
      var rowNodeIndexes = self.current.rowNodeIndexes;
      for (var i = 0; i < rowNodeIndexes.length; ++i) {
        var row = undefined;
        var currentRowNodeIndexes = rowNodeIndexes[i];
        for (var j = 0; j < currentRowNodeIndexes.length; ++j) {
          var currentRowNodeIndex = currentRowNodeIndexes[j];
          if (row == undefined) {
            row = self.rows[currentRowNodeIndex].getCopy();
          } else {
            row.addChildRow(self.rows[currentRowNodeIndex].getCopy());
          }
        }
        self.current.rows.push(row);
      }
    }
    return self.current.rows;
  }

  getCurrentScalarMatrix() {
    var self = this;
    var scalarMatrix = [];
    var matrix = self.getCurrentMatrix();
    for (var i = 0; i < matrix.length; ++i) {
      var scalarRow = [];
      for (var j = 0; j < matrix[i].length; ++j) {
        scalarRow.push(matrix[i][j].length);
      }
      scalarMatrix.push(scalarRow);
    }

    return scalarMatrix;
  }

  getFlattenedColNodeIndexes() {
    return Utils.getUniqueValues(Utils.getFlattenedLists(this.getColNodeIndexes()));
  }

  getFlattenedNodeIndexes() {
    let nodeIndexLists = this.getRowNodeIndexes().concat(this.getColNodeIndexes());
    return Utils.getUniqueValues(Utils.getFlattenedLists(nodeIndexLists));
  }

  getFlattenedRowNodeIndexes() {
    return Utils.getUniqueValues(Utils.getFlattenedLists(this.getRowNodeIndexes()));
  }

  getIntermediateNodeIndexes() {
    let self = this;
    return self.intermediateNodeIndexes;
  }

  getIntermediateIndexesSortedByAttr(attribute, ascending) {
    var self = this;
    return self.getSortedIndexesOfNodeIndexAttr(self.current.intermediateNodeIndexes, attribute, ascending);
  }

  getIntermediateNodeAttributeValues() {
    let self = this;
    return self.getAttributeValues(self.getIntermediateNodeIndexes());
  }

  getIntermediateRowNodeAttributeValues() {
    let self = this;
    let rowAttributes = self.getIntermediateNodeAttributeValues();
    if (rowAttributes.length > 0) {
      let rowNodeAttributes = angular.copy(rowAttributes[0]);
      for (let i = 0; i < rowNodeAttributes.length; ++i) {
        rowNodeAttributes[i] = [rowNodeAttributes[i]];
      }

      for (let i = 1; i < self.getAvailableAttributes().length; ++i) {
        for (let j = 0; j < rowAttributes[i].length; ++j) {
          rowNodeAttributes[j] = rowNodeAttributes[j].concat([rowAttributes[i][j]])
        }
      }
      return rowNodeAttributes;
    }
  }

  getIntermediateNodePositions() {
    let self = this;
    let paths = self.getAllPaths();
    let positions = [];
    for (let key in paths) {
      key = parseInt(key) * 2 + 1;
      for (let i = 2; i < key - 1; i += 2) {
        positions.push([key, i]);
      }
    }
    return positions;
  }

  getIntermediatePositionsOfNode(nodeIndex, path) {
    let positions = [];
    for (let i = 0; i < path.length; i += 2) {
      if (path[i] == nodeIndex) {
        positions.push([path.length, i]);
      }
    }
    return positions;
  }

  getMinorLabels(indexes) {
    var self = this;
    var minorLabels = [];
    for (var i = 0; i < indexes.length; ++i) {
      var currIndexes = indexes[i];
      minorLabels.push(self.getNodeAttr(currIndexes, self.getCmGraph().getNodeIdName()));
    }
    return minorLabels;
  }

  getMajorLabels(indexes, attr) {
    var self = this;
    if (attr && attr.length > 0) {
      return self.getViewLabels(indexes, attr);
    } else {
      return self.getNodeAttr(indexes, self.getCmGraph().getNodeIdName());
    }
  }

  getMajorColLabels() {
    var self = this;
    return self.getMajorLabels(self.getColNodeIndexes(), self.colsCollapseAttr);
  }

  getMinorColLabels() {
    var self = this;
    return self.getMinorLabels(self.getColNodeIndexes());
  }

  getMajorRowLabels() {
    var self = this;
    return self.getMajorLabels(self.getRowNodeIndexes(), self.rowCollapseAttr);
  }

  getMinorRowLabels() {
    var self = this;
    return self.getMinorLabels(self.getRowNodeIndexes());
  }

  getNodeAttrs(nodeIndexes, attribute) {
    var self = this;
    var attributes = [nodeIndexes.length];
    for (var i = 0; i < nodeIndexes.length; ++i) {
      attributes[i] = [];
      for (var j = 0; j < nodeIndexes[i].length; ++j) {
        attributes[i].push(self.graph.getNode(nodeIndexes[i][j])[attribute]);
      }
    }
    return attributes;
  }

  // TODO - this is a hack to get the intermediate nodes working.
  getNodeAttr(nodeIndexes, attribute) {
    var self = this;
    var attributes = [nodeIndexes.length];
    for (var i = 0; i < nodeIndexes.length; ++i) {
      if (attribute == "count") {
        attributes[i] = this.intermediateNodeCount[nodeIndexes[i]];
      } else {
        attributes[i] = self.graph.getNode(nodeIndexes[i])[attribute];
      }
    }
    return attributes;
  }

  getNodesFromAllPaths() {
    var self = this;
    var matrix = self.getCurrentMatrix();
    var nodes = [];
    for (var i = 0; i < matrix.length; ++i) {
      for (var j = 0; j < matrix[0].length; ++j) {
        nodes = nodes.concat(self.getNodesFromGridCellPaths(i, j));
      }
    }
    return Utils.getUniqueValues(nodes);
  }

  getNodesFromGridCellPaths(rowIndex, colIndex) {
    var self = this;
    var matrix = self.getCurrentMatrix();
    var paths = matrix[rowIndex][colIndex];

    if (paths == undefined) {
      throw 'Getting nodes from grid cell paths failed!'
    }

    return Utils.getNodesFromPaths(paths);

  }

  getRowNodeAttributeValues() {
    let self = this;
    let rowAttributes = self.getRowAttributeValues();
    if (rowAttributes.length > 0) {
      let rowNodeAttributes = angular.copy(rowAttributes[0]);
      for (let i = 0; i < rowNodeAttributes.length; ++i) {
        rowNodeAttributes[i] = [rowNodeAttributes[i]];
      }

      for (let i = 1; i < self.getAvailableAttributes().length; ++i) {
        for (let j = 0; j < rowAttributes[i].length; ++j) {
          rowNodeAttributes[j] = rowNodeAttributes[j].concat([rowAttributes[i][j]])
        }
      }
      return rowNodeAttributes;
    }
  }

  getRowAttributeValues() {
    let self = this;
    return self.getAttributeValues(self.getRowNodeIndexes());
  }

  /**
   * Returns a list of indexes into nodeIndexes - the returned list is sorted by attribute.
   * @param {Array} nodeIndexes - list of lists of node indexes
   * @param {string} attribute - attribute to sort nodes by
   * @param {boolean} ascending - order of the attribute
   */
  getSortedIndexesOfNodeIndexAttr(nodeIndexes, attribute, ascending) {
    var self = this;
    var nodeValues = []; // will be max value of each entry in nodeIndexes
    var sortedIndexes = [];

    // find max values of each node index list in nodeIndexes
    for (var i = 0; i < nodeIndexes.length; ++i) {
      if (attribute) {
        var currentNodeIndexes = nodeIndexes[i];
        var maxAttrValue = null;

        // find max values of each node in nodeIndexes[i]
        for (var j = 0; j < currentNodeIndexes.length; ++j) {
          var currentRowNodeIndex = currentNodeIndexes[j];
          if (maxAttrValue == null) {
            maxAttrValue = self.getNodeAttr([currentRowNodeIndex], attribute);
          } else {
            maxAttrValue = Math.max(self.getNodeAttr([currentRowNodeIndex], attribute), maxAttrValue);
          }

          nodeValues.push(maxAttrValue);
        }
      } else {
        nodeValues.push(nodeIndexes[i]);
      }
      sortedIndexes[i] = i;
    }

    // sort the indexes according to the node values.
    sortedIndexes.sort(function (a, b) {
      return nodeValues[a][0] < nodeValues[b][0] ? -1 : nodeValues[a][0] > nodeValues[b][0] ? 1 : 0;
    });

    // order results
    if (ascending) {
      return sortedIndexes;
    } else {
      return sortedIndexes.reverse();
    }
  }

  getPathsFromCol(targetNodeIndex, col) {
    //var self = this;
    var paths = [];
    for (var i = 0; i < col.length; ++i) {
      var path = col[i];
      if (path[path.length - 1] == targetNodeIndex) {
        paths.push(col[i]);
      }
    }
    return paths;
  }

  getPathsFromRow(nodeIndex, row) {
    // var self = this;
    var newRow = [];
    // loop over columns
    for (var i = 0; i < row.length; ++i) {
      newRow.push([]);
    }
    for (i = 0; i < row.length; ++i) {
      // loop over paths
      for (var j = 0; j < row[i].length; ++j) {
        var currentPath = row[i][j];
        if (currentPath[0] == nodeIndex) {
          newRow[i].push(currentPath);
        }
      }
    }
    return newRow;
  }

  /**
   * Find any path in the current model that has an intermediate node in nodeIndexes.
   */
  getPathsWithIntermediates(nodeIndexes) {
    let self = this;
    let paths = [];
    let matrix = self.getCurrentMatrix();

    // For each cell in the matrix...
    for (var i = 0; i < matrix.length; ++i) {
      for (var j = 0; j < matrix[i].length; ++j) {
        let currentPaths = matrix[i][j];
        // For each path in the cell...
        for (let k = 0; k < currentPaths.length; ++k) {
          // Only add the path if it has an intermediate node that we're looking for.
          if (Utils.getIntersection(Utils.getIntermediateNodesFromPaths([currentPaths[k]]), nodeIndexes).length) {
            paths.push(currentPaths[k]);
          }
        }
      }
    }

    return paths;
  }

  /**
   * Find any path in the current model that has a source node in nodeIndexes.
   */
  getPathsWithSources(nodeIndexes) {

    let self = this;
    let paths = [];

    let matrix = self.getCurrentMatrix();
    let rowNodeIndexes = self.getRowNodeIndexes();

    for (var i = 0; i < matrix.length; ++i) {
      if (Utils.getIntersection(nodeIndexes, rowNodeIndexes[i]).length != 0) {
        for (var j = 0; j < matrix[i].length; ++j) {
          let currentPaths = matrix[i][j];
          for (let k = 0; k < currentPaths.length; ++k) {
            let currentSource = currentPaths[k][0];
            if (nodeIndexes.indexOf(currentSource) != -1) {
              paths.push(currentPaths[k]);
            }
          }
        }
      }
    }

    return paths;
  }

  /**
   * Find any path in the current model that has a target node in nodeIndexes.
   */
  getPathsWithTargets(nodeIndexes) {

    let self = this;
    let paths = [];

    let matrix = self.getCurrentMatrix();
    let colNodeIndexes = self.getColNodeIndexes();

    for (var i = 0; i < matrix.length; ++i) {
      for (var j = 0; j < matrix[i].length; ++j) {
        if (Utils.getIntersection(nodeIndexes, colNodeIndexes[j]).length != 0) {
          let currentPaths = matrix[i][j];
          for (let k = 0; k < currentPaths.length; ++k) {
            let currentTarget = currentPaths[k][currentPaths[k].length - 1];
            if (nodeIndexes.indexOf(currentTarget) != -1) {
              paths.push(currentPaths[k]);
            }
          }
        }
      }
    }

    return paths;
  }

  getRowNodeIndexes() {
    var self = this;
    return self.current.rowNodeIndexes;
  }

  getRowsSortedByAttr(attribute, ascending) {
    var self = this;
    return self.getSortedIndexesOfNodeIndexAttr(self.current.rowNodeIndexes, attribute, ascending);
  }

  getTotalNumPaths() {
    let self = this;
    let total = 0;
    for (let key in self.pathLengths) {
      total += self.pathLengths[key]
    }
    return total;
  }

  getViewLabels(nodeIndexesLists, groupAttr) {
    var self = this;
    var labels = [];
    for (var i = 0; i < nodeIndexesLists.length; ++i) {
      labels.push([self.getNodeAttrs([nodeIndexesLists[i]], groupAttr)[0][0]]);
    }
    return labels;
  }

  isCategoricalAttribute(attribute) {
    return this.getCmGraph().getCategoricalNodeAttrNames().indexOf(attribute) != -1;
  }

  reset() {
    var self = this;
    self.resetMatrix();
    self.resetRows();
    self.resetCols();
    self.resetIntermediateNodes();
    self.availableAttributes = null;
  }

  resetCols() {
    var self = this;
    self.current.colNodeIndexes = [];
    var cols = self.matrix.getJsonMatrix().target_ids;
    for (var i = 0; i < cols.length; ++i) {
      self.current.colNodeIndexes.push([cols[i]]);
    }
  }

  resetRows() {
    var self = this;
    self.rowsAreDirty = true;
    self.current.rowNodeIndexes = [];
    self.rows = {};

    var matrix = self.matrix.getJsonMatrix().matrix;
    var originalRowNodeIndexes = self.matrix.getJsonMatrix().source_ids;
    var colNodeIndexes = self.matrix.getJsonMatrix().target_ids;
    for (var i = 0; i < originalRowNodeIndexes.length; ++i) {
      var currentRowNodeIndex = originalRowNodeIndexes[i];
      self.current.rowNodeIndexes.push([currentRowNodeIndex]);

      var row = new cmModelRow();
      row.activate(currentRowNodeIndex, matrix[i], colNodeIndexes);
      self.rows[currentRowNodeIndex] = row;
    }
  }

  // TODO - this should match resetRows in terms of what gets created.
  resetIntermediateNodes() {
    let self = this;
    let matrix = self.current.matrix;
    let nodeIndexes = [];
    for (let i = 0; i < matrix.length; ++i) {
      for (let j = 0; j < matrix[i].length; ++j) {
        nodeIndexes = nodeIndexes.concat(Utils.getIntermediateNodesFromPaths(matrix[i][j]));
      }
    }

    nodeIndexes = Utils.getUniqueValues(nodeIndexes);
    for (let i = 0; i < nodeIndexes.length; ++i) {
      nodeIndexes[i] = [nodeIndexes[i]];
    }
    self.intermediateNodeIndexes = nodeIndexes;

    let positions = self.getIntermediateNodePositions();


    let positionKeys = [];
    for (let i = 0; i < positions.length; ++i) {
      positionKeys.push(String(positions[i]));
    }

    let intermediateNodeCounts = {};
    for (let i = 0; i < nodeIndexes.length; ++i) {
      intermediateNodeCounts[nodeIndexes[i][0]] = [];
      for (let j = 0; j < positions.length; ++j) {
        intermediateNodeCounts[nodeIndexes[i][0]][j] = [];
      }
    }

    let paths = self.getAllPaths();
    for (let key in paths) {
      let currentPaths = paths[key];
      for (let i = 0; i < currentPaths.length; ++i) {
        let currentPath = currentPaths[i];
        for (let j = 0; j < nodeIndexes.length; ++j) {
          let positions = self.getIntermediatePositionsOfNode(nodeIndexes[j][0], currentPath);
          for (let k = 0; k < positions.length; ++k) {
            let position = positions[k];
            if (positionKeys.indexOf(String(position)) != -1) {
              intermediateNodeCounts[nodeIndexes[j][0]][positionKeys.indexOf(String(position))].push(currentPath);
            }
          }
        }
      }
    }

    self.intermediateNodeCounts = intermediateNodeCounts;
    self.intermediateRows = [];

    for (let i = 0; i < self.intermediateNodeIndexes.length; ++i) {
      var currentRowNodeIndex = self.intermediateNodeIndexes[i][0];

      var row = new cmModelRow();
      row.activate(currentRowNodeIndex, self.intermediateNodeCounts[currentRowNodeIndex], positionKeys);
      self.intermediateRows.push(row);
    }

    self.current.intermediateNodeIndexes = angular.copy(self.intermediateNodeIndexes);
    self.current.intermediateRows = angular.copy(self.intermediateRows);
  }

  resetMatrix() {
    var self = this;
    self.current.matrix = angular.copy(self.matrix.getJsonMatrix().matrix);
  }
}
