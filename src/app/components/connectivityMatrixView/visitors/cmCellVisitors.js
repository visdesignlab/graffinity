export class cmCellVisitor {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rx = 2;
    this.ry = 2;

    // For debugging. Setting this to true will draw outline rects around every datacell in the matrix.
    this.showOutlines = false;
  }

  setCallbacks(clicked, mouseOver, mouseOut) {
    this.callbacks = {};
    this.callbacks.clicked = clicked;
    this.callbacks.mouseOver = mouseOver;
    this.callbacks.mouseOut = mouseOut;
  }

  createInteractionGroup(cell) {
    let self = this;
    let group = cell.getGroup();

    group.append("rect")
      .attr("class", "matrix-view-interactive-cell")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("rx", this.rx)
      .attr("ry", this.ry)
      .on("click", function () {
        self.callbacks.clicked(cell);
      })
      .on("mouseover", function () {
        self.callbacks.mouseOver(cell);
      })
      .on("mouseout", function () {
        self.callbacks.mouseOut(cell);
      });
  }

  createEmptyCellOutline(cell) {
    let group = cell.getGroup();
    group.append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("rx", this.rx)
      .attr("ry", this.ry)
      .style("stroke", "lightgray")
      .style("stroke-width", "1px")
      .attr("fill", "transparent")
      .style("display", this.showOutlines ? "block" : "none");
  }
}
