export class cmMatrix {

  constructor(jsonMatrix) {
    this.jsonMatrix = jsonMatrix;
    this.jsonMatrix = jsonMatrix;
    this.rows = jsonMatrix.source_ids;
    this.cols = jsonMatrix.target_ids;
    this.matrix = jsonMatrix.matrix;
  }

  getCols() {
    return this.cols;
  }

  getJsonMatrix() {
    return this.jsonMatrix;
  }

  getRows() {
    return this.rows;
  }

}
