import {gql} from "@apollo/client";

export const gqlIncomesByOccupationAggs = gql`
  query IncomesByOccupationAggs($jobAreaId: ID! $occupationIds: [ID!]!){
    incomesByOccupationAggs(jobAreaId: $jobAreaId occupationIds: $occupationIds)
  }
`;

export const gqlIncomesByJobAreaAggs = gql`
  query IncomesByJobAreasAggs($occupationId: ID! $jobAreaIds: [ID!]!){
    incomesByJobAreaAggs(occupationId: $occupationId jobAreaIds: $jobAreaIds)
  }
`;