# infra-test

Trying out Pulumi to support [ephemeral test environments](https://webapp.io/blog/what-is-an-ephemeral-environment/).

For now the environments aren't automated on per-PR basis, but the deploy workflow can be triggered to create arbitrary new environments on demand.

The application used for testing is a very simple counter app with a Postgres database, Express API and SPA React front end. You can try it [here](http://dev.infra-test.jbrunton-aws.com/).

## Automated builds and deploy to "staging"

* Every merge to `developer` triggers a [build](https://github.com/jbrunton/infra-test/actions/workflows/build.yml) followed by a [deploy](https://github.com/jbrunton/infra-test/actions/workflows/deploy.yml) to [dev.infra-test.jbrunton-aws.com](http://dev.infra-test.jbrunton-aws.com/).

## Deploying a dev branch to a test environment

1. Trigger a build for your branch, and name the tag suitably.
2. After this, trigger a deploy for the new tag and your new stack name.

## Technical notes of interest

* Pulumi is used to configure infrastructure (DigitalOcean droplets and AWS Route 53 DNS records). This includes installing Docker Compose with cloud-init.
* Ansible is used to deploy changes once an environment is configured.
* The app uses kbld and imgpkg to ensure consistent deployments (in case container tags are updated).
