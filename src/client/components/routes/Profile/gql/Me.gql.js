import gql from "graphql-tag";

export const gqlMe = gql`
  query Me {
    me {
      id
      avatar
      firstName
      lastName
      income
      occupations(first: 1, sortBy: "startDate") {
        edges {
          node {
            prefLabel
          }
        }
      }
    }
  }
`;
