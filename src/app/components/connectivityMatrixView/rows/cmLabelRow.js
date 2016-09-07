import {cmMatrixRow} from "./cmMatrixRow"

export class cmLabelRow extends cmMatrixRow {

  constructor(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, majorColLabels, minorColLabels, matrix,
              attributeNodeGroup, areColsCollapsed) {
    super(svg, rowIndex, colNodeIndexes, numHeaderCols, colWidth, rowHeight, false, matrix, areColsCollapsed);

    this.unrollControls = [];
    this.rollupControls = [];

    var numMajorCells = this.getNumMajorCells();
    this.createMinorCells(numHeaderCols, colNodeIndexes);

    for (var i = 0; i < numMajorCells; ++i) {
      let cell = this.getMajorCell(i);
      let dataIndex = this.matrix.getDataColIndex(i);
      if (this.matrix.isControlCell(i)) {

        //cell.isEditAttributeCell = true;
        //cell.setData({
        //  isVertical: false
        //});

      } else if (this.matrix.isAttributeCell(i)) {

        //let attributeIndex = this.matrix.getAttributeColIndex(i);

        //cell.setData({
        //  name: attributeLabels[attributeIndex],
        //  isVertical: 0,
        //  attributeIndex: attributeIndex,
        //  nodeIndexes: rowNodeIndexes,
        //  attributeNodeGroup: attributeNodeGroup,
        //  attributeValues: Utils.getFlattenedLists(rowNodeAttributes[attributeIndex])
        //});
        //
        //cell.isAttributeLabelCell = true;

      } else if (this.matrix.isLabelCell(i)) {
        //
        //cell.setData({
        //  name: "id",
        //  isVertical: 0,
        //  attributeIndex: -1
        //});
        //
        //cell.isAttributeLabelCell = true;

      } else if (this.matrix.isDataCell(i)) {

        cell.isColLabelCell = true;
        cell.setData({
          values: [majorColLabels[dataIndex]],
          isVertical: 1,
          attributeIndex: -1,
          nodeIndexes: colNodeIndexes[dataIndex],
          attributeNodeGroup: attributeNodeGroup
        });

        let ids = {
          sources: [],
          intermediates: [],
          targets: cell.data.nodeIndexes
        };

        cell.data.ids = ids;

        cell.isAttributeCell = true;
        if (this.areColsCollapsed) {
          for (var j = 0; j < colNodeIndexes[dataIndex].length; ++j) {
            let minorCell = cell.minorCells[j];
            if (minorCell) {
              minorCell.isColLabelCell = true;
              minorCell.setData({
                values: [minorColLabels[dataIndex][j]],
                isVertical: 1,
                attributeIndex: -1,
                nodeIndexes: [colNodeIndexes[dataIndex][j]],
                attributeNodeGroup: attributeNodeGroup
              });

              ids = {
                sources: [],
                intermediates: [],
                targets: cell.data.nodeIndexes
              };

              cell.data.ids = ids;

              minorCell.isAttributeCell = true;
            }
          }
        }
      }
    }

    this.colNodeIndexes = colNodeIndexes;
  }

  static createColNodeLabel(cell, label, rowHeight, colWidth) {
    let group = cell.getGroup();
    group.append("g")
      .attr("transform", "translate(" + colWidth / 2 + "," + rowHeight + ")rotate(270)")
      .append("text")
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "middle")
      .attr("font-size", 8)
      .text(label);
  }
}
