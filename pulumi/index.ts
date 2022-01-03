import * as pulumi from "@pulumi/pulumi";
import * as command from "@pulumi/command";
import * as aws from "@pulumi/aws";
import * as fs from 'fs';

const stackName = pulumi.getStack();
const provider = new aws.Provider("aws", { region: "eu-west-2" });

// Create the server
const group = new aws.ec2.SecurityGroup("server-secgrp", {
  ingress: [
    { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] },
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
  ],
  egress: [
    { protocol: "tcp", fromPort: 0, toPort: 65535, cidrBlocks: ["0.0.0.0/0"] },
  ],
}, { provider });

const ami = aws.ec2.getAmiOutput({
  filters: [{
    name: "name",
    values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64\*"],
  }],
  owners: ["099720109477"], // Canonical Ltd.
  mostRecent: true,
}, { provider });

const userData = fs.readFileSync("./user_data.yml", 'utf-8');
const server = new aws.ec2.Instance("server", {
  instanceType: "t2.micro",
  vpcSecurityGroupIds: [ group.id ],
  keyName: "aws-ec2",
  ami: ami.id,
  userData,
}, { provider });

export const serverIp = server.publicIp;

// Configure loadbalancer rules
const vpc = aws.ec2.getVpcOutput({
  id: "vpc-253a0e4d",
}, { provider });

const targetGroup = new aws.lb.TargetGroup(`infra-test-target-${stackName}`, {
  port: 80,
  protocol: "HTTP",
  vpcId: vpc.id,
}, { provider });

const targetGroupAttachment = new aws.lb.TargetGroupAttachment(`infra-test-target-attachment-${stackName}`, {
  targetGroupArn: targetGroup.arn,
  targetId: server.id,
}, {
  provider,
});

const listenerArn = "arn:aws:elasticloadbalancing:eu-west-2:030461922427:listener/app/infra-test-lb/2e4ed1da651a44e1/cd971153caebdc9b";

new aws.lb.ListenerRule(`infra-test-host-rule-${stackName}`, {
  listenerArn: listenerArn,
  actions: [{
      type: "forward",
      targetGroupArn: targetGroup.arn,
  }],
  conditions: [
      {
          hostHeader: {
              values: [`${stackName}.infra-test.jbrunton-aws.com`],
          },
      },
  ],
}, { provider });
