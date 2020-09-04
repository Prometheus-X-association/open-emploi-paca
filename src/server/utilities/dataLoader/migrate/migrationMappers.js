import dayjs from "dayjs";
import {logWarning, MnxOntologies} from "@mnemotix/synaptix.js";

export let migrationMappers = {
  UserAccount: {
    mapping: {
      name: {
        transformName: "label"
      }
    }
  },
  Phone: {
    mapping: {
      name: {
        transformName: "label"
      }
    }
  },
  EmailAccount: {},
  Locality: {
    type: "Address",
    mapping: {
      name: {
        transformName: "label"
      },
      postCode: {
        transformName: "postalCode"
      },
      countryName: {
        transformName: "country",
        tranformToLabel: "fr"
      }
    }
  },
  ExternalLink: {
    mapping: {
      name: {
        transformName: "label"
      }
    }
  },
  Person: {
    generateLegacyURL: id =>
      `https://prod-resource-weever.mnemotix.com/actors/person/${Buffer.from(
        `Person:${id}`
      ).toString("base64")}`,
    mapping: {
      birthday: {
        transformValue: data => transformTimestampToDate(parseInt(data), true)
      },
      bday: {
        transformName: "birthday",
        transformValue: data => transformTimestampToDate(data, true)
      },
      avatar: {
        transformValue: path => transformOwncloudPath(path)
      }
    },
    links: {
      HAS_EMAIL: {
        linkName: "hasEmailAccount"
      },
      HAS_PHONE: {
        linkName: "hasPhone"
      },
      HAS_ADDRESS: {
        linkName: "hasAddress"
      },
      HAS_LINK: {
        linkName: "hasExternalLink"
      },
      HAS_ACCOUNT: {
        linkName: "hasUserAccount"
      }
    }
  },
  Org: {
    type: "Organization",
    generateLegacyURL: id =>
      `https://prod-resource-weever.mnemotix.com/actors/organisation/${Buffer.from(
        `Organisation:${id}`
      ).toString("base64")}`,
    mapping: {
      avatar: {
        transformValue: path => transformOwncloudPath(path)
      }
    },
    links: {
      HAS_EMAIL: {
        linkName: "hasEmailAccount"
      },
      HAS_PHONE: {
        linkName: "hasPhone"
      },
      HAS_ADDRESS: {
        linkName: "hasAddress"
      },
      HAS_LINK: {
        linkName: "hasExternalLink"
      }
    }
  },
  Affiliation: {
    startDate: {
      transformValue: data => transformTimestampToDate(data)
    },
    endDate: {
      transformValue: data => transformTimestampToDate(data)
    },
    links: {
      AFFILIATE: {
        linkName: "hasPerson"
      },
      ORGANIZATION: {
        linkName: "hasOrg"
      }
    }
  },
  Project: {
    generateLegacyURL: id =>
      `https://prod-resource-weever.mnemotix.com/projects/${Buffer.from(
        `Project:${id}`
      ).toString("base64")}`,
    mapping: {
      image: {
        transformValue: path => transformOwncloudPath(path)
      }
    },
    links: {
      GROUP: {
        linkName: "hasTeam"
      },
      PARENT_PROJECT: {
        linkName: "hasParentProject",
        isInV: true
      },
      AUTHOR: {
        linkName: "hasInvolvement",
        generateInput: ({
          sourceId,
          targetId,
          dseIdToURI,
          synaptixSession
        }) => {
          let agentUri = dseIdToURI({
            id: targetId,
            modelDefinition: targetId.match("Person")
              ? MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition
              : MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition,
            synaptixSession
          });
          // This is to avoid duplication of involvements
          let salt = sourceId.replace(/.*\/(.*)/, "$1");
          let involvementUri = dseIdToURI({
            id: `${targetId}${salt}`,
            modelDefinition:
            MnxOntologies.mnxProject.ModelDefinitions.InvolvementDefinition,
            synaptixSession
          });

          return {
            id: involvementUri,
            role: "Artiste",
            agentInput: {
              inheritedTypename: targetId.match("Person")
                ? "Person"
                : "Organization",
              id: agentUri
            }
          };
        }
      },
      HAS_LINK: {
        linkName: "hasExternalLink"
      }
    }
  },
  Event: {
    type: "ProjectContribution",
    mapping: {
      startDate: {
        transformValue: data => transformTimestampToDate(data)
      },
      endDate: {
        transformValue: data => transformTimestampToDate(data)
      }
    },
    links: {
      HAS_MEMO: {
        linkName: "hasReply"
      },
      AUTHOR: {
        linkName: "hasAuthor"
      },
      OCCURS_IN: {
        linkName: "hasProject"
      }
    }
  },
  Memo: {
    type: "ProjectContribution",
    mapping: {
      startDate: {
        transformValue: data => transformTimestampToDate(data)
      },
      endDate: {
        transformValue: data => transformTimestampToDate(data)
      },
      content: {
        transformName: "description",
        transformValue: content => {
          let mutatedContent = (content || "")
            .replace(/<p><\/p>/g, "")
            .replace(/\n/g, "")
            .replace(/&nbsp;/g, "")
            .trim();

          let mentions = [
            ...mutatedContent.matchAll(
              /<span data-id="(?<id>[^"]*)" data-type="(?<type>[^"]*)">(?<content>[^<]*)<\/span>/g
            )
          ];

          for (let mention of mentions) {
            if (mention.groups.id) {
              let globalId = Buffer.from(mention.groups.id, "base64").toString(
                "utf-8"
              );
              let type = globalId.slice(0, globalId.indexOf(":"));
              let id = globalId.slice(globalId.indexOf(":") + 1);
              let mentionType;
              let modelDefinition;

              switch (type) {
                case "Involvement":
                  mentionType = "Agent";
                  modelDefinition = id.match("Person")
                    ? MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition
                    : MnxOntologies.mnxAgent.ModelDefinitions
                      .OrganizationDefinition;
                  break;
                case "Tagging":
                  mentionType = "Tagging";
                  modelDefinition =
                    MnxOntologies.mnxContribution.ModelDefinitions
                      .TaggingDefinition;
                  break;
              }

              if (mention.groups.type === "LINK") {
                if (!!mention.groups.content.match(/http?s:\/\//)) {
                  mutatedContent = mutatedContent.replace(
                    new RegExp(
                      `<span data-id="${mention.groups.id}" data-type="${mention.groups.type}">[^<]*</span>`
                    ),
                    `<a href="${mention.groups.content}" target="_blank">${mention.groups.content}</a>`
                  );
                } else {
                  mutatedContent = mention.groups.content;
                }
              } else if (modelDefinition) {
                mutatedContent = mutatedContent.replace(
                  new RegExp(
                    `<span data-id="${mention.groups.id}" data-type="${mention.groups.type}">[^<]*</span>`
                  ),
                  `<mention data-mention-type="${mentionType}" data-id="${id}" data-typename="${modelDefinition.getGraphQLType()}">${
                    mention.groups.content
                  }</mention>`
                );
              }
            }
          }

          return mutatedContent;
        }
      }
    },
    links: {
      HAS_MEMO: {
        linkName: "isReplyOf"
      }
    },
    migrateIf: ({objectInput, objectLinksInput}) => {
      let content = (objectInput.description || "")
        .replace("<p></p>", "")
        .replace("\n", "")
        .trim();

      return !(!content || content === "");
    }
  },
  Resource: {
    type: "File",
    generateLegacyURL: id =>
      `https://prod-resource-weever.mnemotix.com/resources/list/${Buffer.from(
        `Resource:${id}`
      ).toString("base64")}`,
    mapping: {
      credits: {
        tranformToLabel: "fr"
      },
      name: {
        transformName: "filename"
      },
      path: {
        transformName: "filepath"
      },
      publicUrl: {
        transformValue: data => {
          return data.replace(
            /.*\/(s\/\w+\/download)/,
            `https://prod-resource-cloud.mnemotix.com/$1`
          );
        }
      }
    },
    links: {
      HAS_LINK: {
        linkName: "hasExternalLink"
      }
    }
  },
  Involvement: {
    mapping: {
      startDate: {
        transformValue: data => transformTimestampToDate(data)
      },
      endDate: {
        transformValue: data => transformTimestampToDate(data)
      }
    },
    links: {
      AGENT: {
        linkName: "hasAgent",
        forceTargetModelDefinition: ({targetId}) => {
          return targetId.match("Person")
            ? MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition
            : MnxOntologies.mnxAgent.ModelDefinitions.OrganizationDefinition;
        }
      },
      PROJECT: {
        linkName: "hasProject"
      },
      EVENT: {
        linkName: "hasProjectContribution"
      }
    }
  },
  Attachment: {
    links: {
      ATTACHED_TO: {
        linkName: "hasProjectContribution"
      },
      RESOURCE: {
        linkName: "hasResource",
        forceTargetModelDefinition: ({targetId}) => {
          return MnxOntologies.mnxProject.ModelDefinitions.FileDefinition;
        }
      }
    }
  },
  Concept: {
    links: {
      BROADER: {
        linkName: "hasBroader",
        isInV: true
      },
      RELATED: {
        linkName: "hasRelated",
        isInV: true
      },
      MEMBER_OF: {
        linkName: "hasCollection"
      },
      CONCEPT_OF: {
        linkName: "hasVocabulary"
      },
      IN_SCHEME: {
        linkName: "inScheme"
      }
    }
  },
  Scheme: {
    links: {
      SCHEME_OF: {
        linkName: "hasVocabulary"
      },
      HAS_TOP_CONCEPT: {
        linkName: "hasTopConcept"
      }
    }
  },
  Collection: {
    links: {
      COLLECTION_OF: {
        linkName: "hasVocabulary"
      }
    }
  },
  Vocabulary: {},
  Tagging: {
    links: {
      TAGGING_SUBJECT: {
        linkName: "hasConcept",
        mustExist: true
      },
      TAGGING_OBJECT: {
        linkName: "hasEntity",
        mustExist: true,
        forceTargetModelDefinition: ({targetId}) => {
          if (targetId.match("Person")) {
            return MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition;
          }

          if (targetId.match("Org")) {
            return MnxOntologies.mnxAgent.ModelDefinitions
              .OrganizationDefinition;
          }

          if (targetId.match("Event")) {
            return MnxOntologies.mnxProject.ModelDefinitions
              .ProjectContributionDefinition;
          }

          if (targetId.match("Resource")) {
            return MnxOntologies.mnxProject.ModelDefinitions.FileDefinition;
          }

          if (targetId.match("Locality")) {
            return MnxOntologies.mnxAgent.ModelDefinitions.AddressDefinition;
          }

          if (targetId.match("Group")) {
            return MnxOntologies.mnxAgent.ModelDefinitions.GroupDefinition;
          }

          if (targetId.match("Project")) {
            return MnxOntologies.mnxProject.ModelDefinitions.ProjectDefinition;
          }

          logWarning(`Unable to match model definition of ${targetId}`);

          return MnxOntologies.mnxProject.ModelDefinitions.ProjectDefinition;
        }
      }
    }
  },
  Group: {
    type: "UserGroup",
    mapping: {
      name: {
        transformName: "label"
      }
    },
    links: {
      GROUP: {
        linkName: "hasUserAccount",
        extraDseSubgraph: `outE("MEMBER").where(inV().has("_enabled", true)).subgraph('sg').otherV()
  .outE("HAS_ACCOUNT").where(inV().has("_enabled", true)).subgraph('sg').otherV()`,
        filterOnEdgeLabel: "HAS_ACCOUNT"
      }
    },
    migrateIf: ({objectInput, objectLinksInput}) => {
      return !!objectInput.label;
    },
    generateURI: ({vertexId, modelDefinition, synaptixSession, dseIdToURI}) => {
      switch (vertexId) {
        case "Group:583947904:545":
          return "https://data.lafayetteanticipations.com/resource/user-group/AdministratorGroup";
        case "Group:1397000832:1026":
          return "https://data.lafayetteanticipations.com/resource/user-group/EditorGroup";
        case "Group:2053047168:1054":
          return "https://data.lafayetteanticipations.com/resource/user-group/ContributorGroup";
        default:
          return dseIdToURI({id: vertexId, modelDefinition, synaptixSession});
      }
    },
  },
  AccessPolicy: {
    generateURI: ({vertexId, modelDefinition, synaptixSession, dseIdToURI}) => {
      switch (vertexId) {
        case "AccessPolicy:183731200:978":
          return "https://data.lafayetteanticipations.com/resource/access-policy/PublicPolicy";
        case "AccessPolicy:183731200:979":
          return "https://data.lafayetteanticipations.com/resource/access-policy/PrivatePolicy";
        default:
          return dseIdToURI({id: vertexId, modelDefinition, synaptixSession});
      }
    },
    links: {
      PRIVACY: {
        linkName: "hasEntity",
        forceTargetModelDefinition: ({targetId}) => {
          if (targetId.match("Person")) {
            return MnxOntologies.mnxAgent.ModelDefinitions.PersonDefinition;
          }

          if (targetId.match("Org")) {
            return MnxOntologies.mnxAgent.ModelDefinitions
              .OrganizationDefinition;
          }

          if (targetId.match("Event")) {
            return MnxOntologies.mnxProject.ModelDefinitions
              .ProjectContributionDefinition;
          }

          if (targetId.match("Memo")) {
            return MnxOntologies.mnxProject.ModelDefinitions
              .ProjectContributionDefinition;
          }

          if (targetId.match("Resource")) {
            return MnxOntologies.mnxProject.ModelDefinitions.FileDefinition;
          }

          if (targetId.match("Project")) {
            return MnxOntologies.mnxProject.ModelDefinitions.ProjectDefinition;
          }

          logWarning(`Unable to match model definition of ${targetId}`);

          return MnxOntologies.mnxProject.ModelDefinitions.ProjectDefinition;
        }
      }
    }
  }
};

export let transformTimestampToDate = (timestamp, resetHour) => {
  let djs = dayjs(timestamp);
  return djs.toISOString();
};

export let transformOwncloudPath = path => {
  return path.replace(
    /https?:\/\/[^\/]*\/s\/(\w+)\/download/,
    "https://prod-resource-cloud.mnemotix.com/s/$1/download"
  );
};
