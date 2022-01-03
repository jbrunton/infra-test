# infra-test

Trying out Pulumi to support [ephemeral test environments](https://webapp.io/blog/what-is-an-ephemeral-environment/).

For now the environments aren't automated on per-PR basis, but the deploy workflow can be triggered to create arbitrary new environments on demand.

The application used for testing is a very simple counter app with a Postgres database, Express API and SPA React front end. You can try it [here](http://dev.infra-test.jbrunton-aws.com/).

## Automated builds and deployments to "staging"

Every merge to `develop` triggers the [test](https://github.com/jbrunton/infra-test/actions/workflows/test.yml) then [build](https://github.com/jbrunton/infra-test/actions/workflows/build.yml) workflows, followed by a [deploy](https://github.com/jbrunton/infra-test/actions/workflows/deploy.yml) to [dev.infra-test.jbrunton-aws.com](http://dev.infra-test.jbrunton-aws.com/).

## Deploying a dev branch to a test environment

1. Trigger a build for your branch, with an appropriate tag name.

![Trigger build](https://raw.githubusercontent.com/jbrunton/infra-test/develop/docs/trigger-build.png)

3. After this, trigger a deploy for the new tag and your stack name.

![Trigger deploy](https://raw.githubusercontent.com/jbrunton/infra-test/develop/docs/trigger-deploy.png)

This will provision and deploy an environment at `<stack-name>.infra-test.jbrunton-aws.com`.

## Technical notes of interest

* Pulumi is used to [provision the infrastructure](https://github.com/jbrunton/infra-test/blob/develop/pulumi/index.ts) (including an EC2 instance and rules for an Application Load Balancer). This includes installing Docker Compose and other dependencies with [cloud-init](https://github.com/jbrunton/infra-test/blob/develop/pulumi/user_data.yml).
* Ansible is used to [deploy changes](https://github.com/jbrunton/infra-test/blob/develop/ansible/playbooks/deploy.yml) once an environment is provisioned.
* The app uses [kbld](https://carvel.dev/kbld/) and [imgpkg](https://carvel.dev/imgpkg/) to ensure consistent deployments in case container tags are updated (see [build.sh](https://github.com/jbrunton/infra-test/blob/develop/build/build.sh)).
* TLS termination is handled by the AWS load balancer.
* For good measure, CI runs Cypress tests, making use of Docker Compose to [run the app locally](https://github.com/jbrunton/infra-test/blob/develop/build/start-local.sh).

