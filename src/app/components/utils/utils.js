/*eslint-disable */
var Utils;
Utils = (function () {
  'use strict';

  return {
    compareLists: compareLists,
    createMap: createMap,
    deleteCol: deleteCol,
    getAreaFromPaths: getAreaFromPaths,
    getEdgesFromPaths: getEdgesFromPaths,
    getFilteredPaths: getFilteredPaths,
    getFlattenedLists: getFlattenedLists,
    getIntermediateNodesFromPaths: getIntermediateNodesFromPaths,
    getIntersection: getIntersection,
    getNumHops: getNumHops,
    getNodesFromPaths: getNodesFromPaths,
    getSourceNodesFromPaths: getSourceNodesFromPaths,
    getTargetNodesFromPaths: getTargetNodesFromPaths,
    getUniqueValues: getUniqueValues,
    getValueRange: getValueRange,
    hasIntersection: hasIntersection,
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

  function getAreaFromPaths(area, paths, graph) {
    let sizes = 0;
    for (let i = 0; i < paths.length; ++i) {
      let path = paths[i];
      for (let j = 1; j < path.length; j = j + 2) {
        let edgeId = path[j];
        let edge = graph.graph.edge(path[j - 1], path[j + 1], edgeId);
        sizes = sizes + edge[area];
      }
    }
    return Math.round(sizes);
  }

  function getEdgesFromPaths(paths) {
    var edges = [];
    for (var i = 0; i < paths.length; ++i) {
      var path = paths[i];
      for (var j = 0; j < path.length; ++j) {
        if (j % 2 == 1) {
          edges.push(path[j]);
        }
      }
    }
    return getUniqueValues(edges);
  }

  function getFilteredPaths(paths, hasNodeFilter, isNodeHidden) {
    if (hasNodeFilter) {
      let filteredPaths = [];
      for (var i = 0; i < paths.length; ++i) {
        let source = paths[i][0];
        let target = paths[i][paths[i].length - 1];
        if (!isNodeHidden[source] && !isNodeHidden[target]) {
          filteredPaths.push(paths[i]);
        }
      }
      return filteredPaths;
    } else {
      return paths;
    }
  }

  function getFlattenedLists(listOfLists) {
    let list = [];
    for (var i = 0; i < listOfLists.length; ++i) {
      if (listOfLists[i].length) {
        for (var j = 0; j < listOfLists[i].length; ++j) {
          list.push(listOfLists[i][j]);
        }
      } else {
        list.push(listOfLists[i]);
      }
    }
    return list;
  }

  function getIntermediateNodesFromPaths(paths) {
    var nodes = [];
    for (var i = 0; i < paths.length; ++i) {
      var path = paths[i];
      for (var j = 2; j < path.length - 1; ++j) {
        if (j % 2 == 0) {
          nodes.push(path[j]);
        }
      }
    }
    return getUniqueValues(nodes);
  }

  function getIntersection(a, b) {
    let intersection = [];
    for (let i = 0; i < a.length; ++i) {
      if (b.indexOf(a[i]) != -1) {
        intersection.push(a[i]);
      }
    }
    return intersection;
  }

  function hasIntersection(a, b) {
    for (let i = 0; i < a.length; ++i) {
      if (b.indexOf(a[i]) != -1) {
        return true;
      }
    }
    return false;
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

  function getIntermediateNodesFromPaths(paths) {
    var nodes = [];
    for (var i = 0; i < paths.length; ++i) {
      var path = paths[i];
      for (var j = 1; j < path.length - 1; ++j) {
        if (j % 2 == 0) {
          nodes.push(path[j]);
        }
      }
    }
    return getUniqueValues(nodes);
  }

  function getSourceNodesFromPaths(paths) {
    let nodes = [];
    for (let i = 0; i < paths.length; ++i) {
      let path = paths[i];
      nodes.push(path[0]);
    }
    return getUniqueValues(nodes);
  }

  function getTargetNodesFromPaths(paths) {
    let nodes = [];
    for (let i = 0; i < paths.length; ++i) {
      let path = paths[i];
      nodes.push(path[path.length - 1]);
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
