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

export const ip = server.publicIp;

// Create DNS record
const zone = aws.route53.getZone({ name: "jbrunton-aws.com" }, { provider });
const route53record = new aws.route53.Record("www", {
  zoneId: zone.then(zone => zone.zoneId),
  name: zone.then(zone => `${stackName}.infra-test.${zone.name}`),
  type: "A",
  records: [ip],
  ttl: 300,
}, { provider });

export const url = route53record.name;
