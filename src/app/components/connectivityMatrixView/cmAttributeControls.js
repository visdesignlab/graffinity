import {SvgGroupElement} from "./svgGroupElement"
export class cmAttributeControls extends SvgGroupElement {
  constructor(parent, name, isVertical, width, height, onSort, onHide, index) {
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
    this.onHide = onHide;
    this.index = index;
    cmAttributeControls.createLabel(group, name, isVertical, width, height);

    this.createInteractionRect(group, isVertical, width, height);
  }

  static createLabel(group, name, isVertical, width, height) {
    if (isVertical) {
      group.append("text")
        .text(name)
        .attr("transform", "translate(" + width * 2 + " ," + height / 2 + ")rotate(270)")
        .classed("matrix-view-attribute-label", true)
    } else {
      group.append("text")
        .attr("transform", "translate(" + width / 2 + "," + height + ")")
        .text(name)
        .classed("matrix-view-attribute-label", true)
    }
  }

  createInteractionRect(group, isVertical, width, height) {
    let self = this;

    if (isVertical) {
      group = group.append("g")
        .attr("transform", "translate(" + (width * 2) + ", " + height + ")rotate(270)");
    } else {
      group = group.append("g")
        .attr("transform", "translate(0, " + height + ")");
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
        // console.log("hello " + self.name + " filtered");
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

  toggleControlVisible(visible) {
    this.outline.attr("stroke", visible ? "black" : "none");
    this.controls.style("display", visible ? "block" : "none");
  }
}
