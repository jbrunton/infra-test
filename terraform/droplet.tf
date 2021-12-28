resource "digitalocean_droplet" "test-droplet" {
    image = "ubuntu-20-04-x64"
    name = "test-droplet"
    region = "lon1"
    size = "s-1vcpu-1gb"
    # private_networking = true
    ssh_keys = [
      data.digitalocean_ssh_key.macbook-2020-id_ed25519.id
    ]

    connection {
      host = self.ipv4_address
      user = "root"
      type = "ssh"
      private_key = file(var.pvt_key)
      timeout = "2m"
    }

    provisioner "remote-exec" {
      inline = [
        "export PATH=$PATH:/usr/bin",
        # install nginx
        "sudo apt update",
        "sudo apt install -y nginx"
      ]
    }
}
