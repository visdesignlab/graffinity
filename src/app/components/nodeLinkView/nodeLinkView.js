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

    this.svg.append("text")
      .attr("transform", "translate(30, 30)")
      .text("This is the nodelink view");
  }

  /**
   * Remove everything from the svg.
   */
  clear() {
    this.svg.selectAll("*").remove();
  }

  /**
   * Compute a dagre layout of the graph. Convert the layout into an svg.
   */
  render(graph) {
    this.$log.debug("rendering graph", graph);
    let description = "subgraph will have " + graph.nodes().length + " nodes and " + graph.edges().length + "  edges";
    this.svg.append('text')
      .attr("transform", "translate(30, 30)")
      .text(description);
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
