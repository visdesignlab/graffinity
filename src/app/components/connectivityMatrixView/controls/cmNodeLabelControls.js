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


    let group = this.getGroup();

    if (createColumnLabels) {
      cmNodeLabelControls.createLabel(group, name, true, width, height, colWidth, rowHeight);
    }

    cmNodeLabelControls.createLabel(group, name, false, width, height, colWidth, rowHeight);

    if (createColumnLabels) {
      this.createInteractionRect(group, true, width, height, colWidth, rowHeight);
      this.createInteractionRect(group, false, width - rowHeight, height, colWidth, rowHeight);
    } else {

      this.createInteractionRect(group, false, width, height, colWidth, rowHeight);
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

    let outline = group.append("rect")
      .data([isVertical])
      .attr("width", width)
      .attr("height", isVertical ? colWidth : rowHeight)
      .classed("matrix-view-attribute-controls", true)
      .on("mouseenter", mouseEnter)
      .on("mouseleave", mouseLeave);

    let controls = group.append("foreignObject")
      .append('xhtml:div')
      .data([isVertical])
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

    controls.append("i")
      .data([isVertical])
      .classed("fa", true)
      .classed("fa-sort", true)
      .classed("matrix-view-toolbar-item", true)
      .attr("title", "sort")
      .on("click", function (d) {
        if (d) {
          self.onSortCols(self.name, self.sortColsAscending);
          self.sortColsAscending = !self.sortColsAscending;
        } else {
          self.onSortRows(self.name, self.sortRowsAscending);
          self.sortRowsAscending = !self.sortRowsAscending;
        }
      });

    if (isVertical) {
      this.verticalControls = controls;
      this.verticalOutline = outline;
    } else {
      this.controls = controls;
      this.outline = outline;
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

  toggleControlVisible(visible, isVertical) {
    if (isVertical) {
      this.verticalOutline.attr("stroke", visible ? "black" : "none");
      this.verticalControls.style("display", visible ? "flex" : "none");
    } else {
      this.outline.attr("stroke", visible ? "black" : "none");
      this.controls.style("display", visible ? "flex" : "none");
    }
  }
}
