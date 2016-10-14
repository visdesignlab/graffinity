/* global d3
 */
import {cmMatrixRow} from "./cmMatrixRow"

export class cmControlRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, areColsCollapsed, matrix) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, false, matrix);
    this.unrollControls = [];
    this.rollupControls = [];

    let numMajorCells = this.getNumMajorCells();
    for (var i = 0; i < numMajorCells; ++i) {
      var group = this.getMajorCell(i).getGroup();
      this.unrollControls[i] = group.append("g");
      if (this.matrix.isLabelCell(i)) {

        //this.majorCells[i].isEditAttributeCell = true;
        //let data = {
        //  isVertical: true
        //};
        //this.majorCells[i].setData(data);

      } else if (this.matrix.isDataCell(i) && areColsCollapsed) {

        var self = this;
        this.rollupControls[i] = group.append("g");
        this.rollupControls[i].style("display", "none");

        this.unrollControls[i]
          .append("foreignObject")
          .style({
            "width": colWidth + "px",
            "height": rowHeight + "px"
          })
          .append("xhtml:div")
          .classed("matrix-view-edit-attribute-controls", true)
          .append("i")
          .classed("fa", true)
          .classed("fa-angle-down", true)
          .attr("title", "unroll")
          .on("click", function () {
            self.onUnrollColClicked(d3.select(this.parentNode.parentNode.parentNode.parentNode));
          });

        this.rollupControls[i]
          .append("foreignObject")
          .style({
            "width": colWidth + "px",
            "height": rowHeight + "px"
          })
          .append("xhtml:div")
          .classed("matrix-view-edit-attribute-controls", true)
          .append("i").classed("fa", true)
          .classed("fa-angle-right", true)
          .attr("title", "roll up")
          .on("click", function () {
            self.onRollupColClicked(d3.select(this.parentNode.parentNode.parentNode.parentNode));
          });

      }
    }

    this.colNodeIndexes = colNodeIndexes;
  }

  onUnrollColClicked(majorCol) {
    var colIndex = cmMatrixRow.getMajorCellIndex(majorCol);
    this.unrollControls[colIndex].style("display", "none");
    this.rollupControls[colIndex].style("display", "block");
    this.colClickedCallback(colIndex, true);
  }

  onRollupColClicked(majorCol) {
    var colIndex = cmMatrixRow.getMajorCellIndex(majorCol);
    this.unrollControls[colIndex].style("display", "block");
    this.rollupControls[colIndex].style("display", "none");
    this.colClickedCallback(colIndex, false);
  }

  setColClickCallback(callback) {
    this.colClickedCallback = callback;
  }
}
