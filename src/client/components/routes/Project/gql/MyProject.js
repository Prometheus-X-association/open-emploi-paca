import gql from "graphql-tag";

export const gqlOccupationFragment = gql`
  fragment OccupationFragment on Occupation {
    id
    prefLabel
  }
`;

export const gqlJobAreaFragment = gql`
  fragment JobAreaFragment on JobArea {
    id
    title
    asWKT
  }
`;

export const gqlMyProject = gql`
  query Me {
    me {
      id
      ... on Person{
        wishedMaxIncome
        wishedMinIncome
        occupation {
          id
          prefLabel
        }
        jobArea{
          id
          title
          asWKT
        }
        wishedOccupations {
          edges {
            node{
              ...OccupationFragment
            }
          }
        }
        wishedJobAreas {
          edges {
            node{
              ...JobAreaFragment
            }
          }
        }
      }
    }
  }
  ${gqlOccupationFragment}
  ${gqlJobAreaFragment}
`;
