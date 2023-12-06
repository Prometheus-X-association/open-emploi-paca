import http from 'k6/http';
import { sleep, check } from 'k6';
import exec from 'k6/execution';

// TODO : Set jwt token here before launching tests
const jwt = __ENV.JWT;

if(!jwt){
  throw new Error("You must define a JWT env variable to start that test.");
}

/**
 * Launch a stress test.
 *
 * Use: k6 run --vus 50 --duration 60s loadTest.js
 * To simulate 50 active users requesting their synthesis, while randomly one of them mutate the graph.
 *
 */
export default function () {
  const opts = {
    headers: {
      'Content-Type': 'application/json',
    },
  }

  const getSynthesisGqlPayload = {
    query: "{       me { firstName        experiencesCount(filters: [\"experienceType:experience\"])         experiences(filters: [\"experienceT ││ ype:experience\"]) {           edges {             node {               title               startDate               endDate             }           }         }         aptitudesCount         aptitudesToRateCount: aptitudesCount(filters:[\"ratingValue:0\"])         selectedAptitudes: aptitudes(first: 5, filters: [\"isTop5:true\"]) {           edges {             node {               skillLabel               ratingValue             }           }         }         top5Aptitudes: aptitudes(first: 5, sortings: [{sortBy: \"ratingValue\", isSortDescending: true}]) {           edges {             node {               skillLabel               ratingValue             }           }           }       }       jobSuggestion: occupationsMatching(me: true)     } ",
    variables: {}
  };

  const updateProfileGqlPayload = {
    query: "mutation {  updateMe(input: {firstName: \"Olivier\"}){success}}",
    variables: {}
  };


  if(exec.vu.idInInstance === 2){
    const res =  http.post(`https://preprod.aksis.dashemploi.eu/graphql?jwt=${jwt}`, JSON.stringify(updateProfileGqlPayload), Object.assign({tags: {name:  "Command" }}, opts));
    check(res, {
      'is Command OK': (r) => {
        return r.status === 200 && JSON.parse(r.body).data.updateMe.success === true;
      },
    });
  } else {
    const res = http.post(`https://preprod.aksis.dashemploi.eu/graphql?jwt=${jwt}`, JSON.stringify(getSynthesisGqlPayload), Object.assign({tags: {name:  "Query" }}, opts));
    check(res, {
      'is Query OK': (r) => {
        return r.status === 200 && JSON.parse(r.body).data.me.firstName === "Olivier"
      },
    });
  }

  sleep(1);
}