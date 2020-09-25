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

export const gqlMyProfileFragment = gql`
  fragment MyProfileFragment on Person {
    income
    wishedMaxIncome
    wishedMinIncome
    occupation {
      ...OccupationFragment
    }
    jobArea {
      ...JobAreaFragment
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
  
  ${gqlJobAreaFragment}
  ${gqlOccupationFragment}
`;


export const gqlMyProfile = gql`
  query Me {
    me {
      id
      avatar
      firstName
      lastName
      ...MyProfileFragment
    }
  }
  
  ${gqlMyProfileFragment}
`;
