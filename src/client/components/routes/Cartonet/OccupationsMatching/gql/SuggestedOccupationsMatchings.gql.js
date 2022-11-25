import { gql } from "@apollo/client";

export const gqlSuggestedOccupationsMatchings = gql`
  query SuggestedOccupationsMatchings($personId: ID!) {
    suggestedOccupationMatchingsForPerson(personId: $personId) {
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
