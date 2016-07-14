/*global d3*/

/**
 * Class for easy manipulation of node link layouts.
 */

export class Layout {
  constructor(svg, model, $log, viewState, mainController) {
    this.svg = svg;
    this.model = model;
    this.$log = $log;
    this.viewState = viewState;
    this.mainController = mainController;


    // Settings for positioning the graph
    this.graphYOffset = 80;
    this.graphGroup = this.svg.append("g");
  }

  /**
   * Used to set mouseenter/mouseleave events on nodes.
   */
  addHoverCallbacks(group, selector) {
    let self = this;
    group.selectAll(selector)
      .on("mouseenter", function (d) {
        d3.select(this).classed("hovered", true);
        self.viewState.setHoveredNodes([parseInt(d)]);
      })
      .on("mouseleave", function () {
        d3.select(this).classed("hovered", false);
        self.viewState.setHoveredNodes(null);
      });
  }

  /**
   * Remove everything from the svg.
   */
  clear() {
    this.graphGroup.selectAll("*").remove();
  }

  /**
   * Graph is available as parameter here.
   */
  createLayout() {
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

  }

  /**
   * Called when the user mouses over a node in any view.
   * Sets nodes that match nodeIndexes to the css class 'hovered'
   */
  onHoverNodes(signal, nodeIndexes) {
    // Has this been created yet?
    if (this.nodeGroup) {

      // Are we hovering or disabling hover?
      if (nodeIndexes) {

        // Find elements for each of nodeIndexes
        let hoveredNodes = this.nodeGroup.selectAll("g.node").filter(function (d) {
          return nodeIndexes.indexOf(parseInt(d)) != -1;
        });

        hoveredNodes.classed("hovered", true);

      } else {

        // Set everything to not hovered.
        this.nodeGroup.selectAll("g.node")
          .classed("hovered", false);

      }
    }
  }

  /**
   * Updates paths displayed in the node link view.
   */
  setGraph(graph) {
    this.graph = graph;
    this.createLayout(this.graph);
  }

  /**
   * This will require clearing the svg and updating the selected paths.
   */
  setModel(model) {
    this.model = model;
  }


}
