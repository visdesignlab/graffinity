/*globals d3, dagre
 */
export class NodeLinkView {
  /**
   * Class for displaying node-link diagram of the currently selected paths.
   */
  constructor(svg, model, $log, scope, viewState, mainController) {
    this.model = model;
    this.scope = scope;
    this.svg = svg;
    this.$log = $log;
    this.viewState = viewState;
    this.mainController = mainController;

    // Parameters for dagre
    this.nodeWidth = 45;
    this.nodeHeight = 20;
    this.nodeRx = 5;
    this.nodeRy = 5;
    this.graphNodeSep = 15;
    this.graphRankSep = 15;
    this.rankdir = "LR";

    this.graphGroup = this.svg.append("g");
  }

  /**
   * Remove everything from the svg.
   */
  clear() {
    this.graphGroup.selectAll("*").remove();
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

  /**
   * Computes a dagre layout of the graph. Convert the layout into an svg. Positions the graph inside the column.
   */
  render(graph) {

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

    // Set the node sizes
    graph.nodes().forEach(function (key) {
      let node = graph.node(key);
      node.rx = self.nodeRx;
      node.ry = self.nodeRy;
      node.width = self.nodeWidth;
      node.height = self.nodeHeight;
    });

    // Compute layout
    graph.graph().rankdir = "LR";
    graph.graph().nodesep = this.graphNodeSep;
    graph.graph().ranksep = this.graphRankSep;
    dagre.layout(graph);

    this.renderLinks(this.graphGroup, graph);
    this.renderNodes(this.graphGroup, graph);

    let xCenterOffset = (this.svg.attr("width") - graph.graph().width) / 2;
    let yCenterOffset = (this.svg.attr("height") - graph.graph().height) / 2;
    this.graphGroup.attr("transform", "translate(" + xCenterOffset + ", " + yCenterOffset + ")");
  }

  /**
   * Adds links to the parent. They are saved in this.links.
   *
   * DOM structure of links:
   *  g.link
   *    g.link.path
   */
  renderLinks(parent, graph) {
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
   * Adds nodes to the parent. They are saved in this.nodes.
   *
   * DOM structure of nodes
   *  g.node
   *    g.node.rect - outline
   *    g.node.text - label
   */
  renderNodes(parent, graph) {
    // Create groups that will hold the nodes.
    this.nodes = parent.selectAll("g.node")
      .data(graph.nodes())
      .enter()
      .append("g")
      .attr("transform", function (d) {
        return NodeLinkView.getNodeTopLeftAsTransform(d, graph);
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
    this.nodes.append("text")
      .text(function (d) {
        return d;
      })
      .attr("transform", function (d) {
        return NodeLinkView.getNodeCenterAsTransform(d, graph);
      });
  }

  /**
   * This will require clearing the svg and updating the selected paths.
   */
  setModel(model) {
    this.model = model;
  }

  /**
   * Updates paths displayed in the node link view.
   */
  setSelectedPaths(paths) {
    this.clear();
    this.paths = paths;

    this.graph = this.model.getCmGraph().getSubgraph(paths);
    this.render(this.graph);
  }
}
