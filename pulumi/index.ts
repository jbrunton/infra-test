import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as digitalocean from "@pulumi/digitalocean";
import * as fs from 'fs';

const stackName = pulumi.getStack();

// Create the droplet
const userData = fs.readFileSync("./user_data.yml", 'utf-8');
const sshKey = digitalocean.getSshKey({ name: "macbook-2020-id_ed25519" });
const droplet = new digitalocean.Droplet("droplet", {
  image: "ubuntu-20-04-x64",
  name: `infra-test-${stackName}`,
  region: "lon1",
  size: "s-1vcpu-1gb",
  sshKeys: sshKey.then(sshKey => [sshKey.id.toString()]),
  userData: userData,
});

export const ip = droplet.ipv4Address;

// Create DNS record
const awsProvider = new aws.Provider("aws", { region: "eu-west-1" });
const zone = aws.route53.getZone({ name: "jbrunton-aws.com" }, { provider: awsProvider });
const route53record = new aws.route53.Record("www", {
  zoneId: zone.then(zone => zone.zoneId),
  name: zone.then(zone => `${stackName}.infra-test.${zone.name}`),
  type: "A",
  records: [ip],
  ttl: 300,
}, { provider: awsProvider });

export const url = route53record.name;
