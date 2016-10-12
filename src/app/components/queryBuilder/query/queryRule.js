export class QueryRule {

  /**
   * Rule for item.field condition value e.g., item.state = 'CA'
   */
  constructor(field, condition, value) {
    this.field = field;
    this.condition = condition;
    this.value = value;
  }

  toString(cypherVariable) {
    return `(${cypherVariable}.${this.field} ${this.condition} ${this.value})`
  }

}
