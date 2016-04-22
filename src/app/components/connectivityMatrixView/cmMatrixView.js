import {SvgGroupElement} from "./svgGroupElement"
import {cmControlRow} from "./cmControlRow"
import {cmLabelRow} from "./cmLabelRow"
import {cmDataRow} from "./cmDataRow"
import {cmAttributeRow} from "./cmAttributeRow"
import {cmScatterPlot1DVisitor} from "./visitors/cmScatterPlot1DVisitor"
import {cmScatterPlot1DPreprocessor} from "./visitors/cmScatterPlot1DVisitor"
import {cmColorMapPreprocessor} from "./visitors/cmColorMapVisitor"
import {cmColorMapVisitor} from "./visitors/cmColorMapVisitor"

export class cmMatrixView extends SvgGroupElement {
  constructor(svg, model) {
    super(svg);
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidths = [];
    this.colNodeIndexes = model.getColNodeIndexes();
    this.numHeaderCols = 3;
    this.numHeaderRows = 3;
    this.rowHeights = [];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.allRows = [];
    this.selectedAttribute = "locations";

    let colNodeAttributes = model.getNodeAttrs(this.colNodeIndexes, this.selectedAttribute);
    let rowNodeAttributes = model.getNodeAttrs(this.rowNodeIndexes, this.selectedAttribute);

    for (var i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
      this.colWidths[i] = this.colWidth;
    }
    this.colWidths[2] = 30;
    this.colWidths[1] = 80;

    // Controls row is the only one with a onColControlsClicked callback.
    let row = new cmControlRow(svg, 0, this.colNodeIndexes, this.numHeaderCols, this.colWidth, this.rowHeight);
    let callback = this.onColControlsClicked.bind(this);
    row.setColClickCallback(callback);
    this.addRow(row, this.rowHeight);

    let attributeRowHeight = 80;
    let attributeRow = new cmAttributeRow(svg, 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, attributeRowHeight, false, colNodeAttributes);
    this.addRow(attributeRow, attributeRowHeight);

    // Create the labels row
    let majorColLabels = model.getMajorColLabels();
    let minorColLabels = model.getMinorColLabels();
    let labelRowHeight = 30;
    let labelRow = new cmLabelRow(svg, 1, this.colNodeIndexes, this.numHeaderCols, this.colWidth, labelRowHeight,
      majorColLabels, minorColLabels);
    this.addRow(labelRow, labelRowHeight);

    // Create each of the data rows!
    let modelRows = model.getCurrentRows();
    let majorRowLabels = model.getMajorRowLabels();
    let minorRowLabels = model.getMinorRowLabels();

    for (i = 0; i < this.rowNodeIndexes.length; ++i) {
      let dataRow = new cmDataRow(svg, i + this.numHeaderRows, this.colNodeIndexes, this.numHeaderCols, this.colWidth,
        this.rowHeight, false, modelRows[i], majorRowLabels[i], minorRowLabels[i], rowNodeAttributes[i]);
      if (modelRows[i].getNumChildren() > 0) {
        callback = this.onRowControlsClicked.bind(this);
        dataRow.createControlsCell(this.colWidth, this.rowHeight, callback);
      }
      this.addRow(dataRow, this.rowHeight);
    }


    let preprocessor = new cmColorMapPreprocessor();
    this.applyVisitor(preprocessor);
    let visitor = new cmColorMapVisitor(preprocessor);
    this.applyVisitor(visitor);


    // Visitor to create scatter plots in per-cell attributes
    preprocessor = new cmScatterPlot1DPreprocessor();
    this.applyVisitor(preprocessor);
    let valueRange = preprocessor.getValueRange();
    visitor = new cmScatterPlot1DVisitor(this.rowHeight / 4, valueRange);
    this.applyVisitor(visitor);


    this.setRowAndColDimensions(this.colWidths, this.rowHeights);
  }

  addRow(row, rowHeight) {
    let y = 0;
    for(var i=0; i<this.allRows.length; ++i) {
      y += this.rowHeights[i];
    }
    row.setPosition(0, y);
    this.allRows.push(row);
    this.rowHeights.push(rowHeight);
  }

  applyVisitor(visitor) {
     for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].apply(visitor);
    }
  }

  getDataColIndex(viewColIndex) {
    return viewColIndex - this.numHeaderCols;
  }

  onColControlsClicked(colIndex, unrolling) {

    // Update width of the column
    if (unrolling) {
      let dataColIndex = this.getDataColIndex(colIndex);
      this.colWidths[colIndex] = (this.colNodeIndexes[dataColIndex].length + 1) * this.colWidths[colIndex];
    } else {
      this.colWidths[colIndex] = this.colWidth;
    }

    // Tell rows to unroll col.
    for (var i = 0; i < this.allRows.length; ++i) {
      if (unrolling) {
        this.allRows[i].unrollCol(colIndex, this.colWidth);
      } else {
        this.allRows[i].rollupCol(colIndex);
      }
    }

    // Update position of other cols.
    this.setRowAndColDimensions(this.colWidths, this.rowHeights);
  }

  onRowControlsClicked(rowIndex) {
    this.rowHeights[rowIndex] = this.allRows[rowIndex].getCurrentHeight();
    this.setRowAndColDimensions(this.colWidths, this.rowHeights);
  }

  setRowAndColDimensions(colWidths, rowHeights) {
    console.log("set row and col dimensions)");
    let y = 0;
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].setColWidths(colWidths);
      this.allRows[i].setPosition(0, y);
      y += rowHeights[i];
    }
  }

  setSortOrders(rowPerm, colPerm) {

  }
}

