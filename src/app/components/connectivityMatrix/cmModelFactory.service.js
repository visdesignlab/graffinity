import { cmModel } from "./cmModel"
import { cmModelRow } from "./cmModelRow"

export class cmModelFactory {

  constructor($log, $q, cmGraphFactory, cmMatrixFactory, cmResource) {
    'ngInject';
    this.$log = $log;
    this.$q = $q;
    this.cmResource = cmResource;
    this.cmGraphFactory = cmGraphFactory;
    this.cmMatrixFactory = cmMatrixFactory;
    this.dataset = null; //  holds the graph that gets searched for paths.
    this.verbose = true;
    this.maxNumPaths = 1000000;
  }

  createModelFromGraphSearch(query) {
    let self = this;

    let deferred = self.$q.defer();

    if (this.dataset) {
      let paths = self.findPathsByRegex(query);
      deferred.resolve(paths);
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
          if (edgeType.match(nextEdgeConstraint)) {
            let nextNodeId = currentEdge.w;
            let nextNode = graph.node(nextNodeId);
            if (nextNode.label.match(nextNodeConstraint)) {
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
      if (node.label.match(query.nodes[0])) {
        let path = [nodes[i]];
        paths.push(path);
      }
    }

    self.fillInPathsByRegex(query, paths)
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
      }
    ];

    graph.edge_attributes = [{
        "DataType": "index",
        "Type": "int",
        "Unique": "true",
        "DisplayName": "id",
        "Name": "ID"
      },
      {
        "DataType": "source-index",
        "Type": "int",
        "Unique": "false",
        "DisplayName": "source id",
        "Name": "SourceStructureID"
      },
      {
        "DataType": "target-index",
        "Type": "int",
        "Unique": "true",
        "DisplayName": "target id",
        "Name": "TargetStructureID"
      },
      {
        "DataType": "categorical",
        "Type": "string",
        "Unique": "false",
        "DisplayName": "edge type",
        "Name": "type"
      },
      {
        "DataType": "string",
        "Type": "string",
        "Unique": "false",
        "DisplayName": "structures",
        "Name": "LinkedStructures"
      }
    ];

    this.dataset = this.cmGraphFactory.createFromJsonObject(graph, 'marclab');
  }
}
