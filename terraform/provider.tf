terraform {
  required_providers {
    digitalocean = {
      source = "digitalocean/digitalocean"
      version = "~> 2.0"
    }

    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }
  }

  cloud {
    organization = "jbrunton"

    workspaces {
      name = "infra-test"
    }
  }
}

provider "digitalocean" {}

data "digitalocean_ssh_key" "macbook-2020-id_ed25519" {
  name = "macbook-2020-id_ed25519"
}

provider "aws" {
  region = "us-east-1"
}
