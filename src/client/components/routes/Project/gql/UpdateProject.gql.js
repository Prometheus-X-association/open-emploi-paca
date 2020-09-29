import {gql} from "@apollo/client";

export const gqlUpdateProject = gql`
  mutation UpdateProject($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
