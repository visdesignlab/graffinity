import {
  cmModel
} from "./cmModel"
import {
  cmModelRow
} from "./cmModelRow"

export class cmModelFactory {

  constructor($log, $q, cmGraphFactory, cmMatrixFactory, cmResource) {
    'ngInject';
    this.$log = $log;
    this.$q = $q;
    this.cmResource = cmResource;
    this.cmGraphFactory = cmGraphFactory;
    this.cmMatrixFactory = cmMatrixFactory;
    this.rawGraph = null;
    this.dataset = null; //  holds the graph that gets searched for paths.
    this.verbose = true;
    this.maxNumPaths = 1000000;
  }

  createConnectivityMatrixModel(paths) {
    let self = this;

    let sources = [];
    let targets = [];
    let matrix = [];

    for (let i = 0; i < paths.length; ++i) {
      let path = paths[i];
      let source = path[0];
      let target = path[path.length - 1];
      if (sources.indexOf(source) == -1) {
        sources.push(source);
      }

      if (targets.indexOf(target) == -1) {
        targets.push(target);
      }
    }

    for (let row = 0; row < sources.length; row++) {
      matrix[row] = [];
      for (let col = 0; col < targets.length; col++) {
        matrix[row][col] = [];
      }
    }

    for (let i = 0; i < paths.length; ++i) {
      let path = paths[i];
      let source = path[0];
      let target = path[path.length - 1];
      let rowIndex = sources.indexOf(source);
      let colIndex = targets.indexOf(target);
      matrix[rowIndex][colIndex].push(path);
    }

    let jsonMatrix = {
      source_ids: sources,
      target_ids: targets,
      matrix: matrix
    };

    let cmMatrix = self.cmMatrixFactory.createFromJsonObject(jsonMatrix);
    return new cmModel(self.dataset, cmMatrix);
  }

  createModelFromGraphSearch(query) {
    let self = this;

    let deferred = self.$q.defer();

    if (this.dataset) {
      let paths = self.findPathsByRegex(query);
      let model = self.createConnectivityMatrixModel(paths);
      deferred.resolve(model);
    } else {
      deferred.reject();
    }

    return deferred.promise;
  }

  /**
   * Iterative BFS to find paths that match constraints specified by query.
   */
  fillInPathsByRegex(query, paths) {
    let self = this;

    let maxNumHops = query.edges.length;
    let finishedPaths = [];
    let counter = self.maxNumPaths;

    let graph = self.dataset.graph;

    while (paths.length && counter > 0) {
      let currentPath = paths.shift();

      let currentNode = currentPath[currentPath.length - 1];
      let currentHop = Math.floor(currentPath.length / 2);

      if (currentHop >= maxNumHops) {
        finishedPaths.push(currentPath);
        continue;
      } else {
        let nextNodeConstraint = query.nodes[currentHop + 1];
        let nextEdgeConstraint = query.edges[currentHop];
        let currentNodeOutEdges = graph.outEdges(currentNode);

        if (!currentNodeOutEdges) {
          continue;
        }

        for (let i = 0; i < currentNodeOutEdges.length; ++i) {
          let currentEdge = currentNodeOutEdges[i];
          let edgeIndex = currentNodeOutEdges[i].name;
          let currentAttributes = self.dataset.edgeDict[edgeIndex];
          let edgeType = currentAttributes.type;
          let match = edgeType.match(nextEdgeConstraint);
          if (match && match[0] === edgeType) {
            let nextNodeId = currentEdge.w;
            let nextNode = graph.node(nextNodeId);
            match = nextNode.label.match(nextNodeConstraint)
            if (match && match[0] === nextNode.label) {
              let newPath = JSON.parse(JSON.stringify(currentPath));
              newPath.push(edgeIndex);
              newPath.push(nextNodeId.toString());
              paths.push(newPath);
            }
          }
        }
      }
    }
    return finishedPaths;
  }

  /**
   * Search for all nodes that match the first regex in query.nodes.
   * Then, build the paths that start with those nodes.
   */
  findPathsByRegex(query) {
    let self = this;
    let paths = [];
    let graph = self.dataset.graph;
    let nodes = graph.nodes();

    for (let i = 0; i < nodes.length; ++i) {
      let node = graph.node(nodes[i]);
      let match = node.label.match(query.nodes[0]);
      if (match && match[0] === node.label) {
        let path = [nodes[i]];
        paths.push(path);
      }
    }

    return self.fillInPathsByRegex(query, paths)
  }

  requestAndCreateModel(query, database) {
    var self = this;

    // Promise that represents the response we'll be expecting from the server.
    let deferred = this.$q.defer();

    // We got something back from the server! Create a model.
    let success = function (data) {
      var graph = self.cmGraphFactory.createFromJsonObject(data.graph, database);
      var matrix = self.cmMatrixFactory.createFromJsonObject(data.matrix);
      deferred.resolve(new cmModel(graph, matrix, data.lengths));
    };

    // Something went wrong!
    let failure = function (error) {
      deferred.reject(error);
    };

    // Send the request to the server.
    this.cmResource.postRequest(query, database).then(success, failure);

    // Return the promise. It will be resolved when we hear back from the server.
    return deferred.promise;
  }

  createModel(graph, matrix) {
    return new cmModel(graph, matrix);
  }

  createModelRow() {
    return new cmModelRow();
  }

  /*
   * This function populates this.database with a graphlib graph object created * by parsing the data contained in the parameter called 'graph'
   * 
   * TODO - this should be cleaned up and potentially deleted. It is left over * from when graffinity had to support many different datasets.
   */
  setGraphData(graph) {

    this.rawGraph = graph;

    // In an earlier version of graffinity, the server would send back  information about how to interpret attributes of the graph. Here, we hard code this value so that that the graph can be parsed.
    graph.node_attributes = [{
        "DisplayName": "id",
        "Name": "ID",
        "DataType": "index",
        "DatabaseName": "ID",
        "Unique": "true",
        "Type": "int"
      },
      {
        "DisplayName": "label",
        "Name": "Label",
        "DataType": "categorical",
        "DatabaseName": "label",
        "Unique": "false",
        "Type": "string"
      },
      {
        "DisplayName": "id",
        "Name": "StructureID",
        "DataType": "id",
        "DatabaseName": "StructureID",
        "Unique": "true",
        "Type": "int"
      },
      {
        "DisplayName": "area",
        "Name": "Area",
        "DataType": "quantitative",
        "DatabaseName": "Area",
        "Unique": "false",
        "Type": "float"
      },
      {
        "DisplayName": "volume",
        "Name": "Volume",
        "DataType": "quantitative",
        "DatabaseName": "Volume",
        "Unique": "false",
        "Type": "float"
      }
    ];

    this.dataset = this.cmGraphFactory.createFromJsonObject(graph, 'marclab');
  }
}
