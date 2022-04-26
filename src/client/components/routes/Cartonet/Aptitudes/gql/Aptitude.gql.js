import {gql} from "@apollo/client";

export const gqlAptitudeFragment = gql`
  fragment AptitudeFragment on Aptitude {
    id
    isInCV
    isTop5
    skill {
      id
      prefLabel
    }
  }
`;

export const gqlExhautiveAptitudeFragment = gql`
  fragment AptitudeExhaustiveFragment on Aptitude {
    id
    isInCV
    isTop5
    skillLabel
    rating {
      id
      value
    }
    experiencesCount
    skill {
      id
      prefLabel
    }
  }
`;
