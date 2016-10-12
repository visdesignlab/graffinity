describe('service cypherGenerator', () => {
  beforeEach(angular.mock.module('ngNeo4jQuery'));

  let advanced = {
    "nodes": [
      [
        {
          "attribute": "label",
          "value": "CBb5",
          "text": "CBb5 (label)"
        }
      ],
      [
        {
          "attribute": "label",
          "value": "GAC Aii",
          "text": "GAC Aii (label)"
        }
      ],
      [
        {
          "attribute": "label",
          "value": "Rod BC",
          "text": "Rod BC (label)"
        }
      ]
    ],
    "edges": [
      [
        {
          "attribute": "type",
          "value": "Gap Junction",
          "text": "Gap Junction (type)"
        }
      ],
      [
        {
          "attribute": "type",
          "value": "Gap Junction",
          "text": "Gap Junction (type)"
        }
      ]
    ]
  };

  let basic = {
    "nodes": [
      [
        {
          "attribute": "label",
          "value": "GAC Aii",
          "text": "GAC Aii (label)"
        }
      ],
      [
        {
          "attribute": "label",
          "value": "CBb5",
          "text": "CBb5 (label)"
        }
      ]
    ]
  };

  let basicWildcard = {
    "nodes": [
      [
        {
          "attribute": "label",
          "value": "GAC Aii",
          "text": "GAC Aii (label)"
        }
      ],
      [
        {
          "attribute": "*",
          "text": "* (wildcard)"
        }
      ]
    ]
  };

  let basicFlights = {
    "nodes": [
      [
        {
          "attribute": "airport",
          "value": "LAX",
          "text": "LAX (airport)"
        },
        {
          "attribute": "airport",
          "value": "SFO",
          "text": "SFO (airport)"
        }
      ],
      [
        {
          "attribute": "airport",
          "value": "BOS",
          "text": "BOS (airport)"
        }
      ]
    ]
  };

  it('should be registered', inject(cypherGeneratorService => {
    expect(cypherGeneratorService).not.toEqual(null);
  }));

  it('generateBasicQuery', inject(cypherGeneratorService => {
    let cypher = cypherGeneratorService.generateBasicQuery(basic, 2);
    let query = "MATCH p = (n0)-[e0]->(n1) WHERE ((n0.label = 'GAC Aii') AND (n1.label = 'CBb5')) RETURN p UNION MATCH p = (n0)-[e0]->(n1)-[e1]->(n2) WHERE ((n0.label = 'GAC Aii') AND (n2.label = 'CBb5')) RETURN p";
    expect(cypher == query).toBe(true);
  }));

  it('generateBasicQuery - flights', inject(cypherGeneratorService => {
    let cypher = cypherGeneratorService.generateBasicQuery(basicFlights, 3, true);
    let query = "MATCH p = (n0)-[e0]->(n1) WHERE (((n0.airport = 'LAX') OR (n0.airport = 'SFO')) AND (n1.airport = 'BOS')) RETURN p UNION MATCH p = (n0)-[e0]->(n1)-[e1]->(n2) WHERE (((n0.airport = 'LAX') OR (n0.airport = 'SFO')) AND (n2.airport = 'BOS') AND ((e0.arr_time < e1.dep_time) AND (e0.carrier = e1.carrier))) RETURN p UNION MATCH p = (n0)-[e0]->(n1)-[e1]->(n2)-[e2]->(n3) WHERE (((n0.airport = 'LAX') OR (n0.airport = 'SFO')) AND (n3.airport = 'BOS') AND (((e0.arr_time < e1.dep_time) AND (e0.carrier = e1.carrier)) AND ((e1.arr_time < e2.dep_time) AND (e1.carrier = e2.carrier)))) RETURN p";
    expect(cypher == query).toBe(true);
  }));

  fit('generateBasicQuery - flights', inject(cypherGeneratorService => {
    let cypher = cypherGeneratorService.generateBasicQuery({nodes: [[], []]}, 3, true);
    let query = "MATCH p = (n0)-[e0]->(n1) RETURN p UNION MATCH p = (n0)-[e0]->(n1)-[e1]->(n2) WHERE ((e0.arr_time < e1.dep_time) AND (e0.carrier = e1.carrier)) RETURN p UNION MATCH p = (n0)-[e0]->(n1)-[e1]->(n2)-[e2]->(n3) WHERE (((e0.arr_time < e1.dep_time) AND (e0.carrier = e1.carrier)) AND ((e1.arr_time < e2.dep_time) AND (e1.carrier = e2.carrier))) RETURN p";
    expect(cypher == query).toBe(true);
  }));

  it('generateBasicQuery wildcard', inject(cypherGeneratorService => {
    let cypher = cypherGeneratorService.generateBasicQuery(basicWildcard, 2);
    let query = "MATCH p = (n0)-[e0]->(n1) WHERE (n0.label = 'GAC Aii') RETURN p UNION MATCH p = (n0)-[e0]->(n1)-[e1]->(n2) WHERE (n0.label = 'GAC Aii') RETURN p";
    expect(cypher == query).toBe(true);
  }));

  it('generateAdvancedQuery', inject(cypherGeneratorService => {
    let cypher = cypherGeneratorService.generateAdvancedQuery(advanced);
    let query = "MATCH p = (n0)-[e0]->(n1)-[e1]->(n2) WHERE ((n0.label = 'CBb5') AND (n1.label = 'GAC Aii') AND (n2.label = 'Rod BC') AND (e0.type = 'Gap Junction') AND (e1.type = 'Gap Junction')) RETURN p"
    expect(query == cypher).toBe(true);
  }));

});
