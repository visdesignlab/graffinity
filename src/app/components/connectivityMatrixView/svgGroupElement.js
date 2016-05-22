/**
 * Class for easy manipulation of svg groups.
 *
 * this.children are other SvgGroupElements whose DOM elements contained by this group element.
 */
export class SvgGroupElement {
  constructor(group) {
    this.group = group;
    this.useAnimation = true;
    this.children = [];
  }

  clearChildren() {
    for(var i=0; i<this.children.length; ++i) {
      this.children[i].clearChildren();
    }
    this.children = [];
  }

  addChild(groupElement) {
    this.children.push(groupElement);
  }

  getGroup() {
    return this.group;
  }

  setPosition(x, y, hideAfterMove) {
    let transform = "translate( " + x + ", " + y + ") ";

    // Does this group already have a transform attribute defined?
    // If not, set it for the first time.

    if (this.group.attr("transform") == undefined) {
      this.group.attr("transform", transform);
    } else {
      // Default is to animate transitions
      let duration = 500;

      if (!this.useAnimation) {
        duration = 0;
      }

      // Actually do the transition
      this.group.transition().duration(duration).attr("transform", transform);

      if (hideAfterMove) {
        this.group.transition().delay(500).style("display", "none");
      }
    }
  }

  setVisible(visible) {
    this.group.style("display", visible ? "block" : "none");
  }

  setUseAnimation(useAnimation) {
    this.useAnimation = useAnimation;
    for (var i = 0; i < this.children.length; ++i) {
      this.children[i].setUseAnimation(useAnimation);
    }
  }
}
