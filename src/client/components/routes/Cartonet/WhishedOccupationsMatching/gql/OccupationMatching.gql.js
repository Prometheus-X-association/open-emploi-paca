import { gql } from "@apollo/client";

export const gqlOccupationMatching = gql`
  query OccupationMatching($personId: ID!, $occupationId: ID!) {
    occupationMatching(personId: $personId, occupationId: $occupationId) {
      occupationId
      occupationPrefLabel
      score
      subOccupations {
        prefLabel
        id
      }
    }
  }
`;
