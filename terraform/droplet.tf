resource "digitalocean_droplet" "test-droplet" {
  image = "ubuntu-20-04-x64"
  name = "test-droplet"
  region = "lon1"
  size = "s-1vcpu-1gb"
  # private_networking = true
  ssh_keys = [
    data.digitalocean_ssh_key.macbook-2020-id_ed25519.id
  ]

  user_data = file("test-droplet-init.yml")
}
