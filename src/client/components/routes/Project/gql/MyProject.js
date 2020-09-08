import gql from "graphql-tag";

export const gqlMyProject = gql`
  query Me {
    me {
      id
      wishedMaxIncome
      wishedMinIncome
      occupation {
        prefLabel
      }
      wishedOccupations {
        edges {
          node {
            id
            prefLabel
          }
        }
      }
    }
  }
`;
