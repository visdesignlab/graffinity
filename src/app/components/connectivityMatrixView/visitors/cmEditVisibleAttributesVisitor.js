import {cmCellVisitor} from "./cmCellVisitors"

/**
 * Visitor for creating buttons that let the user select visible attribute rows and cols.
 */
export class cmEditVisibleAttributesVisitor extends cmCellVisitor {

  constructor(width, height, editAttributeRows, editAttributeCols) {
    super(width, height);
    this.editAttributeRows = editAttributeRows;
    this.editAttributeCols = editAttributeCols;
    this.visitEditAttributeCells = true;
  }

  apply(cell) {

    if (!this.shouldVisitCell(cell)) {
      return;
    }

    let isVertical = cell.data.isVertical;
    let group = cell.getGroup();
    let height = this.height;
    let width = this.width;

    // Group will hold the foreignObject
    group = group.append("g");

    // Create the foreignObject.
    let container = group.append("foreignObject")
      .style("width", width / 2 + "px")
      .style("height", height);

    // Create a div that will hold the icon.
    let div = container.append('xhtml:div')
      .classed("matrix-view-edit-attribute-controls", true)
      .style("display", "block")
      .style("width", width + "px")
      .style("height", height);

    if (!isVertical) {

      // Position group.
      group.attr("transform", "translate(" + 0 + ", " + (height * 3) + ")");

      // Add the icon.
      div.append("i")
        .classed("fa", true)
        .classed("fa-plus", true)
        .on("click", this.editAttributeCols);

    } else {

      group.attr("transform", "translate(" + width * 3 + ", " + 0 + ")");

      div.append("i")
        .classed("fa", true)
        .classed("fa-plus", true)
        .on("click", this.editAttributeRows);

    }
  }
}
