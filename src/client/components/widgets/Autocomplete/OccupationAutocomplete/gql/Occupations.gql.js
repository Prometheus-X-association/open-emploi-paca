import gql from "graphql-tag";
import {gqlOccupationFragment} from "../../../../routes/Profile/gql/MyProfile.gql";

export const gqlOccupations = gql`
  query Occupations($qs: String, $first: Int, $filters: [String], $sortings: [SortingInput]) {
    occupations(qs: $qs, first: $first, sortings: $sortings, filters: $filters) {
      edges {
        node {
          ...OccupationFragment
        }
      }
    }
  }
  
  ${gqlOccupationFragment}
`;
