import {QueryOrGroup} from "./query/queryGroup"
import {QueryRule} from "./query/queryRule"
import {QueryBasicPath} from "./query/queryPath"
import {QueryAdvancedPath} from "./query/queryPath"

export class CypherGeneratorService {
  constructor($log) {
    'ngInject';
    this.$log = $log;
  }

  /**
   * Converts list of tags into tree of query groups/rules.
   * @returns {QueryOrGroup}
   */
  getGroupFromTags(tags) {
    if (CypherGeneratorService.tagsContainWildcard(tags)) {
      return new QueryOrGroup();
    }

    let group = new QueryOrGroup();
    for (let i = 0; i < tags.length; ++i) {
      let tag = tags[i];
      group.addChild(new QueryRule(tag.attribute, "=", `'${tag.value}'`));
    }

    return group;

  }

  /**
   * Converts input of node/edge tags into tree for cypher generation.
   * @param input = { nodes: [[tags for n0], [tags for n1], ...], edge: [[tags for e0], ... ]
   */
  generateAdvancedQuery(input) {
    let nodeTags = input.nodes;
    let edgeTags = input.edges;

    let groups = {
      nodes: [],
      edges: []
    };

    for (let i = 0; i < nodeTags.length; ++i) {
      let tags = nodeTags[i];
      let group = this.getGroupFromTags(tags);
      groups.nodes.push(group);
    }

    for (let i = 0; i < edgeTags.length; ++i) {
      let tags = edgeTags[i];
      let group = this.getGroupFromTags(tags);
      groups.edges.push(group);
    }

    let path = new QueryAdvancedPath(groups);
    return path.toString();
  }

  /**
   * @param maxNumHops -
   * @param input - [[source tags], [target tags]]
   * @param isFlightQuery - flag to add restrictions on edges
   * @returns string
   */
  generateBasicQuery(input, maxNumHops, isFlightQuery) {

    let sourceGroup = this.getGroupFromTags(input.nodes[0]);
    let targetGroup = this.getGroupFromTags(input.nodes[1]);


    let cypher = "";
    for (let i = 1; i <= maxNumHops; ++i) {
      if (i > 1) {
        cypher += " UNION ";
      }

      let path = new QueryBasicPath(i, [sourceGroup, targetGroup], isFlightQuery);
      cypher += path.toString();
    }

    return cypher;
  }

  /**
   * Returns true if tags contain wild card or if tags are undefined.
   */
  static tagsContainWildcard(tags) {
    if (tags) {
      for (let i = 0; i < tags.length; ++i) {
        if (!tags[i].value) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  }

}
