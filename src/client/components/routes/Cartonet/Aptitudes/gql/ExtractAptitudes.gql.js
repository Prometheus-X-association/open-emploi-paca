import {gql} from "@apollo/client";
import {gqlAptitudeFragment, gqlSkillFragment} from "./Aptitude.gql";

export const gqlMyAptitudesFragment = gql`
  fragment MyAptitudesFragment on Person {
    aptitudesCount
    aptitudes(qs: $qs, sortings: $sortings) {
      edges {
        node {
          ...AptitudeFragment
        }
      }
    }
  }

  ${gqlAptitudeFragment}
`;

export const gqlExtractAptitudesFromCV = gql`
  query ExtractAptitudesFromCV ($personId: ID!, $file: Upload, $qs: String, $first: Int $after: String $sortings: [SortingInput]){
    skills: extractSkillsFromFile(personId: $personId file: $file first: $first after: $after qs:$qs sortings: $sortings){
      edges{
        node{
          ...SkillFragment
        }
      }
    }
  }

  ${gqlSkillFragment}
`;


export const gqlMyAptitudes = gql`
  query Me {
    me {
      id
      aptitudes(first: 300) {
        edges {
          node {
            skillLabel
            ratingValue
          }
        }
      }
    }
  }
`;
