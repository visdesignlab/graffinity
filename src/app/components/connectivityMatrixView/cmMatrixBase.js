/*global reorder
 */
import {
  SvgGroupElement
} from "./svgGroupElement"
import {
  cmAttributeLabelVisitor
} from "./visitors/cmAttributeLabelVisitor"
import {
  cmAttributeLabelScentVisitor
} from "./visitors/cmAttributeLabelScentVisitor"
import {
  cmNodeLabelVisitor
} from "./visitors/cmNodeLabelVisitor"
import {
  cmScatterPlot1DVisitor
} from "./visitors/cmScatterPlot1DVisitor"
import {
  cmScatterPlot1DPreprocessor
} from "./visitors/cmScatterPlot1DVisitor"
import {
  cmColorMapPreprocessor
} from "./visitors/cmColorMapVisitor"
import {
  cmColorMapVisitor
} from "./visitors/cmColorMapVisitor"
import {
  cmClearVisitor
} from "./visitors/cmClearVisitor"
import {
  cmBarChartPreprocessor
} from "./visitors/cmBarChartVisitor"
import {
  cmBarChartVisitor
} from "./visitors/cmBarChartVisitor"
import {
  cmRawValueVisitor
} from "./visitors/cmRawValueVisitor"
import {
  cmEditVisibleAttributesVisitor
} from "./visitors/cmEditVisibleAttributesVisitor"
import {
  cmStringAttributeVisitor
} from "./visitors/cmStringAttributeVisitor"
import {
  cmHoverVisitor
} from "./visitors/cmHoverVisitor"

import {
  cmCategoricalAttributeLabelVisitor
} from "./visitors/cmAttributeLabelVisitor"

import {
  Utils
} from "../utils/utils"
import {
  UtilsD3
} from "../utils/utilsd3"

/**
 * Manages the matrix svg.
 *
 * Call stack for hiding major data cols:
 * - updateDataCols - identifies which columns need to be hidden
 * -- updateCol - toggles visibility of major cols
 * - updatePositions
 *
 * Stack for hiding minor data cols:
 * - updateDataCols
 * -- set state of isMinorColVisible
 * -- updateMinorCols(colIndex, colWidth, isColIndexUnrolled, isMinorColVisible)
 * - updatePositions
 *
 * Stack for hiding major rows:
 *
 * - updateDataRows
 * -- updateRow - toggles visibilty of major rows
 * - updatePositions
 *
 * Stack for hiding minor cols:
 * - updateDataRows
 * -- this.allRows[rowIndex].hide/showMinorRow(minorRowIndex)
 * - updatePositions
 *
 */
export class cmMatrixBase extends SvgGroupElement {

  constructor(svg, model, $log, $uibModal, scope, viewState, modalService, mainController) {
    super(svg);
    this.$log = $log;
    this.$uibModal = $uibModal;
    this.modalService = modalService;
    this.$scope = scope;
    this.mainController = mainController;
    this.viewState = viewState;
    this.isActive = true;
    this.colWidth = 15;
    this.rowHeight = 15;
    this.colWidthAttr = 70;
    this.colWidthLabel = 70;
    this.colWidthControl = 15;
    this.labelRowHeight = this.colWidthLabel;
    this.rowHeightAttr = 70;

    this.paddingBottom = 4;
    this.paddingRight = 4;

    this.svg = svg;


    this.highlights = [];
    this.rowHeights = [];
    this.colWidths = [];
    this.allRows = [];

    this.gridPosition = [];

    this.isActive = true;

    let self = this;
    this.$scope.$on("updatePositions", function (event, rowPerm, colPerm) {
      self.updatePositions(rowPerm, colPerm);
    });

    this.$scope.$on("toggleAttributeRow", function (event, attributeIndex, visible, sender) {
      if (sender != self) {
        self.onToggleAttributeRow(attributeIndex, visible, true);
      }
    });

    this.$scope.$on("toggleAttributeCol", function (event, attributeIndex, visible, sender) {
      if (sender != self) {
        self.onToggleAttributeCol(attributeIndex, visible, true);
      }
    });

    this.$scope.$on("changeVisibleAttributeRows", function (event, selection, sender) {
      if (sender != self) {
        self.updateColAttributes(selection);
      }
    });

    this.$scope.$on("changeVisibleAttributeCols", function (event, selection, sender) {
      if (sender != self) {
        self.updateRowAttributes(selection);
      }
    });

    this.$scope.$on("rowControlsClicked", function (event, rowIndex, unrolling, sender) {
      if (sender != self) {
        self.onRowControlsClicked(rowIndex, unrolling, true);
      }
    });

    this.$scope.$on("colControlsClicked", function (event, colIndex, unrolling, sender) {
      if (sender != self && !self.isControlsMatrix) {
        self.onColControlsClicked(colIndex, unrolling, true);
      }
    });

    this.$scope.$on("positionHighlights", self.onPositionHighlights.bind(self));
    this.$scope.$on("hideHighlights", self.onHideHighlights.bind(self));
    this.$scope.$on("clearSelection", self.onClearSelection.bind(self));
    this.$scope.$on("setColorScale", self.setColorScale.bind(self));
  }

  addRow(row, rowHeight) {
    let y = 0;
    for (var i = 0; i < this.allRows.length; ++i) {
      y += this.rowHeights[i];
    }
    row.setPosition(0, y);
    this.allRows.push(row);
    this.rowHeights.push(rowHeight);
    this.addChild(row);
  }

