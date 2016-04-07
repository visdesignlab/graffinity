export class SvgGroupElement {
  constructor(group) {
    this.group = group;
  }

  getD3Group() {
    return this.group;
  }

  setPosition(x, y) {
    let transform = this.group.attr("transform");
    if (!transform) {
      this.group.attr("transform", "translate(" + x + ", " + y + ")")
    } else {
      this.group.transition().duration(500).attr("transform", "translate(" + x + ", " + y + ")");
    }

  }

  setVisible(visible) {
    this.group.style("display", visible ? "block" : "none");
  }
}
