import gql from "graphql-tag";

export const gqlOccupations = gql`
  query Occupations($qs: String, $first: Int, $filters: [String], $sortings: [SortingInput]) {
    occupations(qs: $qs, first: $first, sortings: $sortings, filters: $filters) {
      edges {
        node {
          id
          prefLabel
        }
      }
    }
  }
`;