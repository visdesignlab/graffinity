import {SvgGroupElement} from "./svgGroupElement"
import {ControlRow} from "./controlRow"
export class ConnectivityMatrix extends SvgGroupElement {
  constructor(svg, colNodeIndexes) {
    super(svg);
    this.controlRow = new ControlRow(svg, colNodeIndexes);
  }
}
