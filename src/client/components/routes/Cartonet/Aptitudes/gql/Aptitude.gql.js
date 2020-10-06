import {gql} from "@apollo/client";

export const gqlAptitudeFragment = gql`
fragment AptitudeFragment on Aptitude{
  id
  isTop5
  skillLabel
  rating{
    id
    value
  }
  experiencesCount
}
`;