import gql from "graphql-tag";

export const gqlUpdateProject = gql`
  mutation UpdateProject($input: UpdatePersonInput!) {
    updatePerson(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
