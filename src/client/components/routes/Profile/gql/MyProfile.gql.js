import gql from "graphql-tag";

export const gqlMyProfile = gql`
  query Me {
    me {
      id
      avatar
      firstName
      lastName
      ... on Person{
        income
        occupation {
          id
          prefLabel
        }
        jobArea {
          id
          title
        }
      }
    }
  }
`;
