import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";
import * as fs from "fs";
import * as YAML from 'yaml'
import {
  AppSpecStaticSiteEnv,
  AppSpecService,
  AppSpecJob,
} from "@pulumi/digitalocean/types/input";

const stackName = pulumi.getStack();
const appName = `infra-test-${stackName}`;

type ServiceName = "api" | "web";
type JobName = "db-migrate";

type VersionManifest = {
  name: string;
  services: Record<ServiceName, { version: string, instanceCount: number, instanceSizeSlug: string }>;
  jobs: Record<JobName, { version: string, instanceSizeSlug: string }>;
};

type Environment = "production" | "staging" | "development";

const getEnvironment = (): Environment => {
  switch (stackName) {
    case 'production': return 'production';
    case 'staging': return 'staging';
  }
  return 'development';
}

const environment = getEnvironment();

const getDomainName = (): string => {
  switch (environment) {
    case 'production': return 'infra-test.jbrunton-do.com';
    case 'staging': return 'infra-test.staging.jbrunton-do.com';
    case 'development': return `${stackName}.infra-test.dev.jbrunton-do.com`;
  }
};

const domainName = getDomainName();

const readManifest = (): VersionManifest => {
  pulumi.log.info(`Reading manifest for environment: ${environment}`);
  const content = fs.readFileSync(`../config/${environment}.yml`).toString();
  return YAML.parse(content);
};

const manifest = readManifest();

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

const services: AppSpecService[] = [{
  name: "api",
  httpPort: 3001,
  image: {
    registry: "jbrunton",
    registryType: "DOCKER_HUB",
    repository: "infra-test_api",
    tag: manifest.services["api"].version,
  },
  envs: apiEnvs,
  instanceCount: manifest.services["api"].instanceCount,
  instanceSizeSlug: manifest.services["api"].instanceSizeSlug,
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
    tag: manifest.services["web"].version,
  },
  envs: [{
    key: "REACT_APP_API_ADDRESS",
    scope: "RUN_TIME",
    value: "${APP_URL}/api",
  }],
  instanceCount: manifest.services["web"].instanceCount,
  instanceSizeSlug: manifest.services["web"].instanceSizeSlug,
  routes: [{
      path: "/",
  }],
}];

const jobs: AppSpecJob[] = [{
  name: "db-migrate",
  kind: "POST_DEPLOY",
  image: {
    registry: "jbrunton",
    registryType: "DOCKER_HUB",
    repository: "infra-test_api",
    tag: manifest.jobs["db-migrate"].version,
  },
  runCommand: "npx knex migrate:latest",
  envs: apiEnvs,
  instanceCount: 1,
  instanceSizeSlug: manifest.jobs["db-migrate"].instanceSizeSlug,
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
        name: domainName,
        zone: "jbrunton-do.com",
        type: "PRIMARY"
    }],
    services,
    jobs,
  },
});
