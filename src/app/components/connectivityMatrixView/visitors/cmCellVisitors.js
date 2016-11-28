export class cmCellVisitor {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.rx = 2;
    this.ry = 2;

    // For debugging. Setting this to true will draw outline rects around every data cell in the matrix.
    this.showOutlines = false;

    this.hasNodeFilter = false;
    this.isNodeHidden = {};

    this.visitAttributeCells = false;
    this.visitAttributeLabelCells = false;
    this.visitDataCells = false;
    this.visitEditAttributeCells = false;
    this.visitHeaderCells = false;
    this.visitLabelCells = false;

    this.pathFilterFunction = null;
    this.metrics = [];
  }

  setCallbacks(clicked, mouseOver, mouseOut) {
    this.callbacks = {};
    this.callbacks.clicked = clicked;
    this.callbacks.mouseOver = mouseOver;
    this.callbacks.mouseOut = mouseOut;
  }

  createInteractionGroup(cell, paths, graph) {
    let self = this;
    let group = cell.getGroup();

    cell.interactionGroup = group.append("g")
      .classed("matrix-view-interaction-group", true);

    if (!self.callbacks.clicked) {
      cell.interactionGroup.classed("no-click", true);
    }

    cell.interactionGroup
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("rx", this.rx)
      .attr("ry", this.ry)
      .on("click", function () {
        if (self.callbacks.clicked) {
          self.callbacks.clicked(cell);
        }
      })
      .on("mouseover", function () {
        self.callbacks.mouseOver(cell);
      })
      .on("mouseout", function () {
        self.callbacks.mouseOut(cell);
      });

    //return "<b>" + paths.length + (paths.length == 1 ? " path" : " paths" + "<br>" + "SHIT</b>");
    if (paths) {
      cell.interactionGroup
        .select("rect")
        .attr("data-toggle", "tooltip")
        .attr("data-html", "true")
        .attr("data-title", function () {
          let value = "";
          for (let i = 0; i < self.metrics.length; ++i) {
            let metric = self.metrics[i];
            if (metric.output == "scalar") {
              if (value.length) {
                value += "<br>"
              }
              value = value + metric.metricFn(paths, graph) + " " + metric.tooltip;
            }
          }
          return value;
        })
        .attr("data-placement", "right")
        .attr("data-container", "body")
        .attr("data-template",
          '<div class="tooltip" role="tooltip">' +
          '<div class="tooltip-arrow"></div>' +
          '<div class="matrix-tooltip tooltip-inner"></div>' +
          '</div>');
    }
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

  setNodeFilter(isNodeHidden) {
    this.isNodeHidden = isNodeHidden;
    this.hasNodeFilter = true;
  }

  shouldVisitCell(cell) {
    let visit = true;

    if (this.visitAttributeCells) {
      visit = visit && cell.isAttributeCell;
    }

    if (this.visitAttributeLabelCells) {
      visit = visit && cell.isAttributeLabelCell;
    }

    if (this.visitDataCells) {
      visit = visit && cell.isDataCell;
    }

    if (this.visitEditAttributeCells) {
      visit = visit && cell.isEditAttributeCell;
    }

    if (this.visitHeaderCells) {
      visit = visit && cell.isHeaderCell;
    }

    if (this.visitLabelCells) {
      visit = visit && cell.isLabelCell;
    }

    return visit;
  }

  setPathFilterFunction(filterPaths) {
    this.pathFilterFunction = filterPaths;
  }

  setTooltipMetrics(metrics) {
    this.metrics = metrics;
  }
}
