import {gql} from "@apollo/client";
import {gqlAptitudeFragment, gqlExhautiveAptitudeFragment} from "./Aptitude.gql";

export const gqlAptitudes = gql`
  query Aptitudes($qs: String, $sortings: [SortingInput], $first: Int, $after: String, $filters: [String]) {
    aptitudesCount(qs: $qs, filters: $filters)
    aptitudes(qs: $qs, sortings: $sortings, first: $first, after: $after, filters: $filters) {
      edges {
        node {
          ...AptitudeFragment
        }
      }
    }
  }

  ${gqlAptitudeFragment}
`;

export const gqlExhautiveAptitudes = gql`
  query ExhautiveAptitudes($qs: String, $sortings: [SortingInput], $first: Int, $after: String, $filters: [String]) {
    aptitudesCount(qs: $qs, filters: $filters)
    aptitudes(qs: $qs, sortings: $sortings, first: $first, after: $after, filters: $filters) {
      edges {
        node {
          ...AptitudeExhaustiveFragment
        }
      }
    }
  }

  ${gqlExhautiveAptitudeFragment}
`;
