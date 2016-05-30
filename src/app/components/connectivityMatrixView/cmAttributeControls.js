import {SvgGroupElement} from "./svgGroupElement"

/**
 * Class that displays quantitative attributes row/col controls.
 *
 * This is responsible for:
 * 1. notifying the matrix when user clicks on the filter, hide, and sort buttons;
 * 2. creating a 'scent' to give the user an overview of values in the rows/cols
 * 3. updating the scent when user filters on attributes
 *
 */
export class cmAttributeControls extends SvgGroupElement {

  /**
   * Creates the grid cell to handle user input.
   * 1. Saves relevant callbacks for d3 events.
   * 2. Creates this.label - contains displayed name
   * 3. Creates this.scent - will contain a scented histogram of the data
   * 4. Creates an 'interaction rect' for handling mouse hover events and exposing filter, sort, hide, etc..
   */
  constructor(parent, name, isVertical, width, height, onSort, onHide, index, onFilter, filterNodeIndexes,
              filterAttributeGroup, attributeValues) {
    super(parent);

    let group = this.getGroup();

    // uncomment to draw outline of this label
    //group.append("rect")
    //  .attr("width", width)
    //  .attr("height", height)
    //  .style("outline", "thin solid grey")
    //  .attr("fill", "none");

    this.width = width;
    this.height = height;

    this.name = name;

    // Callback for hiding matrix row/col
    this.onHide = onHide;
    this.index = index; // the row/col index

    // Callback for sorting
    this.onSort = onSort;
    this.sortAscending = false; // toggled on user click

    // Callback for filtering - nodeIndexes and attributeGroup are needed by callback.
    this.onFilter = onFilter;
    this.filterNodeIndexes = filterNodeIndexes;
    this.filterAttributeGroup = filterAttributeGroup;

    // List of attribute values to be displayed in the scent
    this.attributeValues = attributeValues;

    // The "isVertical" boolean is kind of annoying.
    // It is true if this controls a *row* of attributes. Otherwise it is false.

    // Note - the label gets rotated if this isVertical.
    this.label = cmAttributeControls.createLabel(group, name, isVertical, width, height);

    // Compute dimensions of the scent.
    let scentHeight = null;
    let scentWidth = null;
    let scentGroup = null;
    let offset = parseInt(this.label.style("line-height"));

    // In the not-vertical case, the scent starts below the label. In the isVertical case, the scent starts to the left
    // of the label. This is saved in the scentGroup's transform.
    if (isVertical) {
      scentHeight = this.height;
      scentWidth = this.width - offset;

      scentGroup = group.append("g")
        .attr("transform", "translate(" + offset + ",0)");
    } else {
      scentHeight = this.height - offset;
      scentWidth = this.width;

      scentGroup = group.append("g")
        .attr("transform", "translate(0, " + offset + ")");
    }

    // We save this.scent in order to update it later on.
    this.scent = cmAttributeControls.createDataScent(scentGroup, isVertical, scentWidth, scentHeight, attributeValues);

    // This must be called last for z-ordering of svg elements.
    this.createInteractionRect(group, isVertical, width, height);
  }

  /**
   * Creates rectangle that appears on mouse hover for displaying the filter, hide, and sort controls.
   */
  createInteractionRect(group, isVertical, width, height) {
    let self = this;

    if (isVertical) {
      group = group.append("g")
        .attr("transform", "translate(0" + ", " + height + ")rotate(270)");
    }

    let mouseLeave = function () {
      self.toggleControlVisible(false);
    };

    let mouseEnter = function () {
      self.toggleControlVisible(true);
    };

    this.outline = group.append("rect")
      .attr("width", isVertical ? height : width)
      .attr("height", isVertical ? width : height)
      .classed("matrix-view-attribute-controls", true)
      .on("mouseenter", mouseEnter)
      .on("mouseleave", mouseLeave);


    this.controls = group.append("foreignObject")
      .append('xhtml:div')
      .classed("matrix-view-toolbar", true)
      .on("mouseover", mouseEnter)
      .on("mouseleave", mouseLeave);

    this.controls.append("i")
      .classed("fa", true)
      .classed("fa-filter", true)
      .attr("float", "left")
      .on("click", function () {
        self.onFilter(self.name, self.filterNodeIndexes, self.filterAttributeGroup);
      });

    this.controls.append("i")
      .classed("fa", true)
      .classed("fa-sort", true)
      .attr("float", "left")
      .on("click", function () {
        self.onSort(self.name, self.sortAscending);
        self.sortAscending = !self.sortAscending;
      });

    if (this.onHide) {
      this.controls.append("i")
        .classed("fa", true)
        .classed("fa-close", true)
        .attr("float", "left")
        .on("click", function () {
          self.onHide(self.index);
        });
    }
  }

  /**
   * Creates text label. The isVertical label will be rotated 270 degrees.
   */
  static createLabel(group, name, isVertical, width, height) {
    if (isVertical) {
      return group.append("text")
        .text(name)
        .attr("transform", "translate(" + 0 + " ," + height / 2 + ")rotate(270)")
        .classed("matrix-view-attribute-label", true)
    } else {
      return group.append("text")
        .attr("transform", "translate(" + width / 2 + "," + 0 + ")")
        .text(name)
        .classed("matrix-view-attribute-label", true)
    }
  }

  /**
   * Returns a histogram scent of the data.
   */
  static createDataScent(group, isVertical, scentWidth, scentHeight) {
    // TODO - attributeValues is passed as last parameter - add it to the list for access. I removed it to shut up gulp.
    // TODO - put call to scent histogram constructor here.
    // TODO - delete this ugly red box
    group.append("rect")
      .attr("width", scentWidth)
      .attr("height", scentHeight)
      .attr("fill", "transparent")
      .style("outline", "thin solid red");
  }

  /**
   * Updates the filter displayed in the scent.
   */
  setAttributeFilterRange() {
    // TODO - add parameter called 'filterRange.' I removed it to shut up gulp. It is already passed in here.
    // TODO - call this.scent.setFilterRange(filterRange) to update the visual encoding of the current filter.
  }

  /**
   * Called when mouse is on top of the interaction rect.
   */
  toggleControlVisible(visible) {
    this.outline.attr("stroke", visible ? "black" : "none");
    this.controls.style("display", visible ? "block" : "none");
  }
}
