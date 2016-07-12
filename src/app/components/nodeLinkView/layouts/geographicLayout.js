/*globals d3, dagre
 */

import {Layout} from "./layout"
import {usMap} from './usMap'

export class GeographicLayout extends Layout {
  /**
   * Class for displaying node-link diagram of the currently selected paths.
   */
  constructor(svg, model, $log, viewState, mainController) {
    super(svg, model, $log, viewState, mainController);

    // Parameters for dagre
    this.nodeWidth = 45;
    this.nodeHeight = 20;
    this.nodeRx = 5;
    this.nodeRy = 5;
    this.graphNodeSep = 7;
    this.graphRankSep = 7;
    this.graphMarginTop = 80;
    this.rankdir = "LR";

  }

  /**
   * Adds links to the parent. They are saved in this.links.
   *
   * DOM structure of links:
   *  g.link
   *    g.link.path
   */
  createLinks(parent, graph) {
    // Function that will convert points into svg lines.
    let line = d3.svg.line()
      .x(function (d) {
        return d.x;
      })
      .y(function (d) {
        return d.y;
      })
      .interpolate("basis");

    // Create groups to hold the links.
    this.links = parent.selectAll("g.link")
      .data(graph.edges())
      .enter()
      .append("g")
      .classed("link", true);

    // Actually create the paths that draw the links.
    this.links.append("path")
      .attr("d", function (d) {
        return line(graph.edge(d).points)
      });
  }

  /**
   * Computes a geographical layout of the graph.
   * Convert the layout into an svg.
   * Positions the graph inside the column.
   */
  createLayout(graph) {
    //clear the SVG
    this.svg.selectAll("*").remove();

    // get the column containing the svg
    let element = d3.select("#node-link-column")[0][0];

    // How much room do we have available in the column? Use this to size the svg.
    // padding is of the form '0px 15px.'
    // get the horizontal form of it
    // use that to determine width
    let padding = d3.select("#node-link-column").style("padding");
    padding = padding.split(' ')[1];
    padding = parseInt(padding);
    let width = element.clientWidth - padding;
    let height = 960;
    this.svg.attr("width", width);
    this.svg.attr("height", height);

    // Prepare to render the graph.
    let self = this;

    //
    this.projection = d3.geo.albers()
    .translate([width / 2, height / 8])
    .scale(420);

    this.path = d3.geo.path()
    .projection(this.projection);

    let airports = [];
    let airportById = d3.map();

    //todo --Ethan's way here
    graph.nodes().forEach(function (key) {
      let node = graph.node(key);
      airports.push(node);
      airportById.set(self.model.getMajorLabels([key])[0], node);

      node.outgoing = [];
      node.incoming = [];
    });


    let flights = [];
    graph.edges().forEach(function (edge) {
        self.$log.debug("the edge is", edge);
        self.$log.debug("source is ", graph.node(edge.v));
        self.$log.debug("source label is ", self.model.getMajorLabels([edge.v])[0]);
        let flight = {};
        flight.origin = self.model.getMajorLabels([edge.v])[0];
        flight.destination = self.model.getMajorLabels([edge.w])[0];
        flights.push(flight);
    });

    this.$log.debug("flights", flights);

    //put the airport information in the flights data
    flights.forEach(function(flight) {
      let source = airportById.get(flight.origin),
          target = airportById.get(flight.destination),
          link = {source: source, target: target};
      source.outgoing.push(link);
      target.incoming.push(link);
  });


    airports = airports.filter(function(d) {
      d[0] = +d.lon;
      d[1] = +d.lat;
      var position = self.projection(d);
      d.x = position[0];
      d.y = position[1];
      return true;
    });

    //states
    this.svg.append("path")
       .datum(topojson.feature(usMap.output, usMap.output.objects.land))
       .attr("fill", "#ccc")
       .attr("d", this.path);

    //state boarders
    this.svg.append("path")
      .datum(topojson.mesh(usMap.output, usMap.output.objects.states, function(a, b) { return a !== b; }))
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", "1.5px")
      .attr("stroke-linejoin","round")
      .attr("stroke-linecap", "round")
      .attr("d", this.path);

    //draw airports
    let airport = this.svg.append("g")
      .attr("stroke", "#fff")
      .attr("pointer-events", "none")  //to consider for hover???
      .attr("fill", "steelblue")
    .selectAll("g")
      .data(airports)
    .enter().append("g")
      .attr("class", "airport");


    airport.append("g")
      .attr("class", "airport-arcs")
      .attr("display","inline")
      .attr("fill","none")
      .attr("stroke","#000")
    .selectAll("path")
      .data(function(d) { return d.outgoing; })
    .enter().append("path")
      .attr("d", function(d) { return self.path({type: "LineString", coordinates: [d.source, d.target]}); });


    airport.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r", Math.sqrt(10));



    // graph.edges().forEach(function (key) {
    //   self.$log.debug("edges", key)
    // });
    //
    // // Set the node sizes.
    // graph.nodes().forEach(function (key) {
    //   let node = graph.node(key);
    //   node.rx = self.nodeRx;
    //   node.ry = self.nodeRy;
    //   node.width = self.nodeWidth;
    //   node.height = self.nodeHeight;
    // });
    //
    // // Compute layout
    // graph.graph().rankdir = "LR";
    // graph.graph().nodesep = this.graphNodeSep;
    // graph.graph().ranksep = this.graphRankSep;
    // graph.graph().margintop = this.graphMarginTop;
    // dagre.layout(graph);
    //
    // this.createLinks(this.graphGroup, graph);
    // this.createNodes(this.graphGroup, graph);
    //
    // let xCenterOffset = (this.svg.attr("width") - graph.graph().width) / 2;
    // this.graphGroup.attr("transform", "translate(" + xCenterOffset + ", " + this.graphYOffset + ")");
  }

