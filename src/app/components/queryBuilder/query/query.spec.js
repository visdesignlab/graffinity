import {QueryRule} from "./queryRule"
import {QueryAndGroup} from "./queryGroup"
import {QueryOrGroup} from "./queryGroup"

describe('tests for query groups and rules', () => {
  beforeEach(angular.mock.module('ngNeo4jQuery'));

  it("rule", () => {
    let rule = new QueryRule("state", "=", "'MN'");
    expect(rule.toString("n0") == "(n0.state = 'MN')").toBe(true);
  });

  it("group", () => {
    let group = new QueryOrGroup();
    group.addChild(new QueryRule("state", "=", "'MN'"));
    expect(group.toString("n0") == "(n0.state = 'MN')").toBe(true);

    group.addChild(new QueryRule("state", "=", "'CA'"));
    expect(group.toString("n0") == "((n0.state = 'MN') OR (n0.state = 'CA'))").toBe(true);

  });

  it("nested group: MN or CA without LAX", () => {
    // allow either mn or ca
    let states = new QueryOrGroup();
    states.addChild(new QueryRule("state", "=", "'MN'"));
    states.addChild(new QueryRule("state", "=", "'CA'"));

    // not lax
    let airport = new QueryAndGroup();
    airport.addChild(new QueryRule("airport", "!=", "'LAX'"));

    let root = new QueryAndGroup();
    root.addChild(states);
    root.addChild(airport);
    expect(root.toString('n0') == "(((n0.state = 'MN') OR (n0.state = 'CA')) AND (n0.airport != 'LAX'))").toBe(true);
  });

});



