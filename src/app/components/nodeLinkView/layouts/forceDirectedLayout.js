/*globals d3
 */

import {Layout} from "./layout"

export class ForceDirectedLayout extends Layout {
  /**
   * Class for displaying node-link diagram using force directed D3 layout of the currently selected paths.
   */
  constructor(svg, model, $log, viewState, mainController) {
    super(svg, model, $log, viewState, mainController);

    // Parameters for nodes
    this.nodeWidth = 45;
    this.nodeHeight = 20;
    this.linkDistance = 100;
    this.rx = 6;
    this.ry = 6;

    // Parameters for force separation & attraction
    this.gravity = 0.001;
    this.theta = 0.1;
    this.charge= -1000;
  }

  /**
   * Used to set mouseenter/mouseleave events on nodes.
   * overridden method to handle hover events on forceDirected nodes
   */
  addHoverCallbacks(group, selector) {
    let self = this;
    group.selectAll(selector)
      .on("mouseenter", function (d) {
        d3.select(this).classed("hovered", true);
        self.viewState.setHoveredNodes([parseInt(d.id)]);
      })
      .on("mouseleave", function () {
        d3.select(this).classed("hovered", false);
        self.viewState.setHoveredNodes(null);
      });
  }

  /*
  * input is one edge and the array of nodes
  * converts input edge's node ids into indexes of the node list
  * returns structure with source and target of the node id's
  */
  convertEdgeToLink(edge, nodes) {
    var targetIndex = undefined;
    var sourceIndex = undefined;

    // convert edge's node ids to indexes of the node list.
    for (var i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      if (edge.v == node.id) {
        sourceIndex = i;
      }
      if (edge.w == node.id) {
        targetIndex = i;
      }
    }

    if (targetIndex == undefined || sourceIndex == undefined) {
      throw 'Error converting edge to link!';
    }

    return {
      source: sourceIndex,
      target: targetIndex,
      value: this.graph.edge(edge)
    };
  }


  /*
  * input is the graph parameter
  * return value is a structure of two arrays --  nodes and edges
  */
  graphToNodesAndEdges(graph) {
    let self = this;

    let result = {
      nodes: [],
      edges: []
    };

    // Get list of nodes that are in the filter.
    let nodes = graph.nodes();

    let minNumberOfPredecessors = nodes.length;
    let minNumberOfSuccessors = nodes.length;

    //find min number of predecessors & successors in graph
    // used for placement of nodes
    for (var i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      let predeccessors = graph.predecessors(node);
      let successors = graph.successors(node);
      if (predeccessors.length < minNumberOfPredecessors)
      {
        minNumberOfPredecessors = predeccessors.length;
      }
      if (successors.length < minNumberOfSuccessors)
      {
        minNumberOfSuccessors = successors.length;
      }
    }

    let leftNodeCount = 0;
    let rightNodeCount = 0;

    //determine number of nodes that should be placed on left or right side
    for (i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      let predeccessors = graph.predecessors(node);
      let successors = graph.successors(node);

      if (predeccessors.length == minNumberOfPredecessors) {
        leftNodeCount++;
      }
      if (successors.length == minNumberOfSuccessors) {
        rightNodeCount++;
      }
    }

    let leftNodeIndex = 1;
    let rightNodeIndex = 1;

    let leftVerticalBalanceIndex = Math.max(4,leftNodeCount) + 1;
    let rightVerticalBalanceIndex = Math.max(4,rightNodeCount) + 1;

    for (i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      let predeccessors = graph.predecessors(node);
      let successors = graph.successors(node);
      let attributes = graph.node(node);

      //establish which nodes should be fixed on the left or right side
      if (predeccessors.length == minNumberOfPredecessors) {
        result.nodes.push(
          {
            id: node,
            attributes: attributes,
            name: self.model.getMajorLabels([node])[0],
            x: self.width/10, //left side
            y: self.height*leftNodeIndex/leftVerticalBalanceIndex,
            fixed: true
          });
        leftNodeIndex++;
      }
      else if (successors.length == minNumberOfSuccessors) {
        result.nodes.push(
          {
            id: node,
            attributes: attributes,
            name: self.model.getMajorLabels([node])[0],
            x: 9*self.width/10, //right side
            y: self.height*rightNodeIndex/rightVerticalBalanceIndex,
            fixed: true
          });
        rightNodeIndex++;
      }
      else {
        result.nodes.push(
          {
            id: node,
            attributes: attributes,
            name: self.model.getMajorLabels([node])[0]
          });
      }

    }

    //Get list of edges that are in the filter
    var edges = graph.edges();
    var edgesToConvert = [];
    for (i = 0; i < edges.length; ++i) {
      let edge = edges[i];
      edgesToConvert.push(edge);
    }

    for (i = 0; i < edgesToConvert.length; ++i) {
       result.edges.push( this.convertEdgeToLink(edgesToConvert[i], result.nodes));
    }

    return result;
  }


