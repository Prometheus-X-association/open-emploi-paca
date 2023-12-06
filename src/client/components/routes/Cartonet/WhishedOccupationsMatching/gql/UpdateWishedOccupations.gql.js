import { gql } from "@apollo/client";

export const gqlUpdateWishedOccupations = gql`
  mutation UpdateWishedOccupations($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
