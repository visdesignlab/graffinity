/*globals d3, colorbrewer
 */
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
    this.colorScaleNames = ["Blues", "Oranges", "Purples", "Greens"];
    this.colorScales = [];
    this.useLinear = [];
  }

  /**
   *
   */
  createColorScale(colorScaleIndex, domain) {
    let name = this.colorScaleNames[colorScaleIndex];

    if (domain[0] === 0) {
      domain[0]++;
    }

    domain[1]++;

    let range = ColorScaleService.getColorScaleRange(colorbrewer[name], domain);

    if (this.useLinear[colorScaleIndex]) {
      let numBins = range.length;
      let thresholdDomain = [];
      let step = domain[1] / (numBins - 1);
      for (let i = 0; i < numBins; ++i) {
        thresholdDomain.push(step * i + 1);
      }

      return d3.scale.threshold()
        .domain(thresholdDomain)
        .range(range);

    } else {

      let logScale = d3.scale.log()
        .domain(domain)
        .range([0, 100]);

      let numBins = range.length;
      let step = domain[1] / (numBins - 1);
      let thresholdDomain = [];
      for (let i = 0; i < numBins; ++i) {
        let percent = step * i / domain[1] * 100;
        thresholdDomain.push(logScale.invert(percent));
      }

      return d3.scale.threshold()
        .domain(thresholdDomain)
        .range(range);
    }
  }

  /**
   *
   */
  setUseLinearColorScale(useLinear, colorScaleIndex) {
    this.useLinear[colorScaleIndex] = useLinear;
  }

  /**
   *
   */
  static
  getColorScaleRange(colors, domain) {
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


}
