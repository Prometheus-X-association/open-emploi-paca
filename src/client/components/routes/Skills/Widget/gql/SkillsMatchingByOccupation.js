import { gql } from "@apollo/client";

export const gqlSkillsMatchingByOccupation = gql`
  query SkillsMatchingByOccupation($personId: ID!, $occupationId: ID!) {
    skillsMatchingByOccupation(
      personId: $personId
      occupationId: $occupationId
    ) {
      id
      prefLabel
      score
    }
  }
`;
