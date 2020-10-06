import {gql} from "@apollo/client";

export const gqlOffersAggs = gql`
  query OffersAggs($jobAreaId: ID! $occupationIds: [ID!]!){
    offersAggs(jobAreaId: $jobAreaId occupationIds: $occupationIds)
  }
`;