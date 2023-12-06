import { gql } from "@apollo/client";
import { gqlOccupationFragment } from "../../../Profile/gql/MyProfile.gql";

export const gqlWishedOccupationsFragment = gql`
  fragment WishedOccupationsFragment on Person {
    wishedOccupations {
      edges {
        node {
          ...OccupationFragment
        }
      }
    }
  }

  ${gqlOccupationFragment}
`;

export const gqlWishedOccupations = gql`
  query WishedOccupations {
    me {
      id
      ...WishedOccupationsFragment
    }
  }

  ${gqlWishedOccupationsFragment}
`;
