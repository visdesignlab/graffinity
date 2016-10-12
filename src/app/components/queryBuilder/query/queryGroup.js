export class QueryGroup {

  constructor() {
    this.children = [];
    this.operand = "";
    this.cypherVariable = "";
  }

  addChild(child) {
    this.children.push(child);
  }

  toString(cypherVariable) {
    if (!cypherVariable) {
      cypherVariable = this.cypherVariable;
    }

    let numChildren = this.children.length;
    let needsParens = false;

    if (numChildren == 0) {

      return "";

    } else if (numChildren == 1) {

      return this.children[0].toString(cypherVariable);

    } else {

      let cypher = "";
      for (let i = 0; i < this.children.length; ++i) {
        let childCypher = this.children[i].toString(cypherVariable);

        if (childCypher.length > 0 && cypher.length > 0) {
          needsParens = true;
          cypher += this.operand;
        }

        cypher += childCypher;
      }

      if (needsParens) {
        cypher = "(" + cypher + ")";
      }

      return cypher;
    }
  }

  /**
   * cypherVariable is used when converting this to a string.
   */
  setCypherVariable(cypherVariable) {
    this.cypherVariable = cypherVariable;
  }

}

export class QueryAndGroup extends QueryGroup {

  constructor() {
    super();
    this.operand = " AND ";
  }

}

export class QueryOrGroup extends QueryGroup {

  constructor() {
    super();
    this.operand = " OR ";
  }

}
