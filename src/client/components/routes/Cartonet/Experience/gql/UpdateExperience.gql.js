import {gql} from "@apollo/client";

export const gqlUpdateExperience = gql`
  mutation UpdateExperience($input: UpdateExperienceInput!) {
    updateExperience(input: $input) {
      updatedObject {
        id
      }
    }
  }
`;
