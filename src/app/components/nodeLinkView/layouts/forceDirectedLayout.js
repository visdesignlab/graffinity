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

/*
  input is one edge and the array of nodes
  converts input edge's node ids into indexes of the node list
  returns structure with source and target of the node id's
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

    for (var i = 0; i < nodes.length; ++i) {
      let node = nodes[i];
      let predeccessors = graph.predecessors(node);
      let successors = graph.successors(node);
      let attributes = graph.node(node);

      //establish which nodes should be fixed on the left or right side
      if (predeccessors.length ==0) {
        result.nodes.push(
          {
            id: node,
            attributes: attributes,
            name: self.model.getMajorLabels([node])[0],
            x: self.width/10, //left side
            y: self.height/8,
            fixed: true
          });
      }
      else if (successors.length == 0) {
        result.nodes.push(
          {
            id: node,
            attributes: attributes,
            name: self.model.getMajorLabels([node])[0],
            x: 9*self.width/10, //right side
            y: self.height/8,
            fixed: true
          });
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

    this.nodes = this.nodeGroup.selectAll("g.node")
      .data(dataset.nodes)
      .enter()
      .append("rect")
      .attr("rx", self.rx)
      .attr("ry", self.ry)
      .attr({"height":self.nodeHeight})
      .attr({"width":self.nodeWidth})
      .style("fill","#aaa")
      .classed("node",true)
      .call(force.drag);

    this.nodeLabels = this.nodeGroup.selectAll("g.nodelabel")
       .data(dataset.nodes)
       .enter()
       .append("text")
       .attr( {"class":"nodelabel",
              "stroke":"black"})
       .text(function(d){return d.name;});

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

    /* todo: not sure why hovering won't work*/
    this.addHoverCallbacks(this.nodeGroup, "g.node");
    this.addHoverCallbacks(this.nodeGroup, "g.nodelabel");

    //force functions
    force.on("tick", function(){

        self.edges.attr({"x1": function(d){return d.source.x;},
                    "y1": function(d){return d.source.y;},
                    "x2": function(d){return d.target.x;},
                    "y2": function(d){return d.target.y;}
        });

        self.nodes.attr({"x":function(d){return d.x-self.nodeWidth/2;},
                    "y":function(d){return d.y-self.nodeHeight/2;}
        });

        self.nodeLabels.attr("x", function(d) { return d.x - self.nodeWidth/3; })
                  .attr("y", function(d) { return d.y + self.nodeHeight/5; })
                  .attr("pointer-events", "none"); //to consider for hover???


        self.edgePaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                           return path});

    });

  }

}
