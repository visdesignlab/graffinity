/*global
 graphlib
 */
export class cmGraph {

  constructor(jsonGraph) {
    this.jsonGraph = jsonGraph;
    this.activate();
  }

  activate() {
    this.graph = new graphlib.Graph({multigraph: true});

    // create nodes
    this.nodeAttributes = this.activateNodeAttributes(this.jsonGraph.node_attributes);
    for (var i = 0; i < this.nodeAttributes.length; ++i) {
      if (this.nodeAttributes[i].isIndex) {
        this.indexAttributeIndex = i;
      } else if (this.nodeAttributes[i].isId) {
        this.idAttributeIndex = i;
      }
    }

    for (i = 0; i < this.jsonGraph.nodes.length; ++i) {
      var node = this.jsonGraph.nodes[i];
      var index = this.parseNodeId(node, this.nodeAttributes, this.indexAttributeIndex);
      var attributes = this.parseAttributes(node, this.nodeAttributes, this.indexAttributeIndex);
      this.graph.setNode(index, attributes);
    }

    // create edges.
    for (i = 0; i < this.jsonGraph.edges.length; ++i) {
      var edge = this.jsonGraph.edges[i];
      var sourceId = edge.SourceID;
      var targetId = edge.TargetID;
      var source = this.getNode(sourceId);
      var target = this.getNode(targetId);

      if (source == undefined || target == undefined) {
        throw 'Error creating edge in graph! ' + sourceId + ', ' + targetId;
      }

      attributes = {
        linkedStructures: edge.LinkedStructures,
        sourceStructureId: edge.SourceStructureID,
        targetStructureId: edge.TargetStructureID,
        type: edge.Type
      };

      this.graph.setEdge(sourceId, targetId, attributes);
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
            return x;
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
        result.nodes.push(
          {
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

  getNodes() {
    return this.graph.nodes();
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

  getQuantNodeAttrNames() {
    var names = [];
    for (var i = 0; i < this.nodeAttributes.length; ++i) {
      if (this.nodeAttributes[i].isQuantitative) {
        names.push(this.nodeAttributes[i].name);
      }
    }
    return names;
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

  getNodeIdName() {
    return this.nodeAttributes[this.idAttributeIndex].name;
  }
}
