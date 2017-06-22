'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('assert');

describe('tenant-api-binding', () => {
  let Server = require('core-server').Server;
  let server = null;
  before((done) => {
    server = new Server('TenantService', null, null, { useRandomWorkerPort: true });

    server.init().then(() => {
      server.loadHttpRoutes();
      server.listen().then(() => {
        done();
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      done(err);
    });
  });

  /**
   * This test makes sure all the api(s) for TenantService are available via
   * ApiBinding.  Note the stubbed minimal ServiceDescriptor for ApiBinding.
   * It is assumed the TenantService is serving up a valid swagger.json that
   * accurately described the operations / tags supported by the TenantService.
   */
  it('shall create api after binding', (done) => {
    let service = {
      endpoint: `http://localhost:${server.getApp().listeningPort}`,
      schemaRoute: '/swagger.json',
    };
    let apiBinding = new ApiBinding(service);

    apiBinding.bind().then((service) => {
      if (service.api && service.api.health && service.api.tenants && service.api.applications
          && service.api.accounts && service.api.users) {
        done();
      } else {
        done(new Error('Missing api - expected all of api, api.health, api.tenants, api.applications, api.accounts, and api.users'));
      }
    }).catch((err) => {
      done(err);
    });
  }).timeout(2000);

  after((done) => {
    done();
  });

});
