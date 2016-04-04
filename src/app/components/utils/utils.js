/*eslint-disable */
var Utils;
Utils = (function () {
  'use strict';

  return {
    compareLists: compareLists,
    createMap: createMap,
    deleteCol: deleteCol,
    getNumHops: getNumHops,
    getNodesFromPaths: getNodesFromPaths,
    getUniqueValues: getUniqueValues,
    getValueRange: getValueRange,
    reduceMatrix: reduceMatrix,
    reduceRow: reduceRow,
    shiftPermutation: shiftPermutation
  };

  function compareLists(a, b) {
    var equal = true;

    if (a.length != b.length) {
      return false;
    }

    if (!angular.isArray(a) && !angular.isArray(b)) {
      return a == b;
    }

    a.forEach(function (d, i) {
      if (a[i].length > 0) {
        equal = equal && compareLists(a[i], b[i]);
      } else if (a[i].length == 0 && b[i].length == 0) {
        equal = equal && true;
      } else {
        equal = equal && a[i] == b[i];
      }
    });

    return equal;
  }

  function createMap(values, keys) {
    var map = {};
    var uniqueKeys = getUniqueValues(keys);
    for (var i = 0; i < uniqueKeys.length; ++i) {
      map[uniqueKeys[i]] = [];
    }

    for (i = 0; i < values.length; ++i) {
      map[keys[i]] = map[keys[i]].concat(values[i]);
    }

    return map;
  }

  function getNodesFromPaths(paths) {
    var nodes = [];
    for (var i = 0; i < paths.length; ++i) {
      var path = paths[i];
      for (var j = 0; j < path.length; ++j) {
        if (j % 2 == 0) {
          nodes.push(path[j]);
        }
      }
    }
    return getUniqueValues(nodes);
  }

  function getNumHops(path) {
    if (path.length == 3) {
      return 1;
    } else if (path.length == 5) {
      return 2;
    } else if (path.length == 7) {
      return 3;
    } else if (path.length == 9) {
      return 4;
    }
  }

  function getUniqueValues(values) {
    var uniqueValues = [];

    for (var i = 0; i < values.length; ++i) {
      if (uniqueValues.indexOf(values[i]) == -1) {
        uniqueValues.push(values[i]);
      }
    }

    return uniqueValues;
  }

  function getValueRange(values) {
    var minValue = values[0][0];
    var maxValue = values[0][0];
    for (var i = 0; i < values.length; ++i) {
      for (var j = 0; j < values[i].length; ++j) {
        minValue = Math.min(values[i][j], minValue);
        maxValue = Math.max(values[i][j], maxValue);
      }
    }
    return [minValue, maxValue];
  }

  function deleteCol(matrix, colIndex) {
    for (var i = 0; i < matrix.length; ++i) {
      var row = matrix[i];
      row.splice(colIndex, 1);
      matrix[i] = row;
    }
    return matrix;
  }

  function reduceMatrix(matrix) {
    var sum = 0;
    for (var i = 0; i < matrix.length; ++i) {
      sum += reduceRow(matrix[i]);
    }
    return sum;
  }

  function reduceRow(row) {
    var sum = 0;
    for (var i = 0; i < row.length; ++i) {
      sum += row[i].length;
    }
    return sum;
  }

  function shiftPermutation(permutation, shift) {
    var shifted = [];
    for (var i = 0; i < permutation.length + shift; ++i) {
      if (i < shift) {
        shifted.push(i);
      } else {
        shifted.push(permutation[i - shift] + shift);
      }
    }
    return shifted;
  }
})();
/*eslint-enable */
export {Utils};
