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
}

variable "do_token" {}
variable "pvt_key" {}

provider "digitalocean" {
  token = var.do_token
}

data "digitalocean_ssh_key" "macbook-2020-id_ed25519" {
  name = "macbook-2020-id_ed25519"
}

provider "aws" {
  region = "us-east-1"
  profile = "default"
}
