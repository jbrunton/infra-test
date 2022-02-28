# infra-test

Trying out Pulumi to support [ephemeral test environments](https://webapp.io/blog/what-is-an-ephemeral-environment/).

For now the environments aren't automated on per-PR basis, but the deploy workflow can be triggered to create arbitrary new environments on demand.

The application used for testing is a very simple counter app with a Postgres database, Express API and SPA React front end. You can try it [here](https://infra-test.jbrunton-do.com/).

## Automated builds and deployments

Every merge to `develop` triggers the [test](https://github.com/jbrunton/infra-test/actions/workflows/test.yml) then [build](https://github.com/jbrunton/infra-test/actions/workflows/build.yml) workflows. The containers then get deployed using DO App Platform, based on the environment [config files](https://github.com/jbrunton/infra-test/tree/develop/config).

## Deploying a dev branch to a test environment

1. Trigger a build for your branch, with an appropriate tag name.

![Trigger build](https://raw.githubusercontent.com/jbrunton/infra-test/develop/docs/trigger-build.png)

3. After this, trigger a deploy for the new tag and your stack name.

![Trigger deploy](https://raw.githubusercontent.com/jbrunton/infra-test/develop/docs/trigger-deploy.png)

This will provision and deploy an environment at `<stack-name>.infra-test.dev.jbrunton-do.com`.

## Technical notes of interest

* Pulumi is used to [provision the infrastructure](https://github.com/jbrunton/infra-test/blob/develop/pulumi/index.ts) using DO App Platform.
* TLS termination is handled by DO App Platform.
* For good measure, CI runs Cypress tests, making use of Docker Compose to [run the app locally](https://github.com/jbrunton/infra-test/blob/develop/build/start-local.sh).

