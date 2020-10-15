import {gql} from "@apollo/client";

export const gqlOffersByOccupationAggs = gql`
  query OffersByOccupationAggs($jobAreaId: ID! $occupationIds: [ID!]!){
    offersByOccupationAggs(jobAreaId: $jobAreaId occupationIds: $occupationIds)
  }
`;

export const gqlOffersByJobAreaAggs = gql`
  query OffersByJobAreasAggs($occupationId: ID! $jobAreaIds: [ID!]!){
    offersByJobAreaAggs(occupationId: $occupationId jobAreaIds: $jobAreaIds)
  }
`;

export const gqlOffersTopOrganizationsAggs = gql`
  query OffersTopOrganizationsAggs($occupationId: ID! $jobAreaId: ID!){
    offersTopOrganizationsAggs(occupationId: $occupationId jobAreaId: $jobAreaId)
  }
`;