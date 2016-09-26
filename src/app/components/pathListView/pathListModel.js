export class PathListModel {

  /**
   *
   */
  constructor(model, $log) {
    this.model = model;
    this.$log = $log;
    this.paths = [];
    this.rows = [];
  }

  /**
   *
   */
  aggregatePaths() {
    for (let i = 0; i < this.paths.length; ++i) {
      let path = this.paths[i];
      let found = false;

      for (let j = 0; j < this.rows.length; ++j) {
        let row = this.rows[j];
        if (row.matches(path)) {
          row.addPath(path);
          found = true;
          break;
        }
      }

      if (!found) {
        this.rows.push(new PathListRow(path));
      }

    }
  }

  /**
   *
   */
  getCurrentPathListRows() {
    return this.rows;
  }

  setPaths(paths) {
    this.paths = paths;
    this.rows = [];
  }
}

export class PathListRow {

  /**
   *
   */
  constructor(path) {
    this.paths = [path];
  }

  /**
   *
   */
  matches(other) {
    let path = this.paths[0];

    if (other.length != path.length) {
      return false;
    }

    let match = true;
    for (let i = 0; i < path.length; i += 2) {
      match = match && path[i] == other[i];
    }

    return match;
  }

  /**
   *
   */
  addPath(other) {
    this.paths.push(other);
  }
}
