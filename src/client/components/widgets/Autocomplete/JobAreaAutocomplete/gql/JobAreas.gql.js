import gql from "graphql-tag";

export const gqlJobAreas = gql`
  query JobAreas($qs: String, $first: Int, $filters: [String], $sortings: [SortingInput]) {
    jobAreas(qs: $qs, first: $first, sortings: $sortings, filters: $filters) {
      edges {
        node {
          id
          title
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
 *
 * @return {{sortings: [], filters: [string], first: number}}
 */
export function getGqlFiltersForQs({qs, first = 10} = {}) {
  let filters = [],
    sortings = [];

  if (!qs || qs === "") {
    sortings.push({
      sortBy: "title"
    });
  }

  return {
    first: 10,
    filters,
    sortings
  };
}
