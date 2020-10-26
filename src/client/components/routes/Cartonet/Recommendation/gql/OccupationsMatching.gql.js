import {gql} from "@apollo/client";

export const gqlOccupationsMatching = gql`
  query OccupationsMatching($personId: ID! $occupationIds: [ID!]) {
    occupationsMatching(personId: $personId occupationIds: $occupationIds)
  }
`;
