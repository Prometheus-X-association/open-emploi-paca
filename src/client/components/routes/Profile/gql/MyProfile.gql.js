import gql from "graphql-tag";

export const gqlMyProfile = gql`
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
