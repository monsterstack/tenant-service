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
  it('api created when binding occurs', (done) => {
    let service = {
      endpoint: `http://localhost:${server.getApp().listeningPort}`,
      schemaRoute: '/swagger.json',
    };
    let apiBinding = new ApiBinding(service);

    apiBinding.bind().then((service) => {
      if (service.api === undefined) {
        done(new Error('Api is null'));
      } else if (service.api.health === undefined) {
        done(new Error('Health Api is null'));
      } else if (service.api.tenants === undefined) {
        done(new Error('Tenants Api is null'));
      } else {
        done();
      }
    }).catch((err) => {
      assert(err === undefined, "Error didn't occur");
      done();
    });

  }).timeout(2000);

  after(() => {

  });

});
