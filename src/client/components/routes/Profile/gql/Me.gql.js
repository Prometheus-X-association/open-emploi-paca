import gql from "graphql-tag";

export const gqlMe = gql`
  query Me {
    me {
      id
      avatar
      firstName
      lastName
      income
      occupation {
        id
        prefLabel
      }
    }
  }
`;
