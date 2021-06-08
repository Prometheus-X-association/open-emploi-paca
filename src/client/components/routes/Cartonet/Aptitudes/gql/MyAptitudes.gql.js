import {gql} from "@apollo/client";
import {gqlAptitudeFragment} from "./Aptitude.gql";

export const gqlMyAptitudes = gql`
  query Me($qs: String, $sortings: [SortingInput], $first: Int, $after: String, $filters: [String]) {
    me {
      id
      aptitudesCount(qs: $qs, filters: $filters)
      aptitudes(qs: $qs, sortings: $sortings, first: $first, after: $after, filters: $filters) {
        edges {
          node {
            ...AptitudeFragment
          }
        }
      }
    }
  }

  ${gqlAptitudeFragment}
`;
