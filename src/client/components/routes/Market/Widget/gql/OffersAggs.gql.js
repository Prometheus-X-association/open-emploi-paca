import {gql} from "@apollo/client";

export const gqlOffersByOccupationAggs = gql`
  query gqlOffersByOccupationAggs($jobAreaId: ID! $occupationIds: [ID!]!){
    offersByOccupationAggs(jobAreaId: $jobAreaId occupationIds: $occupationIds)
  }
`;

export const gqlOffersByJobAreaAggs = gql`
  query OffersAggs($occupationId: ID! $jobAreaIds: [ID!]!){
    offersByJobAreaAggs(occupationId: $occupationId jobAreaIds: $jobAreaIds)
  }
`;