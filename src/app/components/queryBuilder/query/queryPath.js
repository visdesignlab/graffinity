import {QueryAndGroup} from "./queryGroup"
import {QueryRule} from "./queryRule"

export class QueryPath {
  constructor() {
  }

  /**
   * Returns a group with conditions for sane carriers and flight arrival/departure
   */
  static getCypherFlightRules(numHops) {
    let root = new QueryAndGroup();
    for (let i = 0; i < numHops - 1; ++i) {
      let group = new QueryAndGroup();
      group.setCypherVariable(`e${i}`);

      // flight i has to arrive before flight i+1 departs
      let rule = new QueryRule("arr_time", "<", `e${i + 1}.dep_time`);
      group.addChild(rule);

      // flight i has same carrier as flight i+1
      rule = new QueryRule("carrier", "=", `e${i + 1}.carrier`);
      group.addChild(rule);

      root.addChild(group);
    }
    return root;
  }

  static getCypherSkeletonPrefix(numHops) {
    let cypher = "MATCH p = ";
    for (let i = 0; i < numHops + 1; ++i) {
      cypher += `(n${i})`;
      if (i < numHops) {
        cypher += `-[e${i}]->`;
      }
    }
    return cypher;
  }

  static getCypherSkeletonPostfix() {
    return " RETURN p";
  }

  toString() {
    if (this.root.toString().length) {
      return QueryPath.getCypherSkeletonPrefix(this.numHops) + " WHERE " + this.root.toString() + QueryPath.getCypherSkeletonPostfix();
    } else {
      return QueryPath.getCypherSkeletonPrefix(this.numHops) + QueryPath.getCypherSkeletonPostfix();
    }
  }

}

export class QueryBasicPath extends QueryPath {

  /**
   * @param numHops
   * @param groups = [sourceGroup, targetGroup]
   * @param isFlightPath
   */
  constructor(numHops, groups, isFlightPath) {
    super();

    this.numHops = numHops;
    this.sourceGroup = groups[0];
    this.targetGroup = groups[1];

    this.sourceGroup.setCypherVariable("n0");
    this.targetGroup.setCypherVariable(`n${numHops}`);

    this.root = new QueryAndGroup();
    this.root.addChild(this.sourceGroup);
    this.root.addChild(this.targetGroup);

    if (isFlightPath) {
      this.root.addChild(QueryPath.getCypherFlightRules(numHops));
    }

  }


}

export class QueryAdvancedPath extends QueryPath {
  constructor(groups) {
    super();
    this.edgeGroups = groups.edges;
    this.nodeGroups = groups.nodes;
    this.root = new QueryAndGroup();
    this.numHops = this.edgeGroups.length;
    for (var i = 0; i < this.nodeGroups.length; ++i) {
      this.nodeGroups[i].setCypherVariable(`n${i}`);
      this.root.addChild(this.nodeGroups[i]);
    }

    for (i = 0; i < this.edgeGroups.length; ++i) {
      this.edgeGroups[i].setCypherVariable(`e${i}`);
      this.root.addChild(this.edgeGroups[i]);
    }
  }
}
