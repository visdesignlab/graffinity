export class cmModelRow {

  constructor() {
    var self = this;
    self.nodeIndex = undefined;
    self.children = [];
    self.values = undefined;
  }

  addChildRow(row) {
    var self = this;
    for (var i = 0; i < self.children.length; ++i) {
      if (self.children[i].getNodeIndex() == row.getNodeIndex()) {
        throw "Trying to add duplicate child!";
      }
    }
    self.children.push(row);
  }

  activate(nodeIndex, rowValues, colNodeIndexes) {
    var self = this;
    if (self.values != undefined) {
      throw "Cannot add values to already initialized row. Add them as children";
    }
    var values = {};
    self.nodeIndex = nodeIndex;
    if (rowValues.length != colNodeIndexes.length) {
      throw "Length of the row does not equal number of columns. WTF?"
    }

    for (var i = 0; i < rowValues.length; ++i) {
      values[colNodeIndexes[i]] = rowValues[i];
    }
    self.values = values;
  }

  getCopy() {
    var self = this;
    var copy = new cmModelRow();
    copy.nodeIndex = angular.copy(self.nodeIndex);
    copy.children = angular.copy(self.children);
    copy.values = angular.copy(self.values);
    return copy;
  }

  getAllNodeIndexes() {
    var self = this;
    var nodeIndexes = [];
    if (self.nodeIndex != undefined) {
      nodeIndexes.push(self.nodeIndex);
    }
    for (var i = 0; i < self.children.length; ++i) {
      nodeIndexes.push(self.children[i].getNodeIndex());
    }
    return nodeIndexes;
  }

  getAllValuesAsList(colNodeIndexes) {
    var self = this;
    var numValues = self.children.length;
    var results = [];

    for (var i = 0; i < colNodeIndexes.length; ++i) {
      var currentCol = [];
      var currentColNodeIndexes = colNodeIndexes[i];

      for (var j = 0; j < currentColNodeIndexes.length; ++j) {
        var currentColNodeIndex = currentColNodeIndexes[j];

        for (var k = 0; k < numValues; ++k) {
          var values = self.getChildRowAt(k).getValues(colNodeIndexes);
          currentCol = currentCol.concat(values[currentColNodeIndex]);
        }

        if (self.values) {
          currentCol = currentCol.concat(self.values[currentColNodeIndex]);
        }

      }
      results.push(currentCol);
    }

    return results;
  }

  getChildRowAt(index) {
    var self = this;
    return self.children[index];
  }

  getNumChildren() {
    var self = this;
    return self.children.length;
  }

  getNodeIndex() {
    var self = this;
    return self.nodeIndex;
  }

  getValues() {
    var self = this;
    return self.values;
  }

  getValuesAsList(colNodeIndexes) {
    var self = this;

    var results = [];
    for (var i = 0; i < colNodeIndexes.length; ++i) {
      var currentCol = [];
      var currentColNodeIndexes = colNodeIndexes[i];

      for (var j = 0; j < currentColNodeIndexes.length; ++j) {
        var currentColNodeIndex = currentColNodeIndexes[j];
        currentCol = currentCol.concat(self.values[currentColNodeIndex]);
      }

      results.push(currentCol);
    }
    return results;
  }
}
