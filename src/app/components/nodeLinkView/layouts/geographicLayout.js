/*globals d3, topojson
 */

import {Layout} from "./layout"
import {usMap} from './usMap'

export class GeographicLayout extends Layout {
  /**
   * Class for displaying node-link diagram of the currently selected paths.
   */
  constructor(svg, model, $log, viewState, mainController) {
    super(svg, model, $log, viewState, mainController);

  }

  /**
   * Computes a geographical layout of the graph.
   * Positions the graph inside the column.
   */
  createLayout(graph) {

    this.setHeightAndWidth();

    // Prepare to render the graph.
    let self = this;

    // set project for the US map
    // translating to height/8 puts map at top
    // translating to width/2 puts US in middle
    // scale to 420 puts the map at the right location for the hard-coded size
    this.projection = d3.geo.albers()
    .translate([self.width / 2, self.height / 8])
    .scale(420);

    this.path = d3.geo.path().projection(this.projection);

    let cities = [];
    //city by ID is a map between the name ID of node to the data of the node
    // for the example of an airport, the "name" is the 3-letter ID
    let cityById = d3.map();

    // for all of the cities in the selected graph, set up the array of cities and map for cityById
    graph.nodes().forEach(function (key) {
      let node = graph.node(key);
      cities.push(node);
      cityById.set(self.model.getMajorLabels([key])[0], node);

      node.outgoing = [];
      node.incoming = [];
    });

    // set up array of edges in the graph
    let edges = [];
    graph.edges().forEach(function (edge) {
        let connection = {};
        connection.origin = self.model.getMajorLabels([edge.v])[0];
        connection.destination = self.model.getMajorLabels([edge.w])[0];
        edges.push(connection);
    });

    //put the city information in the connections data
    edges.forEach(function(connection) {
      let source = cityById.get(connection.origin),
          target = cityById.get(connection.destination),
          link = {source: source, target: target};
      source.outgoing.push(link);
      target.incoming.push(link);
    });

    //add lat and lon data to the citie
    cities = cities.filter(function(d) {
      d[0] = +d.lon;
      d[1] = +d.lat;
      var position = self.projection(d);
      d.x = position[0];
      d.y = position[1];
      return true;
    });

   // draw the states
    this.graphGroup.append("path")
       .datum(topojson.feature(usMap.output, usMap.output.objects.land))
       .attr("fill", "#ccc")
       .attr("d", this.path);

    //state boarders
    this.graphGroup.append("path")
      .datum(topojson.mesh(usMap.output, usMap.output.objects.states, function(a, b) { return a !== b; }))
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", "1.5px")
      .attr("stroke-linejoin","round")
      .attr("stroke-linecap", "round")
      .attr("d", this.path);

    //draw cities as blue circles
    let city = this.graphGroup.append("g")
      .attr("stroke", "#fff")
      .attr("pointer-events", "none")  //to consider for hover???
      .attr("fill", "steelblue")
    .selectAll("g")
      .data(cities)
    .enter().append("g")
      .attr("class", "airport");

    //draw flight lines (airport arcs)
    city.append("g")
      .attr("display","inline")
      .attr("fill","none")
      .attr("stroke","#000")
    .selectAll("path")
      .data(function(d) { return d.outgoing; })
    .enter().append("path")
      .attr("d", function(d) { return self.path({type: "LineString", coordinates: [d.source, d.target]}); });

    city.append("circle")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("r", Math.sqrt(10));
  }

}
