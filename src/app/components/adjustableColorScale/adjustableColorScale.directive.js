export function AdjustableColorScaleDirective() {
  'ngInject';

  let directive = {
    restrict: 'E',
    templateUrl: 'app/components/adjustableColorScale/adjustableColorScale.directive.html',
    scope: {
      colorScaleIndex: '='
    },
    controller: AdjustableColorScaleController,
    controllerAs: 'controller',
    bindToController: true,
    link: linkFn
  };

  function linkFn(scope, element) {
    scope.controller.element = element;
  }

  return directive;
}

class AdjustableColorScaleController {
  constructor($scope, $log, colorScaleService) {
    'ngInject';
    this.$log = $log;
    this.$scope = $scope;
    this.colorScaleService = colorScaleService;
    this.svg = null;
    this.$scope.$on("setColorScale", this.setColorScale.bind(this));
    this.formatNumber = d3.format("d");
    this.marginLeft = 10;
    this.marginRight = 10;
    this.width = 180;
  }

  setColorScale(signal, colorScaleIndex, colorScale) {

    if (colorScaleIndex == this.colorScaleIndex) {

      this.colorScale = colorScale;

      // Create or clear the svg
      if (!this.svg) {

        this.svg = d3.select(this.element[0])
          .select(".legend-container")
          .append("svg")
          .attr("width", this.width)
          .attr("height", 30);

      } else {

        this.svg.selectAll("*")
          .remove();

      }

      let colorScaleDomain = colorScale.domain();
      let xDomain = [colorScaleDomain[0], colorScaleDomain[colorScaleDomain.length - 1]];

      this.xScale = d3.scale.linear()
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
    this.colorScaleService.setColorScale(this.colorScaleIndex, this.colorScale)
  }

  dragStart(d) {
    let self = this;
    this.others = [];
    this.colorScale.domain().forEach(function (v) {
      if (v == d) return;
      self.others.push(v);
    });
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

    //this.$log.debug("Creating rect siwth range", this.colorScale.range().map(
    //  function (color) {
    //    var d = self.colorScale.invertExtent(color);
    //    if (d[0] == null) d[0] = self.xScale.domain()[0];
    //    if (d[1] == null) d[1] = self.xScale.domain()[1];
    //    return d;
    //  })
    //);

    rect.enter()
      .append("rect")
      .attr("classed", "range")
      .attr("fill", "red")
      .attr("height", 8)
      .on("dblclick", function () {
        //var newValue = x.invert( d3.mouse(this)[0] );
        //var newDomain = self.colorScale.domain().slice();
        //newDomain.push( newValue );
        //
        //if ( newDomain.length >= scaleMax ) return;
        //
        //newDomain.sort();
        //self.colorScale
        //    .domain( newDomain )
        //    .range(colorbrewer[scale][newDomain.length+1]);
        //xAxis.tickValues( newDomain );
        //update();
      });


    var drag = d3.behavior.drag()
      .on('dragstart', this.dragStart.bind(this))
      .on('drag', this.drag.bind(this))
      .on('dragend', this.dragEnd.bind(this));

    rect.attr("x", function (d) {
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
      .call(drag)
      .append("rect")
      .attr("x", -3)
      .attr("width", 2)
      .attr("height", 13)
      .attr("fill-opacity", 0);
  }

}
