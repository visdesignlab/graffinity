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
    bindToController: true
  };

  return directive;
}

class AdjustableColorScaleController {
  constructor($scope, $log) {
    'ngInject';
    this.$log = $log;
    this.$scope = $scope;
    // the default query gets populated in main's constructor
    this.$log.debug("Adjustable color scale controller", this);

    this.$scope.$on("setColorScale", this.setColorScale.bind(this));
  }

  setColorScale(signal, colorScaleIndex, colorScale) {
    if (colorScaleIndex == this.colorScaleIndex) {
      this.$log.debug(this, "received color scale", colorScale);
    }
  }

}
