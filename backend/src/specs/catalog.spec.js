var testRunner = require('supertest');
var applicationApp = require('../../index');
var safePool = require('../../setup/pool');
var webTokenSigner = require('jsonwebtoken');

var adminAuthorizationToken;
var customerAuthorizationToken;

beforeAll(function () {
  process.env.TOKEN_SECRET = 'fashion_apparel_hub_secret_key_university_of_sindh_2026';
  adminAuthorizationToken = webTokenSigner.sign({ id: 99, role: 'admin' }, process.env.TOKEN_SECRET);
  customerAuthorizationToken = webTokenSigner.sign({ id: 101, role: 'customer' }, process.env.TOKEN_SECRET);
});

afterAll(async function () {
  await safePool.end();
});

describe('Fashion Core Inventory Testing Block', function () {
  
  test('Blocks product registration if security token is completely missing', async function () {
    var res = await testRunner(applicationApp)
      .post('/api/v2/catalog/items')
      .send({ title_name: 'Stray Jacket', slug_url: 'stray-jacket-test', category_id: 1 });
    expect(res.statusCode).toBe(401);
  });

  test('Blocks non-admin profiles with 403 Forbidden protection status code', async function () {
    var res = await testRunner(applicationApp)
      .post('/api/v2/catalog/items')
      .set('Authorization', 'Bearer ' + customerAuthorizationToken)
      .send({ title_name: 'Hack Shirt', slug_url: 'hack-shirt-test', category_id: 1 });
    expect(res.statusCode).toBe(403);
  });

  test('Appends product data to database indexes cleanly under admin verification tokens', async function () {
    var uniqueTimestampSlug = 'cargo-pant-' + Date.now();
    var lookup = await safePool.query('SELECT category_id FROM fashion_categories LIMIT 1');
    var realCategoryId = lookup.rows.length > 0 ? lookup.rows[0].category_id : 1;

    var res = await testRunner(applicationApp)
      .post('/api/v2/catalog/items')
      .set('Authorization', 'Bearer ' + adminAuthorizationToken)
      .send({
        category_id: realCategoryId,
        title_name: 'Streetwear Tactical Cargo Trouser',
        slug_url: uniqueTimestampSlug,
        fabric_description: 'Military-grade tactical ripstop weave fabric blend.',
        production_state: 'draft'
      });
      
    expect(res.statusCode).toBe(201);
    
    // Decodes the row metrics accurately from the execution result array mapping
    var responseRows = Array.isArray(res.body) ? res.body[0] : res.body;
    expect(responseRows).toHaveProperty('slug_url', uniqueTimestampSlug);
  });
});
