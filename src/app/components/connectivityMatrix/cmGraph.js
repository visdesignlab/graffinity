/*global
 graphlib
 */

import {
  Utils
} from "../utils/utils"

export class cmGraph {

  constructor(jsonGraph, database) {
    this.jsonGraph = jsonGraph;
    this.database = database;
    this.activate();
  }

  activate() {
    let self = this;
    this.graph = new graphlib.Graph({
      multigraph: true
    });

    // create nodes
    self.nodeAttributes = self.activateNodeAttributes(self.jsonGraph.node_attributes);
    for (var i = 0; i < self.nodeAttributes.length; ++i) {
      if (self.nodeAttributes[i].isIndex) {
        this.indexAttributeIndex = i;
      } else if (this.nodeAttributes[i].isId) {
        this.idAttributeIndex = i;
      }
    }

    for (i = 0; i < this.jsonGraph.nodes.length; ++i) {
      var node = this.jsonGraph.nodes[i];
      var index = this.parseNodeId(node, this.nodeAttributes, this.idAttributeIndex);
      var attributes = this.parseAttributes(node, this.nodeAttributes, this.indexAttributeIndex);
      this.graph.setNode(index, attributes);
    }

    // create edges.
    this.edgeDict = {};
    if (this.database == "marclab") {
      for (i = 0; i < this.jsonGraph.edges.length; ++i) {
        let edge = this.jsonGraph.edges[i];
        let sourceId = edge.SourceStructureID;
        let targetId = edge.TargetStructureID;
        let source = this.getNode(sourceId);
        let target = this.getNode(targetId);

        if (source == undefined || target == undefined) {
          throw 'Error creating edge in graph! ' + sourceId + ', ' + targetId;
        }

        attributes = {
          links: edge.Links,
          sourceSizes: edge.SourceSizes,
          targetSizes: edge.TargetSizes,
          sourceStructureId: edge.SourceStructureID,
          targetStructureId: edge.TargetStructureID,
          type: edge.Type,
          carrier: edge.Carrier
        };

        let linkedStructures = "";
        if (edge.Links) {
          for (let i = 0; i < edge.Links.length; ++i) {
            let link = edge.Links[i];
            let description = link.SourceID;
            description = description + (link.Directional ? " -> " : " <-> ");
            description = description + link.TargetID;
            if (linkedStructures.length) {
              linkedStructures = linkedStructures + ";";
            }
            linkedStructures = linkedStructures + description;
          }
        }

        attributes.linkedStructures = linkedStructures;

        this.edgeDict[edge.ID] = attributes;

        this.graph.setEdge(sourceId, targetId, attributes, edge.ID);

        if (!edge.Directional && edge.SourceStructureID != edge.TargetStructureID) {
          let id = (-Number(edge.ID)).toString();
          self.edgeDict[id] = attributes;
          this.graph.setEdge(targetId, sourceId, attributes, id);
        }
      }
    } else {
      // TODO - delete control flow for flight data. 
      for (i = 0; i < this.jsonGraph.edges.length; ++i) {
        let edge = this.jsonGraph.edges[i];
        let sourceId = edge.SourceID;
        let targetId = edge.TargetID;
        let source = this.getNode(sourceId);
        let target = this.getNode(targetId);

        if (source == undefined || target == undefined) {
          throw 'Error creating edge in graph! ' + sourceId + ', ' + targetId;
        }

        attributes = {
          date: edge.DepDate,
          flightNum: edge.FlightNum,
          depTime: edge.DepTime,
          arrTime: edge.ArrTime,
          carrier: edge.Carrier
        };

        this.edgeDict[edge.ID] = attributes;

        this.graph.setEdge(sourceId, targetId, attributes, edge.ID);
      }
    }
  }

  activateNodeAttributes(attributes) {
    var result = [];
    result.attributes = [];

    // find the primary attribute
    for (var i = 0; i < attributes.length; ++i) {
      var input = attributes[i];
      var current = {};

      current.name = input.DisplayName;
      current.parseName = input.Name;
      current.isId = false; // is unique identifier of nodes
      current.isIndex = false; // is index used to store node in the graph
      current.isCategorical = false;
      current.isQuantitative = false;
      current.isString = false;
      current.parseFn = null;

      if (input.DataType == 'index') {
        current.isIndex = true;
        current.parseFn = parseInt;
      } else if (input.DataType == 'id') {
        current.isId = true;
        if (!(input.Type == 'string' || input.Type == 'int')) {
          throw 'Invalid data type for id!';
        }
      } else if (input.DataType == 'categorical') {
        current.isCategorical = true;
      } else if (input.DataType == 'quantitative') {
        current.isQuantitative = true;
      }

      if (input.Type == 'int') {
        current.parseFn = parseInt;
      } else if (input.Type == 'float') {
        current.parseFn = parseFloat;
      } else if (input.Type == 'string') {
        if (current.isQuantitative) {
          throw 'Bad datatype!';
        } else {
          current.parseFn = function (x) {
            return x ? x.trim() : 'Null';
          }
        }
      }
      result.push(current);
    }

    for (i = 0; i < result.length; ++i) {
      if (result[i].parseFn == null) {
        throw "Bad attribute definitions!";
      }
    }

    return result;
  }

