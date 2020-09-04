import gql from "graphql-tag";

export const gqlUpdateProfile = gql`
  mutation UpdateProfile($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
