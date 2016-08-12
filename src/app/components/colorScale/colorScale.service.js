export class ColorScaleService {

  /**
   *
   */
  constructor($rootScope, $log) {
    "ngInject";
    this.$scope = $rootScope;
    this.$log = $log;
    this.colorScales = {};
    this.hasColorScales = false;
    this.colorScaleNames = ["Blues", "Greens"];
    this.colorScales = [];
  }

  /**
   *
   */
  createColorScale(colorScaleIndex, domain) {
    let name = this.colorScaleNames[colorScaleIndex];
    let range = ColorScaleService.getColorScaleRange(colorbrewer[name], domain);

    let scale = d3.scale.quantize()
      .range(range)
      .domain(domain);

    let quantizeDomain = scale.range().map(function (d) {
      return scale.invertExtent(d)[1] + 1;
    });

    scale = d3.scale.threshold()
      .domain(quantizeDomain)
      .range(range);

    this.setColorScale(colorScaleIndex, scale);
  }

  /**
   *
   */
  static getColorScaleRange(colors, domain) {
    if (domain[0] == 1 && domain[1] == 1) {
      return [colors[3][2]];
    } else if (domain[0] == 1 && domain[1] == 2) {
      return [colors[3][0], colors[3][2]];
    } else if (domain[1] >= 2 && domain[1] < 7) {
      return colors[domain[1] + 1];
    } else {
      return colors[7];
    }
  }

  /**
   *
   */
  setColorScale(colorScaleIndex, colorScale) {
    this.colorScales[colorScaleIndex] = colorScale;
    this.$scope.$broadcast("setColorScale", colorScaleIndex, colorScale);
  }
}
