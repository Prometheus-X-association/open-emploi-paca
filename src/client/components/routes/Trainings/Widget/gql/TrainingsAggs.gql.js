import {gql} from "@apollo/client";

export const gqlTrainingsByOccupationAggs = gql`
  query TrainingsByOccupationAggs($jobAreaId: ID! $occupationIds: [ID!]!){
    trainingsByOccupationAggs(jobAreaId: $jobAreaId occupationIds: $occupationIds)
  }
`;

export const gqlTrainingsByJobAreaAggs = gql`
  query TrainingsByJobAreasAggs($occupationId: ID! $jobAreaIds: [ID!]!){
    trainingsByJobAreaAggs(occupationId: $occupationId jobAreaIds: $jobAreaIds)
  }
`;

export const gqlTrainingsTopOrganizationsAggs = gql`
  query TrainingsTopOrganizationsAggs($occupationId: ID! $jobAreaId: ID!){
    trainingsTopOrganizationsAggs(occupationId: $occupationId jobAreaId: $jobAreaId)
  }
`;