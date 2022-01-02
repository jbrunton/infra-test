import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as digitalocean from "@pulumi/digitalocean";

const userData =
`#cloud-config
runcmd:
  # install docker-compose: https://docs.docker.com/compose/install/
  - sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  - sudo chmod +x /usr/local/bin/docker-compose
  # install Carvel. TODO: pin versions.
  - wget -O- https://carvel.dev/install.sh | bash

apt:
  sources:
    docker.list:
      source: deb [arch=amd64] https://download.docker.com/linux/ubuntu $RELEASE stable
      keyid: 9DC858229FC7DD38854AE2D88D81803C0EBFCD88

packages:
  - docker-ce
  - docker-ce-cli
  # increase system entropy per https://github.com/docker/compose/issues/6678
  - haveged
`

const awsProvider = new aws.Provider("aws", { region: "eu-west-1" });

const stackName = pulumi.getStack();

const sshKey = digitalocean.getSshKey({ name: "macbook-2020-id_ed25519" });

const droplet = new digitalocean.Droplet("test-droplet", {
  image: "ubuntu-20-04-x64",
  name: `test-droplet-${stackName}`,
  region: "lon1",
  size: "s-1vcpu-1gb",
  sshKeys: sshKey.then(sshKey => [sshKey.id.toString()]),
  userData: userData,
});

// Export the name of the bucket
export const ip = droplet.ipv4Address;

const zone = aws.route53.getZone({ name: "jbrunton-aws.com" }, { provider: awsProvider });

const route53record = new aws.route53.Record("www", {
  zoneId: zone.then(zone => zone.zoneId),
  name: zone.then(zone => `test-droplet-${stackName}.infra-test.${zone.name}`),
  type: "A",
  records: [ip],
  ttl: 300,
}, { provider: awsProvider });
