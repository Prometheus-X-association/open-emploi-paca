import { gql } from "@apollo/client";

export const gqlSuggestedOccupationsMatchings = gql`
  query SuggestedOccupationsMatchings($personId: ID!) {
    suggestedOccupationsMatchings(personId: $personId) {
      categoryId
      categoryName
      score
      subOccupations {
        prefLabel
        id
      }
    }
  }
`;
