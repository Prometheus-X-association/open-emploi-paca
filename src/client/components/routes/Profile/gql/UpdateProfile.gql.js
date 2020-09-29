import {gql} from "@apollo/client";

export const gqlUpdateProfile = gql`
  mutation UpdateProfile($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
