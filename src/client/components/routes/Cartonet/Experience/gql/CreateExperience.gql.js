import {gql} from "@apollo/client";

export const gqlCreateExperience = gql`
  mutation CreateExperience($input: CreateExperienceInput!) {
    createExperience(input: $input) {
      createdObject {
        id
      }
    }
  }
`;