  convertEdgeToLink(edge, nodes) {
    var targetIndex = undefined;
    var sourceIndex = undefined;

    // convert edge's node ids to indexes of the node list.
    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      if (edge.v == node.id) {
        sourceIndex = i;
      }
      if (edge.w == node.id) {
        targetIndex = i;
      }
    }

    // did we find both source and target?
    if (targetIndex == undefined || sourceIndex == undefined) {
      throw 'Error converting edge to link!';
    }

    return {
      source: sourceIndex,
      target: targetIndex,
      value: this.graph.edge(edge)
    };

  }

  getAsD3Input(nodeIdFilter) {
    var result = {
      nodes: [],
      links: []
    };

    // Get list of nodes that are in the filter.
    var nodes = this.getNodes();
    for (var i = 0; i < nodes.length; ++i) {
      var node = nodes[i];
      var attributes = this.graph.node(node);
      if ((nodeIdFilter == undefined) || (nodeIdFilter != undefined && nodeIdFilter.indexOf(Number(node)) != -1)) {
        result.nodes.push({
          id: node,
          attributes: attributes
        });
      }
    }

    // Get list of edges that are in the filter
    var edges = this.graph.edges();
    var edgesToConvert = [];
    for (i = 0; i < edges.length; ++i) {
      var edge = edges[i];
      var edgeTargetInFilter = true;
      var edgeSourceInFilter = true;

      if (nodeIdFilter != undefined) {
        edgeTargetInFilter = edgeTargetInFilter && nodeIdFilter.indexOf(Number(edge.v)) != -1;
        edgeSourceInFilter = edgeSourceInFilter && nodeIdFilter.indexOf(Number(edge.w)) != -1;
      }

      if (edgeTargetInFilter && edgeSourceInFilter) {
        edgesToConvert.push(edge);
      }

    }

    // convert edges into links - links use indexes of the nodes to represent connections.
    for (i = 0; i < edgesToConvert.length; ++i) {
      result.links.push(this.convertEdgeToLink(edgesToConvert[i], result.nodes));
    }

    return result;
  }

  getCategoricalNodeAttrNames() {
    var names = [];
    for (var i = 0; i < this.nodeAttributes.length; ++i) {
      if (this.nodeAttributes[i].isCategorical) {
        names.push(this.nodeAttributes[i].name);
      }
    }
    return names;
  }

  getEdge(edgeIndex) {
    return this.edgeDict[edgeIndex];
  }

  getEdgeDescription(edgeIndex) {
    let edge = this.getEdge(edgeIndex);
    if (this.database == "flights") {
      return edge.carrier + "-" + edge.flightNum;
    } else {
      return edge.type;
    }
  }

  getEdgeDetails(edgeIndex) {
    let edge = this.getEdge(edgeIndex);

    if (this.database == "flights") {
      return "Dep: " + edge.depTime + "<br>Arr: " + edge.arrTime;
    } else {
      return edge.linkedStructures;
    }
  }

  getEdges() {
    var edges = this.graph.edges();
    var list = [];
    for (var i = 0; i < edges.length; ++i) {
      list.push(this.graph.edge(edges[i]));
    }
    return list;
  }

  getJsonGraph() {
    return this.jsonGraph;
  }

  getNode(id) {
    return this.graph.node(id);
  }

  getNodeIdName() {
    return this.nodeAttributes[this.idAttributeIndex].name;
  }

  getNodes() {
    return this.graph.nodes();
  }

  getQuantNodeAttrNames() {
    var names = [];
    for (var i = 0; i < this.nodeAttributes.length; ++i) {
      if (this.nodeAttributes[i].isQuantitative) {
        names.push(this.nodeAttributes[i].name);
      }
    }
    return names;
  }

  getSubgraph(paths) {
    // extract node and edge indexes from the paths
    let nodes = Utils.getNodesFromPaths(paths);
    let edges = Utils.getEdgesFromPaths(paths);

    let subgraph = new graphlib.Graph({
      multigraph: true
    });

    // the subgraph's graph is an object used by dagre layout.
    subgraph.setGraph({});

    // existing graph
    let graph = this.graph;

    // if a node is in paths, add it to the subgraph
    graph.nodes().forEach(function (key) {
      let id = key;
      if (nodes.indexOf(id) != -1) {
        let value = graph.node(key);
        subgraph.setNode(id, value);
      }
    });

    // if an edge's source and target nodes in paths, add it to the subgraph
    graph.edges().forEach(function (key) {
      let id = key.name;
      if (edges.indexOf(id) != -1) {
        subgraph.setEdge(key.v, key.w, graph.edge(key), key.name);
      }
    });

    return subgraph;
  }

  parseNodeId(node, nodeAttributes, idAttributeIndex) {
    var attribute = nodeAttributes[idAttributeIndex];
    return attribute.parseFn(node[attribute.parseName]);
  }

  parseAttributes(node, attributes, skipIndex) {
    var result = {};
    for (var i = 0; i < attributes.length; ++i) {
      if (i != skipIndex) {
        var attribute = attributes[i];
        result[attribute.name] = attribute.parseFn(node[attribute.parseName]);
      }
    }
    return result;
  }
}
