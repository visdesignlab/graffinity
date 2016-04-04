import {MatrixRow} from "./matrixRow"

export class ControlRow extends MatrixRow {
  constructor(svg, colNodeIndexes) {
    var group = svg.append("g");
    super(group);
    group.selectAll("rect")
    .data(colNodeIndexes)
    .enter()
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("x", function(d, i) { return i * 20; });
    this.colNodeIndexes = colNodeIndexes;

  }
}
