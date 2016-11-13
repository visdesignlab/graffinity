/*globals d3*/

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

    // accessor is used to get data from g.nodes
    this.accessor = function (d) {
      return d;
    }
  }

  /**
   * Used to set mouseenter/mouseleave events on nodes.
   * group - parent of the elements
   * selector - class of DOM element to add callback to. e.g., 'g.node'
   * accessor - function for getting nodeIndex from the d
   */
  addHoverCallbacks(group, selector, accessor) {
    if (accessor) {
      this.accessor = accessor;
    }
    let self = this;
    group.selectAll(selector)
      .on("mouseenter", function (d) {

        d3.select(this)
          .classed("hovered", true);

        let nodeIndexStr = "";

        if (accessor) {
          nodeIndexStr = accessor(d);
        } else {
          nodeIndexStr = d;
        }

        let nodeIndex = parseInt(nodeIndexStr);
        let ids = {
          sources: [nodeIndex],
          intermediates: [nodeIndex],
          targets: [nodeIndex]
        };

        self.viewState.setHoveredNodes(ids, false);
      })
      .on("mouseleave", function () {

        d3.select(this)
          .classed("hovered", false);

        self.viewState.setHoveredNodes(null);
      });
  }

  /**
   * Remove everything from the svg.
   */
  clear() {
    this.svg.selectAll("*").remove();
  }

  /**
   * Called when the user mouses over a node in any view.
   * Sets nodes that match nodeIndexes to the css class 'hovered'
   */
  onHoverNodes(signal, nodeIndexes) {
    // Has this been created yet?
    let self = this;

    if (this.nodeGroup) {

      // Are we hovering or disabling hover?
      if (nodeIndexes) {

        // Find elements for each of nodeIndexes
        let hoveredNodes = this.nodeGroup.selectAll("g.node")
          .filter(function (d) {

            // accessor is function for getting nodeIndex from g.nodes - set by the addHoverCallbacks
            // default is identity
            let nodeIndex = parseInt(self.accessor(d));

            return nodeIndexes.indexOf(nodeIndex) != -1;
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
    this.graphGroup = this.svg.append("g");
    this.createLayout(this.graph);
  }

  /**
   * Establishes the height and with of the node-link-column
   * height is hard-coded to 960
   * establishes svg attributes "height" and "width"
   * establishes values for this.height and this.width, which are used in other layouts
   */
  setHeightAndWidth() {

    let element = d3.select("#node-link-column")[0][0];

    if (!element.clientHeight) {
      this.width = 250; // default values for 1080p full screen
      this.height = 717;
    } else {
      this.height = element.clientHeight - 50;
      this.width = element.clientWidth;
    }

    this.svg.attr("width", this.width);
    this.svg.attr("height", this.height);
    this.svg.attr("viewBox", "0 0 " + this.width + " " + this.height);
  }

  /**
   * This will require clearing the svg and updating the selected paths.
   */
  setModel(model) {
    this.model = model;
  }


}