  /**
   * Adds nodes to the parent.
   * They are saved in this.nodes.
   *
   * DOM structure of nodes
   *  g.node
   *    g.node.rect - outline
   *    g.node.text - label
   */
  createNodes(parent, graph) {
    // Create groups that will hold the nodes.
    this.nodeGroup = parent.append("g")
      .classed("nodeGroup", true);

    this.nodes = this.nodeGroup.selectAll("g.node")
      .data(graph.nodes())
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return GeographicLayout.getNodeTopLeftAsTransform(d, graph);
      })
      .classed("node", true);


    // Create node rectangles
    this.nodes.append("rect")
      .attr("width", function (d) {
        return graph.node(d).width;
      })
      .attr("height", function (d) {
        return graph.node(d).height;
      })
      .attr("rx", function (d) {
        return graph.node(d).rx;
      })
      .attr("ry", function (d) {
        return graph.node(d).ry;
      })
      .classed("node", true);

    // Create node text
    let self = this;
    this.nodes.append("text")
      .text(function (d) {
        return self.model.getMajorLabels([d])[0];
      })
      .attr("transform", function (d) {
        return GeographicLayout.getNodeCenterAsTransform(d, graph);
      });

    this.addHoverCallbacks(this.nodeGroup, "g.node");
    this.addHoverCallbacks(this.nodeGroup, "g.text");
  }

  /**
   * Returns the node's top-left corner as a string. Used for positioning node.rects.
   */
  static getNodeTopLeftAsTransform(key, graph) {
    var x = (graph.node(key).x - (graph.node(key).width / 2));
    var y = (graph.node(key).y - (graph.node(key).height / 2));
    return "translate(" + x + ", " + y + ")";
  }

  /**
   * Returns the node's center as a transform string. Used for positioning node.text.
   */
  static getNodeCenterAsTransform(key, graph) {
    return "translate(" + (graph.node(key).width / 2) + ", " + (graph.node(key).height / 2) + ")";
  }

}
