/*globals d3, topojson
 */

import {Layout} from "./layout"

export class GeographicLayout extends Layout {
  /**
   * Class for displaying node-link diagram of the currently selected paths.
   */
  constructor(svg, model, $log, viewState, mainController, usMap) {
    super(svg, model, $log, viewState, mainController);
    this.$log.debug(this, usMap);
    this.usMap = usMap;
  }

  /**
   * Draws edges inside the svg
   * @param edgeGroup
   * @param cities
   */
  createEdges(edgeGroup, cities) {
    let self = this;
    edgeGroup.selectAll("g")
      .data(cities)
      .enter()
      .append("g")
      .classed("link", true)
      .selectAll("path")
      .data(function (d) {
        return d.outgoing;
      })
      .enter()
      .append("path")
      .attr("d", function (d) {
        return self.path({type: "LineString", coordinates: [d.source, d.target]});
      });
  }

  /**
   * Computes a geographical layout of the graph.
   * Positions the graph inside the column.
   */
  createLayout(graph) {

    this.setHeightAndWidth();

    // Prepare to render the graph.
    let self = this;

    this.geoGroup = this.svg.append("g").classed("geoGroup", true);
    this.edgeGroup = this.svg.append("g").classed("edgeGroup", true);
    this.nodeGroup = this.svg.append("g").classed("nodeGroup", true);

    // set project for the US map
    // translating to height/8 puts map at top
    // translating to width/2 puts US in middle
    // scale to 420 puts the map at the right location for the hard-coded size
    this.projection = d3.geo.albers()
      .translate([self.width / 2, self.height / 8 * 2])
      .scale(600);

    this.path = d3.geo.path().projection(this.projection);

    let cities = [];
    //city by ID is a map between the name ID of node to the data of the node
    // for the example of an airport, the "name" is the 3-letter ID
    let cityById = d3.map();

    // for all of the cities in the selected graph, set up the array of cities and map for cityById
    graph.nodes().forEach(function (key) {
      let node = graph.node(key);
      cities.push(node);
      node.nodeIndex = key;
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
    edges.forEach(function (connection) {
      let source = cityById.get(connection.origin),
        target = cityById.get(connection.destination),
        link = {source: source, target: target};
      source.outgoing.push(link);
      target.incoming.push(link);
    });

    //add lat and lon data to the citie
    cities = cities.filter(function (d) {
      d[0] = +d.lon;
      d[1] = +d.lat;
      var position = self.projection(d);
      d.x = position[0];
      d.y = position[1];
      return true;
    });

    this.createMap(this.geoGroup, this.usMap);
    this.createEdges(this.edgeGroup, cities);
    this.createNodes(this.nodeGroup, cities);
  }

  /**
   * Draws outline of the US
   * @param geoGroup
   */
  createMap(geoGroup, usMap) {
    geoGroup.append("path")
      .datum(topojson.feature(usMap, usMap.objects.land))
      .attr("stroke", "#ccc")
      .attr("fill", "none")
      .attr("d", this.path);

    //state boarders
    geoGroup.append("path")
      .datum(topojson.mesh(usMap, usMap.objects.states, function (a, b) {
        return a !== b;
      }))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", "1.5px")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", this.path);
  }

  /**
   * Draws nodes.
   * @param nodeGroup
   * @param cities
   */
  createNodes(nodeGroup, cities) {
    let nodes = nodeGroup
      .selectAll("g.node")
      .data(cities)
      .enter()
      .append("g")
      .classed("node", true);

    nodes
      .append("circle")
      .classed("node", true)
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
      .attr("r", 5);

    this.addHoverCallbacks(this.nodeGroup, "g.node", function (d) {
      return d.nodeIndex;
    });
  }

}
