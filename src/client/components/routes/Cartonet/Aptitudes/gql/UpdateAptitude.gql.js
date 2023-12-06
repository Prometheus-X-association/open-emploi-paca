import { gql } from "@apollo/client";

export const gqlUpdateAptitude = gql`
  mutation UpdateAptitude($input: UpdateAptitudeInput!) {
    updateAptitude(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
