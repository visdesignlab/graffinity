/* globals d3
 */
export class MainController {
  constructor($timeout, webDevTec, toastr, connectivityMatrixFactory) {
    'ngInject';

    this.awesomeThings = [];
    this.classAnimation = '';
    this.creationDate = 1459790674829;
    this.toastr = toastr;


    //let colNodeIndexes = [[168, 120, 1724], [142, 5107]];
    let colNodeIndexes = [[168], [120], [1724], [142], [5107]];
    let svg = d3.select("#my-svg");
    let connectivityMatrix = connectivityMatrixFactory.createConnectivityMatrix(svg, colNodeIndexes);
    console.log(connectivityMatrix.getD3Group());
    this.activate($timeout, webDevTec);
  }

  activate($timeout, webDevTec) {
    this.getWebDevTec(webDevTec);
    $timeout(() => {
      this.classAnimation = 'rubberBand';
    }, 4000);
  }

  getWebDevTec(webDevTec) {
    this.awesomeThings = webDevTec.getTec();

    angular.forEach(this.awesomeThings, (awesomeThing) => {
      awesomeThing.rank = Math.random();
    });
  }

  showToastr() {
    this.toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
    this.classAnimation = '';
  }
}
