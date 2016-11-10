/*globals d3
 */
import {visHistogramScent} from "../vis/visHistogramScent"
export class AdjustableColorScaleDirective {

  constructor($log, $timeout) {
    "ngInject";
    this.$log = $log;
    this.$timeout = $timeout;

    // Angular directive stuff
    this.templateUrl = "app/components/adjustableColorScale/adjustableColorScale.directive.html";
    this.restrict = 'EA';
    this.scope = {
      colorScale: '=',
      values: '=',
      colorScaleIndex: '='
    };

    this.controller = AdjustableColorScaleController;
    this.controllerAs = 'controller';
    this.bindToController = true;
    this.link = this.linkFn.bind(this);

  }

  linkFn(scope, element) {
    scope.controller.element = element;
  }
}

class AdjustableColorScaleController {

  constructor($scope, $log, $timeout) {
    'ngInject';
    this.$log = $log;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.svg = null;

    this.formatNumber = d3.format("d");
    this.marginLeft = 10;
    this.marginRight = 10;
    this.width = 200;

    let self = this;
    this.$timeout(function () {
      self.setColorScale(null, self.colorScale)
    });

    this.$scope.$watch(function (scope) {
      return scope.controller.colorScale;
    }, function () {
      self.setColorScale(null, self.colorScale);
    });

    this.$scope.$watch(function (scope) {
      return scope.controller.values;
    }, function () {
      if (!self.values) {
        return;
      }
      if (self.histogram) {
        self.histogram.clear();
      } else {
        self.histogramGroup = self.svgRoot.append("g")
          .attr("transform", "translate(5, 0)");
      }


      //self.histogram = new visHistogramScent(self.$scope, self.histogramGroup, self.width - 10, 40, 30, false, self.values, 0, true);

    });
  }

  drag() {
    let self = this;
    let xMin = self.xScale.domain()[0];
    let xMax = self.xScale.domain()[1];
    let newValue = self.xScale.invert(d3.event.x);
    newValue =
      newValue < xMin ? xMin :
        xMax < newValue ? xMax :
          newValue;

    let newDomain = self.others.slice();
    newDomain.push(newValue);
    newDomain.sort(function (a, b) {
      return a > b;
    });

    self.colorScale.domain(newDomain);
    self.xAxis.tickValues(newDomain);
    self.update();
  }

  dragEnd() {
    this.$scope.$parent.$broadcast("setColorScale", this.colorScaleIndex, this.colorScale)
  }

  dragStart(d) {
    let self = this;
    this.others = [];
    this.colorScale.domain().forEach(function (v) {
      if (v == d) return;
      self.others.push(v);
    });
  }

  onResetClicked() {
    this.setColorScale(0, this.cachedColorScale);
    this.dragEnd(); // broadcast change
  }

  onTickDoubleClicked(d) {
    let self = this;

    let newDomain = [];
    let domain = this.colorScale.domain();
    let range = this.colorScale.range();
    let newRange = [];
    for (let i = 0; i < domain.length; ++i) {
      if (domain[i] != d) {
        newDomain.push(domain[i]);
        newRange.push(range[i]);
      }
    }
    self.colorScale.domain(newDomain);
    self.colorScale.range(newRange);
    self.xAxis.tickValues(newDomain);
    self.update();
  }

  setColorScale(signal, colorScale) {
    if (!colorScale) return;
    this.cachedColorScale = colorScale.copy();
    this.colorScale = colorScale;

    // Create or clear the svg
    if (!this.svg) {
      this.svgRoot = d3.select(this.element[0])
        .select(".legend-container")
        .append("svg")
        .attr("width", this.width)
        .attr("height", 70);

      this.svg = this.svgRoot.append("g")
        .attr("transform", `translate(0, 0)`);

    } else {

      this.svg.selectAll("*")
        .remove();

    }

    let colorScaleDomain = colorScale.domain();
    let xDomain = [colorScaleDomain[0], colorScaleDomain[colorScaleDomain.length - 1]];

    this.xScale = d3.scale.log()
      .domain(xDomain)
      .range([this.marginRight, this.width - this.marginLeft]);

    this.xAxis = d3.svg.axis()
      .scale(this.xScale)
      .orient("bottom")
      .tickSize(13)
      .tickValues(colorScale.domain())
      .tickFormat(function (d) {
        return Math.floor(d);
      });

    this.group = this.svg.append("g")
      .attr("class", "legend");

    this.update();
  }

  update() {
    let self = this;

    let rect = this.group.selectAll(".range")
      .data(this.colorScale.range().map(function (color) {
        var d = self.colorScale.invertExtent(color);
        if (d[0] == null) d[0] = self.xScale.domain()[0];
        if (d[1] == null) d[1] = self.xScale.domain()[1];
        return d;
      }));

    rect.enter()
      .append("rect")
      .classed("range", true)
      .attr("height", 8);

    let drag = d3.behavior.drag()
      .on('dragstart', this.dragStart.bind(this))
      .on('drag', this.drag.bind(this))
      .on('dragend', this.dragEnd.bind(this));

    rect
      .attr("x", function (d) {
        return self.xScale(d[0]);
      })
      .attr("width", function (d) {
        return self.xScale(d[1]) - self.xScale(d[0]);
      })
      .style("fill", function (d) {
        return self.colorScale(d[0]);
      });
    this.group.call(this.xAxis)
      .selectAll(".tick")
      .style("cursor", "ew-resize")
      .on("dblclick", self.onTickDoubleClicked.bind(self))
      .call(drag)
      .append("rect")
      .attr("x", -3)
      .attr("width", 2)
      .attr("height", 13)
      .attr("fill-opacity", 0);
  }

}
