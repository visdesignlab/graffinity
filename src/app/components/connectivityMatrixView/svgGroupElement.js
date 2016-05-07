export class SvgGroupElement {
  constructor(group) {
    this.group = group;
    this.positionInitialized = false;
  }

  getGroup() {
    return this.group;
  }

  setPosition(x, y, hideAfterMove) {
    if (!this.positionInitialized) {
      this.positionInitialized = true;
      this.group.attr("transform", "translate(" + x + ", " + y + ")")
    } else {
      if (!hideAfterMove) {
        this.group.transition().duration(500).attr("transform", "translate(" + x + ", " + y + ")");
      } else {
        this.group.transition().duration(500).attr("transform", "translate(" + x + ", " + y + ")");
        this.group.transition().delay(500).style("display", "none");
      }
    }
  }

  setVisible(visible) {
    this.group.style("display", visible ? "block" : "none");
  }
}
