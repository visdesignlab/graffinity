/* globals d3
 */
import {mock} from "../components/connectivityMatrix/mock.js";

export class MainController {
  constructor($timeout, $log, webDevTec, toastr, cmMatrixViewFactory, cmModelFactory, cmMatrixFactory, cmGraphFactory) {
    'ngInject';

    this.awesomeThings = [];
    this.classAnimation = '';
    this.creationDate = 1459790674829;
    this.toastr = toastr;


    let colNodeIndexes = [[168, 120, 1724], [142, 5107]];

    let svg = d3.select("#my-svg")
      .append("g")
      .attr("transform", "translate(20, 20)");

    let graph = cmGraphFactory.createFromJsonObject(mock.output.graph);
    let matrix = cmMatrixFactory.createFromJsonObject(mock.output.matrix);
    let model = cmModelFactory.createModel(graph, matrix);
    //let colNodeIndexes = model.getColNodeIndexes();
    let connectivityMatrix = cmMatrixViewFactory.createConnectivityMatrix(svg, colNodeIndexes);

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