  /**
   * Computes a force-directed layout of the graph.
   * Convert the layout into an svg.
   * Positions the graph inside the column.
   */
  createLayout(graph) {

    //call to superclass
    this.setHeightAndWidth(graph);

    // Prepare to render the graph.
    let self = this;

    // get data in format of an object with 2 arrays of nodes and edges
    let dataset = this.graphToNodesAndEdges(graph);

    // establish force-directed layout
    let force = d3.layout.force()
        .nodes(dataset.nodes)
        .links(dataset.edges)
        .size([self.width,self.height])
        .linkDistance([self.linkDistance])
        .charge([self.charge])
        .theta(self.theta)
        .gravity(self.gravity)
        .start();

    /*render the objects*/

    // Create groups to hold the edges.
    this.edges = this.graphGroup.selectAll("g.edge")
      .data(dataset.edges)
      .enter()
      .append("line")
      .attr('marker-end','url(#arrowhead)')
      .style("stroke","#ccc")
      .style("pointer-events", "none");

    this.edgePaths = this.graphGroup.selectAll("g.edgepath")
      .data(dataset.edges)
      .enter()
      .append('path');

    // Create groups that will hold the nodes.
    this.nodeGroup = this.graphGroup.append("g")
      .classed("nodeGroup", true);

    //set up highlighting for nodes
    this.nodes = this.nodeGroup.selectAll("g.node")
      .data(dataset.nodes)
      .enter()
      .append("g")
      .classed("node",true)
      .call(force.drag);

    this.nodes.append("rect")
      .attr("rx", self.rx)
      .attr("ry", self.ry)
      .attr({"height":self.nodeHeight})
      .attr({"width":self.nodeWidth});

    //node text
    this.nodeLabels = this.nodes.append("text")
      .text(function (d) {
        return d.name;
      });

    //arrowheads
    this.graphGroup.append('defs').append('marker')
        .attr({'id':'arrowhead',
               'viewBox':'-0 -5 10 10',
               'refX':30,
               'refY':0,
               'orient':'auto',
               'markerWidth':10,
               'markerHeight':10,
               'xoverflow':'visible'})
        .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#ccc')
            .attr('stroke','#ccc');


    this.addHoverCallbacks(this.nodeGroup, "g.node");
    this.addHoverCallbacks(this.nodeGroup, "g.text");

    //force functions
    force.on("tick", function(){

        self.edges.attr({"x1": function(d){return d.source.x;},
                    "y1": function(d){return d.source.y;},
                    "x2": function(d){return d.target.x;},
                    "y2": function(d){return d.target.y;}
        });

        self.nodes.attr("transform", function (d) {
          //return "translate(" + (graph.node(d).x-self.nodeWidth/2) + "," + (graph.node(d).y-self.nodeHeight/2) + ")";
          return "translate(" + (d.x-self.nodeWidth/2) + "," + (d.y-self.nodeHeight/2) + ")";
        });

        self.nodeLabels.attr("x", self.nodeWidth/2)
            .attr("y", self.nodeHeight/2)
            .attr("pointer-events", "none");

        self.edgePaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                           return path});

    });

  }

}
