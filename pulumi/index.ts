import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import * as fs from "fs";
import * as YAML from 'yaml'
import { AppSpecStaticSiteEnv } from "@pulumi/digitalocean/types/input";

const stackName = pulumi.getStack();
const appName = `infra-test-${stackName}`;

type ServiceName = "api" | "web";
type JobName = "db-migrate";

type VersionManifest = {
  name: string;
  services: Record<ServiceName, { version: string }>;
  jobs: Record<JobName, { version: string }>;
};

const readStagingManifest = (): VersionManifest => {
  const content = fs.readFileSync("../config/app.yml").toString();
  return YAML.parse(content);
};

const stagingManifest = readStagingManifest();

const apiEnvs: AppSpecStaticSiteEnv[] = [{
  key: "POSTGRES_HOST",
  scope: "RUN_TIME",
  value: "${db.HOSTNAME}",
}, {
  key: "POSTGRES_PORT",
  scope: "RUN_TIME",
  value: "${db.PORT}",
}, {
  key: "POSTGRES_USER",
  scope: "RUN_TIME",
  value: "${db.USERNAME}",
}, {
  key: "POSTGRES_PASSWORD",
  scope: "RUN_TIME",
  value: "${db.PASSWORD}",
}, {
  key: "POSTGRES_DB",
  scope: "RUN_TIME",
  value: "${db.DATABASE}",
}, {
  key: "POSTGRES_CA_CERT",
  scope: "RUN_TIME",
  value: "${db.CA_CERT}",
}];

new digitalocean.App(appName, {
  spec: {
    name: appName,
    region: "lon",
    databases: [{
        engine: "PG",
        name: "db",
        production: false,
        version: "12",
    }],
    domainNames: [{
        name: `${stackName}.infra-test.jbrunton-do.com`,
        zone: "jbrunton-do.com",
        type: "PRIMARY"
    }],
    services: [{
      name: "api",
      httpPort: 3001,
      image: {
        registry: "jbrunton",
        registryType: "DOCKER_HUB",
        repository: "infra-test_api",
        tag: stagingManifest.services["api"].version,
      },
      envs: apiEnvs,
      instanceCount: 1,
      instanceSizeSlug: "basic-xxs",
      routes: [{
          path: "/api",
      }],
    }, {
      name: "web",
      httpPort: 3000,
      image: {
        registry: "jbrunton",
        registryType: "DOCKER_HUB",
        repository: "infra-test_web",
        tag: stagingManifest.services["web"].version,
      },
      envs: [{
        key: "REACT_APP_API_ADDRESS",
        scope: "RUN_TIME",
        value: "${APP_URL}/api",
      }],
      instanceCount: 1,
      instanceSizeSlug: "basic-xxs",
      routes: [{
          path: "/",
      }],
    }],
    jobs: [{
      name: "db-migrate",
      kind: "POST_DEPLOY",
      image: {
        registry: "jbrunton",
        registryType: "DOCKER_HUB",
        repository: "infra-test_api",
        tag: stagingManifest.jobs["db-migrate"].version,
      },
      runCommand: "npx knex migrate:latest",
      envs: apiEnvs,
      instanceCount: 1,
      instanceSizeSlug: "basic-xxs",
    }]
  },
});
