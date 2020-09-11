import gql from "graphql-tag";

export const gqlOccupationFragment = gql`
  fragment OccupationFragment on Occupation {
    id
    prefLabel
  }
`;

export const gqlMyProject = gql`
  query Me {
    me {
      id
      wishedMaxIncome
      wishedMinIncome
      occupation {
        id
        prefLabel
      }
      wishedOccupations {
        edges {
          node{
            ...OccupationFragment
          }
        }
      }
    }
  }
  ${gqlOccupationFragment}
`;
