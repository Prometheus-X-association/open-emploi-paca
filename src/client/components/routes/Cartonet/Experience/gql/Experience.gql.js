
import {gql} from "@apollo/client";

export const gqlExperienceFragment = gql`
fragment ExperienceFragment on Experience{
  id
  title
  experienceType
  description
  startDate
  endDate
  organization{
    id
    name
  }
  occupations{
    edges{
      node{
        id 
        prefLabel
      }
    }
  }
  aptitudes{
    edges{
      node{
        id
        skillLabel
      }
    }
  }
}
`;