import gql from "graphql-tag";

export const gqlConcepts = gql`
  query Concepts($qs: String, $first: Int, $filters: [String], $sortings: [SortingInput]) {
    concepts(qs: $qs, first: $first, sortings: $sortings, filters: $filters) {
      edges {
        node {
          id
          prefLabel
          color
        }
      }
    }
  }
`;

/**
 * Helper to generate GraphQL query parameters
 *
 * @param {string} qs - Query string
 * @param {number} [first] - Results max count
 * @param {string|null} [vocabularyId = "*"] - Filter on vocabulary ID (default to *)
 * @param {boolean} [excludeTopConcepts] - Exclude top concepts
 *
 * @return {{sortings: [], filters: [string], first: number}}
 */
export function getGqlFiltersForQs({qs, first = 10, vocabularyId = "*", excludeTopConcepts} = {}) {
  let filters = [],
    sortings = [];

  if (vocabularyId) {
    filters.push(`hasVocabulary:${vocabularyId || "*"}`);
  }

  if (excludeTopConcepts) {
    filters.push("topInScheme != *");
  }

  if (!qs || qs === "") {
    sortings.push({
      sortBy: "prefLabel"
    });
  }

  return {
    first: 10,
    filters,
    sortings
  };
}
