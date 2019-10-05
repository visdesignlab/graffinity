/*global d3
 */
import {SvgGroupElement} from "./../svgGroupElement"
export class cmNodeLabelControls extends SvgGroupElement {
  constructor(parent, name, width, height, colWidth, rowHeight, onFilter, nodeIndexes, onSortRows, onSortCols, createColumnLabels, rowAttributeNodeGroup, colAttributeNodeGroup) {
    super(parent);

    this.onSortRows = onSortRows;
    this.onSortCols = onSortCols;
    this.onFilter = onFilter;
    this.nodeIndexes = nodeIndexes;
    this.rowAttributeNodeGroup = rowAttributeNodeGroup;
    this.colAttributeNodeGroup = colAttributeNodeGroup;
    this.name = name;

    this.areRowsSorted = false;
    this.areColsSorted = false;

    let group = this.getGroup();

    if (createColumnLabels) {
      cmNodeLabelControls.createLabel(group, name, true, width, height, colWidth, rowHeight);
    }

    cmNodeLabelControls.createLabel(group, name, false, width, height, colWidth, rowHeight);

    if (createColumnLabels) {
      this.createInteractionRect(group, true, width, height, colWidth, rowHeight);
      this.createInteractionRect(group, false, width - rowHeight, height, colWidth, rowHeight);
      this.toggleControlVisible(false, true);
      this.toggleControlVisible(false, false);
    } else {

      this.createInteractionRect(group, false, width, height, colWidth, rowHeight);
      this.toggleControlVisible(false, false);
    }


  }

  createInteractionRect(group, isVertical, width, height, colWidth, rowHeight) {
    let self = this;

    if (isVertical) {
      group = group.append("g")
        .attr("transform", "translate(" + (width - colWidth) + ", " + height + ")rotate(270)");
    } else {
      group = group.append("g")
        .attr("transform", "translate(" + 0 + "," + (height - rowHeight) + ")")
    }

    let mouseLeave = function (d) {
      self.toggleControlVisible(false, d);
    };

    let mouseEnter = function (d) {
      self.toggleControlVisible(true, d);
    };

    let outline = group.append("foreignObject")
      .data([isVertical])
      .attr("width", (isVertical ? height : width))
      .attr("height", 12) // height of the icons in the sort controls
      .on("mouseover", mouseEnter)
      .on("mouseleave", mouseLeave);

    let allControls = outline.append('xhtml:div')
      .style("justify-content", "space-between")
      .style("display", "flex")
      .data([isVertical])
      .on("mouseover", mouseEnter)
      .on("mouseleave", mouseLeave);

    let sortControls = allControls
      .append('xhtml:div')
      .data([isVertical])
      .classed("matrix-view-sortbar", true)
      .on("mouseover", mouseEnter)
      .on("mouseleave", mouseLeave);

    let controls = allControls.append('xhtml:div')
      .classed("matrix-view-toolbar", true)
      .on("mouseover", mouseEnter)
      .on("mouseleave", mouseLeave);

    controls.append("i")
      .data([isVertical])
      .classed("fa", true)
      .classed("fa-filter", true)
      .classed("matrix-view-toolbar-item", true)
      .attr("title", "filter")
      .on("click", function (d) {
        self.onFilter(self.name, self.nodeIndexes, d ? self.colAttributeNodeGroup : self.rowAttributeNodeGroup);
      });

    sortControls.append("i")
      .data([isVertical])
      .classed("fa", true)
      .classed("fa-sort-desc", true)
      .classed("matrix-view-toolbar-item", true)
      .attr("title", "sort")
      .on("click", function (d) {
        if (d) {
          self.areColsSorted = true;
          self.onSortCols(self.name, self.sortColsAscending, this.parentNode);
          self.sortColsAscending = !self.sortColsAscending;
          cmNodeLabelControls.setSortIcon(this, self.sortColsAscending);
        } else {
          self.areRowsSorted = true;
          self.onSortRows(self.name, self.sortRowsAscending, this.parentNode);
          self.sortRowsAscending = !self.sortRowsAscending;
          cmNodeLabelControls.setSortIcon(this, self.sortRowsAscending);
        }
      });

    if (isVertical) {
      this.verticalControls = controls;
      this.verticalOutline = outline;
      this.verticalSortControls = sortControls;
    } else {
      this.controls = controls;
      this.outline = outline;
      this.sortControls = sortControls;
    }

  }

  static createLabel(group, name, isVertical, width, height, colWidth, rowHeight) {
    if (isVertical) {
      group.append("text")
        .text(name)
        .attr("transform", "translate(" + (width - colWidth) + " ," + height / 2 + ")rotate(270)")
        .classed("matrix-view-attribute-label", true)
    } else {
      group.append("text")
        .attr("transform", "translate(" + width / 2 + "," + (height - rowHeight) + ")")
        .text(name)
        .classed("matrix-view-attribute-label", true)
    }
  }

  static setSortIcon(icon, ascending) {
    icon = d3.select(icon);
    icon.attr("data-is-sorted", true);
    icon.classed("fa-sort-desc", !ascending);
    icon.classed("fa-sort-asc", ascending);
  }

  toggleControlVisible(visible, isVertical) {
    if (isVertical) {
      this.verticalOutline.style("outline", visible ? "thin solid grey" : "none");
      this.verticalControls.style("display", visible ? "flex" : "none");

      if (!visible && !this.verticalSortControls.select(".fa").attr("data-is-sorted")) {
        this.verticalSortControls.style("display", "none");
      } else if (visible) {
        this.verticalSortControls.style("display", "flex");
      }

    } else {
      this.outline.style("outline", visible ?  "thin solid grey" : "none");
      this.controls.style("display", visible ? "flex" : "none");

      if (!visible && !this.sortControls.select(".fa").attr("data-is-sorted")) {
        this.sortControls.style("display", "none");
      } else if (visible) {
        this.sortControls.style("display", "flex");
      }
    }
  }
}
