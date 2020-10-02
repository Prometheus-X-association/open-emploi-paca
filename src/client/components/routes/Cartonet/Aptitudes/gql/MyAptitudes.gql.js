import {gql} from "@apollo/client";
import {gqlAptitudeFragment} from "./Aptitude.gql";

export const gqlMyAptitudesFragment = gql`
  fragment MyAptitudesFragment on Person {
    aptitudesCount
    aptitudes(qs: $qs sortings: $sortings){
      edges{
        node{
          ...AptitudeFragment
        }
      }
    }
  }

  ${gqlAptitudeFragment}
`;

export const gqlMyAptitudes = gql`
  query Me ($qs: String $sortings: [SortingInput]){
    me {
      id
      ...MyAptitudesFragment
    }
  }

  ${gqlMyAptitudesFragment}
`;
