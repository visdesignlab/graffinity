import {SvgGroupElement} from "./svgGroupElement"
export class cmAttributeControls extends SvgGroupElement {
  constructor(parent, name, isVertical, width, height, onSort) {
    super(parent);

    let group = this.getGroup();

    if (!isVertical) {
      group = group.append("g").attr("transform", "translate(0," + height + ")");
    }
    this.width = width;
    this.height = height;
    this.name = name;
    this.onSort = onSort;
    this.sortAscending = false;
    cmAttributeControls.createLabel(group, name, isVertical, width, height);

    this.createInteractionRect(group, isVertical, width, height);
  }

  static createLabel(group, name, isVertical, width, height) {
    if (!isVertical) {
      group.append("text")
        .attr("transform", "translate(" + width / 2 + ",0)")
        .text(name)
        .classed("matrix-view-attribute-label", true)
    } else {
      group.append("text")
        .text(name)
        .attr("transform", "translate(" + height + " ," + width / 2 + ")rotate(270)")
        .classed("matrix-view-attribute-label", true)
    }
  }

  createInteractionRect(group, isVertical, width, height) {
    let self = this;

    if (isVertical) {
      group = group.append("g")
        .attr("transform", "translate(" + height + ", " + width + ")rotate(270)");
    }

    let mouseLeave = function () {
      self.toggleControlVisible(false);
    };

    let mouseEnter = function () {
      self.toggleControlVisible(true);
    };

    this.outline = group.append("rect")
      .attr("width", width)
      .attr("height", height)
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
        console.log("hello " + self.name + " filtered");
      });

    this.controls.append("i")
      .classed("fa", true)
      .classed("fa-sort", true)
      .attr("float", "left")
      .on("click", function () {
        self.onSort(self.name, self.sortAscending);
        self.sortAscending = !self.sortAscending;
      });

    this.controls.append("i")
      .classed("fa", true)
      .classed("fa-close", true)
      .attr("float", "left")
      .on("click", function () {
        console.log("hello " + self.name + " closed");
      });


  }

  toggleControlVisible(visible) {
    this.outline.attr("stroke", visible ? "black" : "none");
    this.controls.style("display", visible ? "block" : "none");
  }
}
