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
    this.colorScaleNames = ["Greys", "Greens", "Blues"];
    this.colorScales = [];
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

    // let scale = d3.scale.quantize()
    //   .range(range)
    //   .domain([0, domain[1]]);
    // let quantizeDomain = scale.range().map(function (d, i) {
    //   return scale.invertExtent(d)[1] + 1;
    // });

    let logScale = d3.scale.log()
      .domain(domain)
      .range([0, 100]);

    this.$log.debug("creating color scale");
    this.$log.debug(domain, range);

    let numBins = range.length;
    let step = domain[1] / (numBins - 1);
    let thresholdDomain = [];
    for (let i = 0; i < numBins; ++i) {
      let percent = step * i / domain[1] * 100;
      thresholdDomain.push(logScale.invert(percent));
    }

    let scale = d3.scale.threshold()
      .domain(thresholdDomain)
      .range(range);

    return scale;
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
