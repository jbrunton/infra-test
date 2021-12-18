data "aws_route53_zone" "jbrunton-aws-com" {
  name = "jbrunton-aws.com"
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.jbrunton-aws-com.zone_id 
  name    = "test-droplet.infra-test.${data.aws_route53_zone.jbrunton-aws-com.name}"
  type    = "A"
  records = ["${digitalocean_droplet.test-droplet.ipv4_address}"]
  ttl = 300
}
