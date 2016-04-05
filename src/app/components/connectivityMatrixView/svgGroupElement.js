export class SvgGroupElement {
  constructor(group) {
    this.group = group;
  }

  getD3Group() {
    return this.group;
  }

  setPosition(x, y) {
    this.group.attr("transform", "translate(" + x + ", " + y + ")" )
  }
}
