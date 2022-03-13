import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as fs from "fs";
import * as YAML from 'yaml'
import {
  AppSpecStaticSiteEnv,
  AppSpecService,
  AppSpecJob,
} from "@pulumi/digitalocean/types/input";

const stackName = pulumi.getStack();
const appName = `infra-test-${stackName}`;
const provider = new aws.Provider("aws", { region: "eu-west-2" });

type ServiceName = "api" | "web";

type ManifestServiceJob = {
  name: string;
  kind: string;
  runCommand: string;
  instanceSizeSlug: string;
};

type ManifestService = {
  version: string;
  instanceCount: number;
  instanceSizeSlug: string;
  jobs?: ManifestServiceJob[];
}

type VersionManifest = {
  name: string;
  services: Record<ServiceName, ManifestService>;
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

// Create a load balancer on port 80 and spin up two instances of Nginx.
const cluster = new awsx.ecs.Cluster("infra-test-dev", {
}, { provider });
const loadBalancer = new awsx.lb.ApplicationLoadBalancer("infra-test-dev", {}, { provider });
const listener = new awsx.lb.ApplicationListener("infra-test-dev", {
  port: 80,
  loadBalancer,
  defaultAction: {
    type: "fixed-response",
    fixedResponse: {
      statusCode: "503",
      contentType: "text/plain",
    }
  }
}, { provider });

const targetGroupWeb = new awsx.lb.ApplicationTargetGroup(`infra-test-dev-web`, {
  port: 80,
  protocol: "HTTP",
  vpc: cluster.vpc,
  loadBalancer
}, { provider });

const targetGroupApi = new awsx.lb.ApplicationTargetGroup(`infra-test-dev-api`, {
  port: 80,
  protocol: "HTTP",
  vpc: cluster.vpc,
  loadBalancer,
  healthCheck: {
    path: "/health"
  }
}, { provider });

listener.addListenerRule("web", {
  actions: [{
    type: "forward",
    targetGroupArn: targetGroupWeb.targetGroup.arn
  }],
  conditions: [
    {
      hostHeader: {
          values: [`app.infra-test.dev.jbrunton-aws.com`],
      },
  },
  ]
}, { provider });

listener.addListenerRule("api", {
  actions: [{
    type: "forward",
    targetGroupArn: targetGroupApi.targetGroup.arn
  }],
  conditions: [
    {
      hostHeader: {
          values: [`api.infra-test.dev.jbrunton-aws.com`],
      },
  },
  ]
}, { provider });

const webLogGroup = new aws.cloudwatch.LogGroup("/ecs/infra-test_web", {
  tags: {
      Stack: stackName,
      Environment: environment,
  },
}, { provider });

const apiLogGroup = new aws.cloudwatch.LogGroup("/ecs/infra-test_api", {
  tags: {
      Stack: stackName,
      Environment: environment,
  },
}, { provider });

const web = webLogGroup.name.apply(logGroupName => new awsx.ecs.FargateService("web", {
  cluster,
  loadBalancers: [{
    containerName: "web",
    containerPort: 80,
    targetGroupArn: targetGroupWeb.targetGroup.arn
  }],
  taskDefinitionArgs: {
    containers: {
      web: {
        image: "jbrunton/infra-test_web",
        memory: 256,
        portMappings: [{
          containerPort: 80,
          hostPort: 80
        }],
        environment: [
          { name: "WEB_PORT", value: "80" },
          { name: "REACT_APP_API_ADDRESS", value: "http://api.infra-test.dev.jbrunton-aws.com" }
        ],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": logGroupName,
            "awslogs-region": "eu-west-2",
            "awslogs-stream-prefix": "ecs"
          }
        }
      },
    },
  },
  desiredCount: 1,
}, { provider }));

const api = apiLogGroup.name.apply(logGroupName => new awsx.ecs.FargateService("api", {
  cluster,
  loadBalancers: [{
    containerName: "api",
    containerPort: 80,
    targetGroupArn: targetGroupApi.targetGroup.arn
  }],
  taskDefinitionArgs: {
    containers: {
      api: {
        image: "jbrunton/infra-test_api",
        memory: 256,
        portMappings: [{
          containerPort: 80,
          hostPort: 80
        }],
        environment: [
          { name: "API_PORT", value: "80" }
        ],
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": logGroupName,
            "awslogs-region": "eu-west-2",
            "awslogs-stream-prefix": "ecs"
          }
        }
      },
    },
  },
  desiredCount: 1,
}, { provider }));



// // Export the load balancer's address so that it's easy to access.
export const url = listener.endpoint.hostname;

const www = new aws.route53.Record("www", {
  zoneId: aws.route53.getZone({ name: "jbrunton-aws.com" }, { provider }).then(zone => zone.id),
  name: "*.infra-test.dev.jbrunton-aws.com",
  type: "A",
  aliases: [{
      name: loadBalancer.loadBalancer.dnsName,
      zoneId: loadBalancer.loadBalancer.zoneId,
      evaluateTargetHealth: true,
  }],
}, { provider });