  applyVisitor(visitor) {
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].apply(visitor);
    }
  }

  createAttributeEncodings() {

    // Clear attributes and attribute labels
    let visitor = new cmClearVisitor();
    visitor.setClearAttributeCells(true);
    visitor.setClearAttributeLabelCells(true);
    this.applyVisitor(visitor);

    // Create controls for all attributes.
    let sortRows = this.onSortRowsByAttribute.bind(this);
    let sortCols = this.onSortColsByAttribute.bind(this);
    let hideRows = this.onToggleAttributeRow.bind(this);
    let hideCols = this.onToggleAttributeCol.bind(this);
    let filterAttributes = this.mainController.openNodeAttributeFilter.bind(this.mainController);


    // Create visual encodings for all the quantitative attributes.
    let isNodeHidden = this.viewState.isNodeHidden;

    // For all attributes...
    for (let i = 0; i < this.attributes.length; ++i) {
      let attribute = this.attributes[i];

      // Is the attribute categorical?
      if (this.model.isCategoricalAttribute(attribute)) {

        // For all of the attribute groups...
        for (let j = 0; j < this.attributeNodeGroupsBeingDisplayed.length; ++j) {
          let attributeNodeGroup = this.attributeNodeGroupsBeingDisplayed[j];
          visitor = new cmStringAttributeVisitor(i, attributeNodeGroup, this.colWidth, this.labelRowHeight, this.colWidthLabel, this.rowHeight);
          visitor.isVisitingColsCollapsedAttr = attribute == this.model.colsCollapseAttr && attributeNodeGroup == this.model.AttributeNodeGroups.TARGET;
          visitor.isVisitingAirportOrState = attribute == 'state' || attribute == "airport";
          if (!this.isNodeListView) {
            visitor.isVisitingRowsCollapsedAttr = attribute == this.model.rowCollapseAttr && attributeNodeGroup == this.model.AttributeNodeGroups.SOURCE;
            visitor.areRowsCollapsed = this.model.areRowsCollapsed;
          } else {
            visitor.isVisitingRowsCollapsedAttr = attribute == this.model.intermediateNodeCollapseAttr && attributeNodeGroup == this.model.AttributeNodeGroups.INTERMEDIATE;
            visitor.areRowsCollapsed = this.model.areIntermediateNodesCollapsed;
          }

          visitor.areColsCollapsed = this.model.areColsCollapsed;
          visitor.setCallbacks(null, this.onCellMouseOver.bind(this), this.onCellMouseOut.bind(this));

          this.applyVisitor(visitor);

          // Create the attribute label and scent.
          visitor = new cmCategoricalAttributeLabelVisitor(i, attributeNodeGroup, sortRows, sortCols, hideRows, hideCols, this.colWidth,
            this.rowHeight, this.labelRowHeight / 2, this.colWidthAttr, filterAttributes, filterAttributes);
          this.applyVisitor(visitor);
        }

      } else { // the attribute must be quantitative

        for (let j = 0; j < this.attributeNodeGroupsBeingDisplayed.length; ++j) {
          let attributeNodeGroup = this.attributeNodeGroupsBeingDisplayed[j];
          // Assume only one encoding per attribute
          let preprocessor = new cmScatterPlot1DPreprocessor(i, attributeNodeGroup);
          preprocessor.setNodeFilter(isNodeHidden);
          this.applyVisitor(preprocessor);

          let valueRange = preprocessor.getValueRange();
          visitor = new cmScatterPlot1DVisitor(i, attributeNodeGroup, this.rowHeight / 4, valueRange);
          visitor.setNodeFilter(isNodeHidden);
          visitor.setCallbacks(null, this.onCellMouseOver.bind(this), this.onCellMouseOut.bind(this));

          // Uncomment this to enable hovering on the node attributes.
          // visitor.setCallbacks(null, this.onCellMouseOver.bind(this), this.onCellMouseOut.bind(this));

          this.applyVisitor(visitor);

          // create labels for all the quantitative attribute columns/rows
          visitor = new cmAttributeLabelVisitor(i, attributeNodeGroup, sortRows, sortCols, hideRows, hideCols, this.colWidth,
            this.rowHeight, this.labelRowHeight / 2, this.colWidthAttr, filterAttributes, filterAttributes);
          this.applyVisitor(visitor);
        }
      }
    }

    // Done with attributes, now create the "ids"
    for (let j = 0; j < this.attributeNodeGroupsBeingDisplayed.length; ++j) {
      let attributeNodeGroup = this.attributeNodeGroupsBeingDisplayed[j];
      visitor = new cmStringAttributeVisitor(-1, attributeNodeGroup, this.colWidth, this.labelRowHeight, this.colWidthLabel, this.rowHeight);
      visitor.setCallbacks(this.onCellClicked.bind(this), this.onCellMouseOver.bind(this), this.onCellMouseOut.bind(this));
      visitor.isVisitingAirportOrState = true;
      // visitor.areRowsCollapsed = (!this.isNodeListView) && this.model.areRowsCollapsed;
      if (this.isNodeListView) {
        visitor.areRowsCollapsed = this.model.areIntermediateNodesCollapsed;
      } else {
        visitor.areRowsCollapsed = this.model.areRowsCollapsed;
      }
      visitor.areColsCollapsed = this.model.areColsCollapsed;
      this.applyVisitor(visitor);
    }

    // Create controls for the 'labels' or 'id' column/row
    visitor = new cmNodeLabelVisitor(sortRows, sortCols, hideRows, hideCols, this.colWidth, this.rowHeight,
      this.labelRowHeight, this.colWidthLabel, filterAttributes, filterAttributes);
    visitor.setCreateColumnLabels(!this.isNodeListView);
    this.applyVisitor(visitor);

    // Create controls for editing visible attributes.
    let editAttributeCols = this.onEditVisibleAttributeCols.bind(this);
    let editAttributeRows = this.onEditVisibleAttributeRows.bind(this);
    visitor = new cmEditVisibleAttributesVisitor(this.colWidth, this.rowHeight, editAttributeRows, editAttributeCols);
    this.applyVisitor(visitor);
  }

  /**
   * Function called to create highlight rects. These are the boxes that follow the mouse as it hovers over grid cells.
   */
  createHighlights() {
    this.highlights[0] = this.svg.append("line")
      .classed("matrix-view-highlight-rect", true);
    this.highlights[1] = this.svg.append("line")
      .classed("matrix-view-highlight-rect", true);
    this.highlights[2] = this.svg.append("line")
      .classed("matrix-view-highlight-rect", true);
    this.highlights[3] = this.svg.append("line")
      .classed("matrix-view-highlight-rect", true);
  }

  /**
   * Connects this to signals broadcast by the global scope.
   */
  connectToViewState(scope) {
    let onHoverNodes = this.onHoverNodes.bind(this);
    let onQuantitativeAttributeFilterUpdate = this.onQuantitativeAttributeFilterUpdate.bind(this);
    scope.$on("filterChanged", this.onFilterChanged.bind(this));
    scope.$on("hoverNodes", onHoverNodes);
    scope.$on("updateQuantitativeAttributeFilter", onQuantitativeAttributeFilterUpdate);
  }

  getAttributeColIndex(viewColIndex) {
    return viewColIndex - this.numControlCols;
  }

  getAttributeColWidths() {
    let total = 0;
    for (var i = 0; i < this.colWidths.length; ++i) {
      if (this.isAttributeCell(i) || this.isLabelCell(i) || this.isControlCell(i)) {
        total += this.colWidths[i];
      }
    }
    return total;
  }

  getAvailableMetrics(database) {
    let metrics = [{
      "name": "path count",
      "tooltip": "path(s)",
      "metricFn": function (paths) {
        return paths.length;
      },
      "output": "scalar"
    }, {
      "name": "node count",
      "tooltip": "middle node(s)",
      "metricFn": function (paths) {
        return Utils.getIntermediateNodesFromPaths(paths).length;
      },
      "output": "scalar"
    }];

    if (database == "flights") {
      metrics.push({
        "name": "carrier count",
        "tooltip": "carrier(s)",
        "metricFn": function (paths, graph) {
          let carriers = [];
          for (var i = 0; i < paths.length; ++i) {
            let edge = paths[i][1];

            let carrier = graph.graph.edge(paths[i][0], paths[i][2], edge).carrier;

            if (carriers.indexOf(carrier) == -1) {
              carriers.push(carrier);
            }
          }
          return carriers.length;
        },
        "output": "scalar"
      });
    } else {
      // metrics.push({
      //   "name": "source area",
      //   "tooltip": "source area",
      //   "metricFn": function (paths, graph) {
      //     return Utils.getAreaFromPaths("sourceSizes", paths, graph);
      //   },
      //   "output": "scalar"
      // });

      // metrics.push({
      //   "name": "target area",
      //   "tooltip": "target area",
      //   "metricFn": function (paths, graph) {
      //     return Utils.getAreaFromPaths("targetSizes", paths, graph);
      //   },
      //   "output": "scalar"
      // });

      // metrics.push({
      //     "name": "area diff",
      //     "tooltip": "area diff",
      //     "metricFn": function (paths, graph) {
      //         let sourceSizes = Utils.getAreaFromPaths("sourceSizes", paths, graph);
      //         let targetSizes = Utils.getAreaFromPaths("targetSizes", paths, graph);
      //         return Math.abs(sourceSizes - targetSizes);
      //     },
      //     "output": "scalar"
      // });

    }

    if (!this.isNodeListView) {
      metrics.push({
        "name": "len vs paths",
        "metricFn": function (paths) {
          let summary = {};
          for (var i = 0; i < paths.length; ++i) {
            let path = paths[i];

            // Have we globally seen a path with this many hops before?
            let numHops = Utils.getNumHops(path);

            // Record this numHops locally. Summary is map[numHops] -> numPaths.
            if (summary[numHops] == undefined) {
              summary[numHops] = 1;
            } else {
              summary[numHops] += 1;
            }
          }
          return summary;
        },
        "output": "list"
      });
    } else {
      metrics.push({
        "name": "num start | num end",
        "metricFn": function (paths) {
          return Utils.getIntermediateNodesFromPaths(paths).length;
        },
        "output": "list"
      });
    }
    return metrics;

  }

  getAvailableEncodings(metricOutput) {
    let metrics = null;
    if (metricOutput == "scalar") {
      metrics = [{
          "name": "colormap",
          "hasScaleOption": true
        },
        {
          "name": "bar chart",
          "hasScaleOption": true
        },
        {
          "name": "raw value",
          "hasScaleOption": false
        }
      ];
    } else if (metricOutput == "list") {
      metrics = [{
        "name": "bar chart",
        "hasScaleOption": true
      }];
    }
    return metrics
  }

  /**
   * Returns transform of cell in this.svg's coordinate system.
   * Accumulates transforms of the cells ancestors, depending on how deep the cell is in the tree.
   */
  static getCellTransform(cell) {
    let transform = {};
    let element = cell.getGroup()[0][0];
    if (cell.isMajorCell && cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 1);
    } else if (cell.isMajorCell && !cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 3);
    } else if (!cell.isMajorCell && cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 2);
    } else if (!cell.isMajorCell && !cell.isInMajorRow) {
      transform = UtilsD3.getAccumulatedTranslate(element, 4);
    }
    return transform;
  }

  static getColXPositions(colPerm, colWidths) {
    let positions = [];
    let x = 0;
    for (var i = 0; i < colWidths.length; ++i) {
      let logicalColIndex = colPerm[i];
      positions.push(x);
      x += colWidths[logicalColIndex];
    }
    return positions;
  }

  getColWidth(colIndex, unrolled) {
    if (unrolled) {
      let numVisibleMinorCells = this.getNumVisibleMinorCells(colIndex);
      return (numVisibleMinorCells + 1) * this.colWidth; // +1 is for the width of the major cells
    } else {
      return this.colWidth;
    }
  }

  getDataColIndex(viewColIndex) {
    return viewColIndex - this.numHeaderCols;
  }

  getDataRowIndex(viewRowIndex) {
    return viewRowIndex - this.numHeaderRows;
  }

  getHeight() {
    let total = 0;
    for (var i = 0; i < this.rowHeights.length; ++i) {
      total += this.rowHeights[i];
    }
    total += this.paddingBottom;
    return total;
  }

  /**
   * Returns a matrix of scalar values that can be fed to reorder.js.
   */
  getMajorRowsAndColsAsScalarMatrix() {
    let matrix = [];
    for (var i = 0; i < this.allRows.length; ++i) {
      if (this.isDataRow(i)) {
        let row = [];
        for (var j = 0; j < this.allRows[i].majorCells.length; ++j) {
          if (this.isDataCell(j)) {
            let paths = this.allRows[i].majorCells[j].getPathList();
            let filteredPaths = this.viewState.getFilterPathFunction()(paths);
            row.push(filteredPaths.length);
          }
        }
        matrix.push(row);
      }
    }
    return matrix;
  }

  getMaxUnrolledHeight() {
    let flattened = Utils.getFlattenedLists(this.rowNodeIndexes);
    if (flattened.length == this.rowNodeIndexes.length) {
      return flattened.length * this.rowHeight;
    } else {
      return (this.rowNodeIndexes.length * this.rowHeight) + (flattened.length * this.rowHeight);
    }
  }

  getMaxUnrolledWidth() {
    let flattened = Utils.getFlattenedLists(this.colNodeIndexes);
    if (flattened.length == this.colNodeIndexes.length) {
      return flattened.length * this.colWidth;
    } else {
      return (this.colNodeIndexes.length * this.rowHeight) + (flattened.length * this.colWidth);
    }
  }

  static getMetricFunction(metric) {
    if (metric == "path count") {
      return function (paths) {
        return paths.length;
      };
    } else if (metric == "node count") {
      return function (paths) {
        return Utils.getIntermediateNodesFromPaths(paths).length;
      }
    } else if (metric == "carrier count") {
      return function (paths, graph) {
        let carriers = [];
        for (var i = 0; i < paths.length; ++i) {
          let edge = paths[i][1];

          let carrier = graph.graph.edge(paths[i][0], paths[i][2], edge).carrier;

          if (carriers.indexOf(carrier) == -1) {
            carriers.push(carrier);
          }
        }
        return carriers.length;
      }
    }
  }


  /**
   * Returns the number of visible minor cols inside colIndex.
   */
  getNumVisibleMinorCells(colIndex) {
    let isMinorColVisible = this.isMinorColVisible[colIndex];
    let numVisibleMinorCols = 0;
    for (var i = 0; i < isMinorColVisible.length; ++i) {
      if (isMinorColVisible[i]) {
        numVisibleMinorCols += 1;
      }
    }
    return numVisibleMinorCols;
  }

  static getHeight(rowPerm, rowHeights) {
    let y = 0;
    for (var i = 0; i < rowPerm.length; ++i) {
      let logicalRowIndex = rowPerm[i];
      y += rowHeights[logicalRowIndex];
    }
    return y;
  }

  static getRowYPositions(rowPerm, rowHeights) {
    let positions = [];
    let y = 0;
    for (var i = 0; i < rowPerm.length; ++i) {
      let logicalRowIndex = rowPerm[i];
      positions.push(y);
      y += rowHeights[logicalRowIndex];
    }
    return positions;
  }

  getViewIndexFromAttributeIndex(attributeIndex) {
    return attributeIndex + this.numControlCols;
  }

  getViewColIndexFromDataIndex(dataColIndex) {
    return dataColIndex + this.numHeaderCols;
  }

  static getWidth(colPerm, colWidths) {
    let x = 0;
    for (var i = 0; i < colWidths.length; ++i) {
      let logicalColIndex = colPerm[i];
      x += colWidths[logicalColIndex];
    }
    return x;
  }

  getWidth() {
    let width = 0;
    for (var i = 0; i < this.colWidths.length; ++i) {
      width += this.colWidths[i];
    }
    width += this.paddingRight;
    return width;
  }

  initAttributeData(model) {
    this.rowAttributes = model.getRowAttributeValues();
    this.rowNodeAttributes = model.getRowNodeAttributeValues();
    this.colAttributes = model.getColAttributeValues();
  }

  /**
   * Fills this.attributes with the model's quantitative attributes.
   * Creates this.isAttributeRow/Col visible.
   */
  initAttributeState(model) {
    let attributes = model.getAvailableAttributes();
    this.attributes = attributes;

    // If this is the first time setModal has been called, then by default, set all attributes as hidden. Else, show
    // attributes that the user already selected.
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.isAttributeColVisible = {};
      this.isAttributeRowVisible = {};
      for (var i = 0; i < attributes.length; ++i) {
        this.isAttributeColVisible[attributes[i]] = false;
        this.isAttributeRowVisible[attributes[i]] = false;
      }
    }
  }

  /**
   * Fills this.isMajorColUnrolled, this.isMinorColVisible
   */
  initColStates() {
    this.isMajorColUnrolled = [];
    this.isMinorColVisible = [];
    for (let i = 0; i < this.numHeaderCols + this.colNodeIndexes.length; ++i) {
      this.isMajorColUnrolled[i] = false;
      this.isMinorColVisible[i] = [];
      if (this.isDataCell(i)) {
        let dataIndex = this.getDataColIndex(i);
        for (let j = 0; j < this.colNodeIndexes[dataIndex].length; ++j) {
          this.isMinorColVisible[i][j] = true;
        }
      }
    }
  }

  /**
   * Fills this.colWidths using the data/view/attribute indexes.
   */
  initColWidths() {
    if (!this.isControlsMatrix) {
      for (let i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
        if (this.isControlCell(i)) {
          this.colWidths[i] = this.colWidthControl;
        } else if (this.isDataCell(i)) {
          this.colWidths[i] = this.colWidth;
        } else if (this.isAttributeCell(i)) {
          this.colWidths[i] = this.colWidthAttr;
        } else if (this.isLabelCell(i)) {
          this.colWidths[i] = this.colWidthLabel;
        }
      }
    } else {
      for (let i = 0; i < this.colNodeIndexes.length + this.numHeaderCols; ++i) {
        if (this.isControlCell(i)) {
          this.colWidths[i] = this.colWidthControl;
        } else if (this.isDataCell(i)) {
          this.colWidths[i] = 0;
        } else if (this.isAttributeCell(i)) {
          this.colWidths[i] = this.colWidthAttr;
        } else if (this.isLabelCell(i)) {
          this.colWidths[i] = this.colWidthLabel;
        }
      }
    }
  }

  /**
   * Initializes this.row/col indexes.
   */
  initNodeIndexes(model) {
    this.rowAttributeNodeGroup = this.model.AttributeNodeGroups.SOURCE;
    this.colAttributeNodeGroup = this.model.AttributeNodeGroups.TARGET;
    this.attributeNodeGroupsBeingDisplayed = [this.rowAttributeNodeGroup, this.colAttributeNodeGroup];
    this.rowNodeIndexes = model.getRowNodeIndexes();
    this.colNodeIndexes = model.getColNodeIndexes();
  }

  /**
   * Creates indexes for the data/header/attribute/label rows and cols.
   */
  initViewIndexes(attributes) {
    this.numControlCols = 1;
    this.numAttributeCols = attributes.length;
    this.numLabelCols = 1;
    this.numHeaderCols = this.numControlCols + this.numAttributeCols + this.numLabelCols;

    this.numControlRows = 1;
    this.numAttributeRows = attributes.length;
    this.numLabelRows = 1;
    this.numHeaderRows = this.numControlRows + this.numAttributeRows + this.numLabelRows;

    this.rowHeights = [];
    this.colWidths = [];
    this.allRows = [];
    this.rowPerm = reorder.permutation(this.numHeaderRows + this.rowNodeIndexes.length);
    this.colPerm = reorder.permutation(this.numHeaderCols + this.colNodeIndexes.length);
  }


  isAttributeCell(colIndex) {
    return colIndex >= this.numControlCols && colIndex < (this.numAttributeCols + this.numControlCols);
  }

  isAttributeRow(rowIndex) {
    return rowIndex >= this.numControlRows && rowIndex < (this.numAttributeRows + this.numControlRows);
  }

  isControlCell(colIndex) {
    return colIndex < this.numControlCols;
  }

  isControlRow(rowIndex) {
    return rowIndex < this.numControlRows;
  }

  isDataCell(colIndex) {
    return !this.isControlCell(colIndex) && !this.isAttributeCell(colIndex) && !this.isLabelCell(colIndex);
  }

  isDataRow(rowIndex) {
    return !this.isControlRow(rowIndex) && !this.isAttributeRow(rowIndex) && !this.isLabelRow(rowIndex);
  }

  isLabelCell(colIndex) {
    return colIndex >= this.numAttributeCols + this.numControlCols &&
      colIndex < this.numAttributeCols + this.numControlCols + this.numLabelCols;
  }

  isLabelRow(rowIndex) {
    return rowIndex >= this.numAttributeRows + this.numControlRows &&
      rowIndex < this.numAttributeRows + this.numControlRows + this.numLabelRows;
  }

  onCellClicked(cell) {

    this.viewState.clearSelection();

    this.selectedCell = cell;
    cell.interactionGroup.classed("hovered", false);
    cell.interactionGroup.classed("selected", true);


    // Tell other views that we changed selection.
    let paths = [];
    if (cell.isDataCell) {
      paths = cell.getPathList();
    } else if (cell.isColLabelCell) {
      paths = this.model.getPathsWithTargets(cell.data.nodeIndexes);
    } else if (cell.isRowLabelCell && !cell.isInNodeListView) {
      paths = this.model.getPathsWithSources(cell.data.nodeIndexes);
    } else if (cell.isRowLabelCell && cell.isInNodeListView) {
      paths = this.model.getPathsWithIntermediates(cell.data.nodeIndexes);
    }

    paths = this.viewState.getFilterPathFunction()(paths);

    this.mainController.onPathsSelected(paths);
  }

  onCellMouseOver(cell) {

    // this.$log.debug("onCellMouseOver", this, cell);
    // this.$log.debug("sources", sources, cell.data.ids.sources);
    // this.$log.debug("intermediates", intermediates, cell.data.ids.intermediates);
    // this.$log.debug("targets", targets, cell.data.ids.targets);

    // Global highlighting - tell all other views
    this.viewState.setHoveredNodes(cell.data.ids, true); // true => look for exact match of paths in other views

    // Local highlighting - tell only the other matrices
    let transform = cmMatrixBase.getCellTransform(cell);

    let rect = cell.getGroup()
      .select(".matrix-view-interaction-group")
      .select("rect");

    let cellWidth = parseInt(rect.attr("width"));
    let cellHeight = parseInt(rect.attr("height"));

    this.$scope.$broadcast("positionHighlights", cellWidth, cellHeight, transform, this.gridPosition);
  }

  onCellMouseOut() {
    // Hide highlights
    this.$scope.$broadcast("hideHighlights");
    this.viewState.setHoveredNodes(null);
  }

  onClearSelection() {
    if (this.selectedCell) {
      this.selectedCell.interactionGroup.classed("selected", false);
    }
  }

  /** Callback when user clicks on the column controls.
   * Updates width of the column and unrolls its children.
   */
  onColControlsClicked(colIndex, unrolling, isReceiver) {
    this.isMajorColUnrolled[colIndex] = unrolling;
    this.updateMinorCols(colIndex, this.colWidth, this.isMajorColUnrolled[colIndex], this.isMinorColVisible);
    this.updatePositions(this.rowPerm, this.colPerm);
    if (!isReceiver) {
      this.$scope.$broadcast("colControlsClicked", colIndex, unrolling, this);
      this.$scope.$broadcast("changeMatrixHeight");
    }
  }

  onEditVisibleAttributeCols() {
    let updateRowAttributes = this.updateRowAttributes.bind(this);
    let resizeEvent = "changeMatrixHeight";
    let visibilityEvent = "changeVisibleAttributeCols";
    this.onEditVisibleAttributes(this.attributes, this.isAttributeColVisible, updateRowAttributes, resizeEvent, visibilityEvent);
  }

  onEditVisibleAttributeRows() {
    let updateColAttributes = this.updateColAttributes.bind(this);
    let resizeEvent = "changeMatrixHeight";
    let visibilityEvent = "changeVisibleAttributeRows";
    this.onEditVisibleAttributes(this.attributes, this.isAttributeRowVisible, updateColAttributes, resizeEvent, visibilityEvent);
  }

  onEditVisibleAttributes(attributes, isAttributeVisible, updateVisibleAttributes, resizeEvent, visibilityEvent) {

    let modalSuccess = function (selection) {
      updateVisibleAttributes(selection, isAttributeVisible);
      this.$scope.$broadcast(visibilityEvent, selection, this);
      this.$scope.$broadcast(resizeEvent);
    };

    modalSuccess = modalSuccess.bind(this);

    this.modalService.getSelectionFromList("Select attributes", attributes, isAttributeVisible, modalSuccess);
  }

  onToggleAttributeRow(attributeIndex, visible, isReceiver, skipUpdate) {
    let attribute = this.attributes[attributeIndex];
    let viewIndex = this.getViewIndexFromAttributeIndex(attributeIndex);
    this.isAttributeRowVisible[attribute] = visible;
    this.updateRow(viewIndex, visible);

    if (!skipUpdate) {
      this.updatePositions(this.rowPerm, this.colPerm);
    }

    if (!isReceiver) {
      this.$scope.$broadcast("toggleAttributeRow", attributeIndex, visible, this);
      this.$scope.$broadcast("changeMatrixHeight");
    }

  }

  onToggleAttributeCol(attributeIndex, visible, isReceiver, skipUpdate) {
    let attribute = this.attributes[attributeIndex];
    let viewIndex = this.getViewIndexFromAttributeIndex(attributeIndex);
    this.isAttributeColVisible[attribute] = visible;
    this.updateCol(viewIndex, visible);

    if (!skipUpdate) {
      this.updatePositions(this.rowPerm, this.colPerm);
    }

    if (!isReceiver) {
      this.$scope.$broadcast("toggleAttributeCol", attributeIndex, visible, this);
      this.$scope.$broadcast("changeMatrixHeight");
    }
  }

  onHideHighlights() {
    this.highlights.forEach(function (highlight) {
      highlight.style("display", "none");
    });
  }

  onFilterChanged() {
    if (!this.isControlsMatrix) {
      this.updateDataRows();
      this.updateDataCols();
    }
    this.setEncoding(this.encoding, this.metric);
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  /**
   * Called when the mouse is on top of a node in another view.
   */
  onHoverNodes(event, nodeIndexes, matchPaths) {
    // this.$log.debug(this, "onHoverNodes", nodeIndexes, matchPaths);
    if (!this.isActive) {
      return;
    }

    if (!this.hoverVisitor) {
      this.hoverVisitor = new cmHoverVisitor();
    }

    if (nodeIndexes) {
      this.hoverVisitor.setNodes(nodeIndexes, matchPaths);
      this.hoverVisitor.isHovered = true;
    } else {
      this.hoverVisitor.setNodes(null);
      this.hoverVisitor.isHovered = false;
    }

    this.applyVisitor(this.hoverVisitor);
  }

  /**
   * Adjusts positions of highlight lines.
   */
  onPositionHighlights(event, cellWidth, cellHeight, position, gridPosition) {
    // If first time, then create highlight rectangles.

    if (this.gridPosition[1] == gridPosition[1]) {
      this.highlights[0].style("display", "block");
      this.highlights[0].attr("x1", -1)
        .attr("x2", this.getWidth() + 1)
        .attr("y1", position.translate[1])
        .attr("y2", position.translate[1]);

      this.highlights[1].style("display", "block");
      this.highlights[1].attr("x1", -1)
        .attr("x2", this.getWidth() + 1)
        .attr("y1", position.translate[1] + cellHeight)
        .attr("y2", position.translate[1] + cellHeight);
    }

    if (this.gridPosition[0] == gridPosition[0]) {
      this.highlights[2].style("display", "block");
      this.highlights[2].attr("x1", position.translate[0])
        .attr("x2", position.translate[0])
        .attr("y1", -1)
        .attr("y2", this.getHeight() + 1);

      this.highlights[3].style("display", "block");
      this.highlights[3].attr("x1", position.translate[0] + cellWidth)
        .attr("x2", position.translate[0] + cellWidth)
        .attr("y1", -1)
        .attr("y2", this.getHeight() + 1);
    }
  }

  /**
   * Unroll the row and expands its height.
   */
  onRowControlsClicked(rowIndex, unrolling, isReceiver) {
    let row = this.allRows[rowIndex];

    if (isReceiver && row) {
      if (unrolling) {
        row.onUnrollRowClicked(true);
      } else {
        row.onRollupRowClicked(true);
      }
    }

    if (row) {
      this.rowHeights[rowIndex] = row.getCurrentHeight();
      this.updatePositions(this.rowPerm, this.colPerm);
      if (!isReceiver) {
        this.$scope.$broadcast("rowControlsClicked", rowIndex, unrolling, this);
        this.$scope.$broadcast("changeMatrixHeight");
      }
    }
  }

  onSortColsByAttribute(attribute, ascending, sortBar) {
    let colPerm = this.model.getSortedIndexesOfNodeIndexAttr(this.colNodeIndexes, attribute, ascending, this.colAttributeNodeGroup);
    let shiftedColPerm = Utils.shiftPermutation(colPerm, this.numHeaderCols);
    this.resetSortState(false, true, sortBar);
    this.mainController.ui.selectedSortOrder = "custom";
    this.$scope.$broadcast("updatePositions", this.rowPerm, shiftedColPerm);
  }

  onSortRowsByAttribute(attribute, ascending, sortBar) {
    let rowPerm = this.model.getSortedIndexesOfNodeIndexAttr(this.rowNodeIndexes, attribute, ascending, this.rowAttributeNodeGroup);
    let shiftedRowPerm = Utils.shiftPermutation(rowPerm, this.numHeaderRows);
    this.resetSortState(true, false, sortBar);
    this.updatePositions(shiftedRowPerm, this.colPerm);
    if (!this.isNodeListView) {
      this.mainController.ui.selectedSortOrder = "custom";
    }
    this.$scope.$broadcast("updatePositions", shiftedRowPerm, this.colPerm);
  }

  /**
   * Called when the user changes the filter on a set of nodes. This will draw a scent of the filter on the attribute
   * control cells.
   */
  onQuantitativeAttributeFilterUpdate(event, attribute, attributeNodeGroup, range) {
    let visitor = new cmAttributeLabelScentVisitor(this.attributes.indexOf(attribute), attributeNodeGroup, range);
    this.applyVisitor(visitor);
  }

  resetSortState(resetRows, resetCols, sortBar) {
    let sortBars = this.svg.selectAll(".matrix-view-sortbar")
      .filter(function (d) {
        if (resetRows && !resetCols) {
          return !d;
        } else if (!resetRows && resetCols) {
          return d;
        } else if (resetRows && resetCols) {
          return true;
        } else {
          return false;
        }
      })
      .filter(function () {
        return this != sortBar;
      })
      .style("display", "none");

    sortBars.selectAll(".fa")
      .attr("data-is-sorted", '');
  }

  /**
   * Updates the bound color scale.
   */
  setColorScale(signal, colorScaleIndex, colorScale) {

    if (signal) {
      let visitor = new cmClearVisitor();
      visitor.setClearDataCells(true);
      this.applyVisitor(visitor);
    }
    let cellWidth = this.colWidth;
    let cellHeight = this.rowHeight;

    let visitor = new cmColorMapVisitor(colorScale, colorScaleIndex, cellWidth, cellHeight);

    let clicked = this.onCellClicked.bind(this);
    let mouseover = this.onCellMouseOver.bind(this);
    let mouseout = this.onCellMouseOut.bind(this);

    let metricFunction = this.metric.metricFn;

    visitor.setTooltipMetrics(this.getAvailableMetrics(this.mainController.database));
    visitor.setCallbacks(clicked, mouseover, mouseout);
    visitor.setPathFilterFunction(this.viewState.getFilterPathFunction());
    visitor.setMetricFunction(metricFunction);
    visitor.graph = this.model.graph;
    this.applyVisitor(visitor);
  }

  /**
   *
   * @param encoding
   * @param metric
   */
  setEncoding(encoding, metric) {

    if (!this.hasEncodings) {
      return;
    }

    this.encoding = encoding;
    this.metric = metric;
    let preprocessor = undefined;

    let visitor = new cmClearVisitor();
    visitor.setClearDataCells(true);
    this.applyVisitor(visitor);

    let cellWidth = this.colWidth;
    let cellHeight = this.rowHeight;

    let clicked = this.onCellClicked.bind(this);
    let mouseover = this.onCellMouseOver.bind(this);
    let mouseout = this.onCellMouseOut.bind(this);

    if (encoding.name == "colormap") {
      this.setEncodingToColorMap(metric);
    } else if (encoding.name == "raw value") {

      let visitor = new cmRawValueVisitor(cellWidth, cellHeight);
      visitor.setTooltipMetrics(this.getAvailableMetrics(this.mainController.database));

      let metricFunction = this.metric.metricFn;

      visitor.setCallbacks(clicked, mouseover, mouseout);
      visitor.setPathFilterFunction(this.viewState.getFilterPathFunction());
      visitor.setMetricFunction(metricFunction);
      visitor.graph = this.model.graph;

      this.applyVisitor(visitor);

    } else if (encoding.name == 'bar chart') {

      preprocessor = new cmBarChartPreprocessor(metric.metricFn);
      preprocessor.setPathFilterFunction(this.viewState.getFilterPathFunction());
      preprocessor.isList = metric.output == 'list';
      this.applyVisitor(preprocessor);

      visitor = new cmBarChartVisitor(preprocessor, cellWidth, cellHeight, metric.output == 'list');
      visitor.graph = this.model.graph;
      visitor.setTooltipMetrics(this.getAvailableMetrics(this.mainController.database));
      visitor.setPathFilterFunction(this.viewState.getFilterPathFunction());
      visitor.setCallbacks(clicked, mouseover, mouseout);

      this.applyVisitor(visitor);

    }
  }

  /**
   *
   * @param metric
   */
  setEncodingToColorMap(metric) {

    if (this.isNodeListView && !this.isActive) {
      return;
    }

    let preprocessor = new cmColorMapPreprocessor();
    preprocessor.setPathFilterFunction(this.viewState.getFilterPathFunction());
    preprocessor.setMetricFunction(metric.metricFn);

    // TODO - why does preprocessor get a graph?
    preprocessor.graph = this.model.graph;
    this.applyVisitor(preprocessor);

    this.colorScales = [];
    this.colorScalesValues = [];
    this.hasSecondLegend = false;

    this.colorScales[0] = this.mainController.colorScaleService.createColorScale(this.colorScaleIndexSets, preprocessor.setRange);
    this.colorScalesValues[0] = preprocessor.valuesOfSets;
    this.setColorScale(null, this.colorScaleIndexSets, this.colorScales[0]);

    if (this.colorScaleIndexNodes != -1) {
      if (preprocessor.nodeRange[0] <= preprocessor.nodeRange[1] &&
        preprocessor.nodeRange[1] > 0) {
        this.hasSecondLegend = true;
        this.colorScales[1] = this.mainController.colorScaleService.createColorScale(this.colorScaleIndexNodes, preprocessor.nodeRange);

        this.setColorScale(null, this.colorScaleIndexNodes, this.colorScales[1]);
        this.colorScalesValues[1] = preprocessor.valuesOfNodes;
      }
    }
  }

  /**
   *
   */
  setGridPosition(position) {
    this.gridPosition = position;
  }

  /**
   * Function called to completely reset this object's state and create a new matrix in the svg.
   */
  setModel(model) {
    this.model = model;

    // Delete old stuff
    this.clearChildren();

    this.defs = this.svg.append("defs");
    this.defs.append("clipPath")
      .attr("id", "horizontal-attribute-clip")
      .append("rect")
      .attr("transform", "translate(0, -7.5)")
      .attr("width", 70)
      .attr("height", 15);

    this.defs.append("clipPath")
      .attr("id", "vertical-attribute-clip")
      .append("rect")
      .attr("transform", "translate(0, -7.5)")
      .attr("width", 70)
      .attr("height", 15);

    this.svg.attr("transform", "translate(1, 1)");

    // Prepare internal state for creating the svg table
    this.initNodeIndexes(model);
    this.initAttributeState(model);

    this.initAttributeData(model);
    this.initViewIndexes(this.attributes);
    this.initColStates();
    this.initColWidths();

    // Create all rows of the matrix - this binds data to the svg elements.
    this.createRows(model);

    // Data is ready - create encodings
    // this.setEncoding("colormap", "path count");
    this.createAttributeEncodings();

    // Put stuff in the correct place.
    this.updatePositions(this.rowPerm, this.colPerm);
    this.connectToViewState(this.$scope);

    // this must be called after rows are created.
    this.createHighlights();
    this.updateAttributeView();
  }

  /** Used for externally setting sort orders.
   * rowPerm and colPerm get padded to account for headers rows/cols.
   */
  setSortOrders(rowPerm, colPerm) {
    let shiftedRowPerm = Utils.shiftPermutation(rowPerm, this.numHeaderRows);
    let shiftedColPerm = Utils.shiftPermutation(colPerm, this.numHeaderCols);
    this.updatePositions(shiftedRowPerm, shiftedColPerm);
  }

  /**
   * Function called when the user changed the visible attribute rows or cols.
   * @param selection - selection[attribute] is a boolean for whether attribute should be displayed
   * @param isAttributeVisible - state of what attributes are displayed. Needs to be updated.
   * @param updateCol - callback
   */
  updateAttributes(selection, isAttributeVisible, updateCol) {
    let attributes = this.attributes;
    for (var i = 0; i < attributes.length; ++i) {
      let attribute = attributes[i];
      let viewIndex = this.getViewIndexFromAttributeIndex(i);
      updateCol(viewIndex, selection[attribute]);
      isAttributeVisible[attribute] = selection[attribute];
    }
    this.updatePositions(this.rowPerm, this.colPerm);
  }

  /**
   * Update the attributes so that the previous state attributes are displayed. This assumes the model's attributes
   * do not change between queries.
   */
  updateAttributeView() {
    for (var i = 0; i < this.attributes.length; ++i) {
      if (!this.isAttributeColVisible[this.attributes[i]]) {
        this.onToggleAttributeCol(i, false, true, true);
      }
      if (!this.isAttributeRowVisible[this.attributes[i]]) {
        this.onToggleAttributeRow(i, false, true, true);
      }
    }
  }

  /**
   * Toggles visibility of colIndex for all major and minor rows.
   */
  updateCol(colIndex, isColIndexVisible) {
    if (isColIndexVisible) {
      if (this.isAttributeCell(colIndex)) {
        this.colWidths[colIndex] = this.colWidthAttr;
      } else if (this.isDataCell(colIndex)) {
        this.colWidths[colIndex] = this.colWidth;
      } else {
        this.$log.error("Showing a column type not yet handled!");
      }
    } else {
      this.colWidths[colIndex] = 0;
    }

    for (var i = 0; i < this.allRows.length; ++i) {
      let row = this.allRows[i];
      if (row) {
        let cell = this.allRows[i].majorCells[colIndex];
        if (cell) {
          cell.setVisible(isColIndexVisible);
          for (var j = 0; j < this.allRows[i].minorRows.length; ++j) {
            this.allRows[i].minorRows[j].majorCells[colIndex].setVisible(isColIndexVisible);
          }
        }
      }
    }
  }

  updateColAttributes(selection) {
    let updateRow = this.updateRow.bind(this);
    this.updateAttributes(selection, this.isAttributeRowVisible, updateRow);
  }

  /**
   * Toggles visbility of major and minor cols containing nodeIndexes.
   * Requres that we call this.updatePositions to account for gaps in matrix layout due to visibility.
   * There is some symmetry with updateDataRows. They could probably be condensed to the same function.
   */
  updateDataCols() {

    let nodeIndexes = Utils.getFlattenedLists(this.colNodeIndexes);
    // Loop over all indexes who we are showing/hiding.
    for (var i = 0; i < nodeIndexes.length; ++i) {

      // Loop over all major cols
      for (var dataColIndex = 0; dataColIndex < this.colNodeIndexes.length; ++dataColIndex) {

        let minorColIndex = this.colNodeIndexes[dataColIndex].indexOf(nodeIndexes[i]);
        let isNodeInCol = minorColIndex != -1;
        let isOnlyNodeInCol = this.colNodeIndexes[dataColIndex].length == 1 && isNodeInCol;

        let hide = this.viewState.isNodeFiltered(nodeIndexes[i], this.colAttributeNodeGroup);
        let colIndex = this.getViewColIndexFromDataIndex(dataColIndex);

        if (isOnlyNodeInCol) {

          // update visibility of major col
          this.updateCol(colIndex, !hide);

          // if we are showing the major col, we also need to make room for its minor cols
          if (!hide) {
            this.updateMinorCols(colIndex, this.colWidth, this.isMajorColUnrolled[colIndex], this.isMinorColVisible);
          }

        } else if (isNodeInCol) {
          // update visibility of minor col
          this.isMinorColVisible[colIndex][minorColIndex] = !hide;
          this.updateMinorCols(colIndex, this.colWidth, this.isMajorColUnrolled[colIndex], this.isMinorColVisible);
        }
      }
    }
  }

  /**
   * Toggles visbility of major and minor rows containing nodeIndexes.
   * There is some symmetry with updateDataCols. One difference from updateDataCols is that major and minor row
   * row visbility is tracked by the individual rows, as opposed to the matrixView.
   */
  updateDataRows() {
    let rowNodeIndexes = this.rowNodeIndexes;
    let flatRowNodeIndexes = Utils.getFlattenedLists(rowNodeIndexes);

    // Loop over all the node indexes in all rows.
    for (var i = 0; i < flatRowNodeIndexes.length; ++i) {
      let currentNodeIndex = flatRowNodeIndexes[i];

      // Loop over individual rows.
      for (var rowIndex = 0; rowIndex < this.allRows.length; ++rowIndex) {

        // Only looking for data rows - skip others
        if (this.isDataRow(rowIndex)) {

          let dataIndex = this.getDataRowIndex(rowIndex);
          let minorRowIndex = this.rowNodeIndexes[dataIndex].indexOf(currentNodeIndex);
          let isNodeInRow = minorRowIndex != -1;
          let isOnlyNodeInRow = isNodeInRow && rowNodeIndexes[dataIndex].length == 1;
          let hide = this.viewState.isNodeFiltered(currentNodeIndex, this.rowAttributeNodeGroup);

          if (isOnlyNodeInRow) {
            this.updateRow(rowIndex, !hide);
          } else if (isNodeInRow) {
            if (hide) {
              this.allRows[rowIndex].hideMinorRow(minorRowIndex);
            } else {
              this.allRows[rowIndex].showMinorRow(minorRowIndex);
            }
            this.rowHeights[rowIndex] = this.allRows[rowIndex].getCurrentHeight();
          }
        }
      }
    }
  }

  /**
   * Updates the state of all major and minor cols to match current visibility and rolled/unrolled.
   * After calling, this must call updatePositions to correctly account for changes in the view.
   */
  updateMinorCols(colIndex, colWidth, isColIndexUnrolled, isMinorColVisible) {
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].updateMinorCols(colIndex, colWidth, isColIndexUnrolled, isMinorColVisible);
    }

    this.colWidths[colIndex] = this.getColWidth(colIndex, isColIndexUnrolled);
  }

  /** Update positions of rows and columns in the table.
   * Used for reordering and unrolling.
   */
  updatePositions(rowPerm, colPerm) {
    this.rowPerm = rowPerm;
    let yPositions = cmMatrixBase.getRowYPositions(this.rowPerm, this.rowHeights);
    this.rowInv = reorder.inverse_permutation(this.rowPerm);
    this.colPerm = colPerm;
    this.colInv = reorder.inverse_permutation(this.colPerm);
    let xPositions = cmMatrixBase.getColXPositions(this.colPerm, this.colWidths);
    for (var i = 0; i < this.allRows.length; ++i) {
      this.allRows[i].setPosition(0, yPositions[this.rowInv[i]]);
      this.allRows[i].setColPositions(this.colInv, xPositions);
    }
  }

  /**
   * Toggles visibility of this.allRows[rowIndex] and updates this.rowHeights.
   * Should be followed by this.updatePositions.
   */
  updateRow(rowIndex, isRowIndexVisible) {
    let row = this.allRows[rowIndex];
    if (row) {
      let height = 0;
      row.setVisible(isRowIndexVisible);
      if (isRowIndexVisible) {
        if (this.isAttributeRow(rowIndex)) {
          height = row.getCurrentHeight();
          if (!height) {
            height = this.rowHeightAttr;
          }
        } else if (this.isDataRow(rowIndex)) {
          height = row.getCurrentHeight();
          if (!height) {
            height = this.rowHeight;
          }
        }
      }
      this.rowHeights[rowIndex] = height;
    }
  }

  updateRowAttributes(selection) {
    let updateCol = this.updateCol.bind(this);
    this.updateAttributes(selection, this.isAttributeColVisible, updateCol);
  }
}
