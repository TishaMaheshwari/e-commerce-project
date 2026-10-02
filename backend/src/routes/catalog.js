var express = require('express');
var router = express.Router();
var dbPool = require('../../setup/pool');
var enforceSecurity = require('../guard/verify');

// CAT-02: Safely create new fashion product entries
router.post('/items', enforceSecurity, async function (request, response) {
  var title_name = request.body.title_name;
  var slug_url = request.body.slug_url;
  var category_id = request.body.category_id;
  var fabric_description = request.body.fabric_description;
  var production_state = request.body.production_state;

  if (!title_name || !slug_url || !category_id) {
    return response.status(400).json({ error_message: 'Validation failed. Missing required fields.' });
  }

  try {
    // Corrected explicit variable array references bypassing PowerShell interpolation issues
    var sqlStatement = 'INSERT INTO clothing_catalog (category_id, title_name, slug_url, fabric_description, production_state) VALUES ($1, $2, $3, $4, $5) RETURNING *;';
    var executionResult = await dbPool.query(sqlStatement, [category_id, title_name, slug_url, fabric_description, production_state || 'draft']);
    
    // Return the matching database entry
    return response.status(201).json(executionResult.rows);
  } catch (errorSignal) {
    if (errorSignal.code === '23505') {
      return response.status(400).json({ error_message: 'Duplicate entry error: Slug already exists.' });
    }
    return response.status(500).json({ error_message: 'Internal server error processing product metrics.' });
  }
});

// CAT-03: Assign unique barcode SKU entries to items
router.post('/items/:id/skus', enforceSecurity, async function (request, response) {
  var variant_id = request.body.variant_id;
  var barcode_sku = request.body.barcode_sku;
  var retail_price = request.body.retail_price;
  var stock_count = request.body.stock_count;

  if (!variant_id || !barcode_sku || retail_price === undefined || stock_count === undefined) {
    return response.status(400).json({ error_message: 'Incomplete metrics payload.' });
  }

  if (Number(retail_price) < 0 || Number(stock_count) < 0) {
    return response.status(400).json({ error_message: 'Values cannot fall below zero boundaries.' });
  }

  try {
    var sqlStatement = 'INSERT INTO garment_skus (variant_id, barcode_sku, retail_price, stock_count) VALUES ($1, $2, $3, $4) RETURNING *;';
    var executionResult = await dbPool.query(sqlStatement, [variant_id, barcode_sku, retail_price, stock_count]);
    return response.status(201).json(executionResult.rows);
  } catch (errorSignal) {
    if (errorSignal.code === '23505') {
      return response.status(400).json({ error_message: 'Inventory index code error.' });
    }
    return response.status(500).json({ error_message: 'Internal configuration issue.' });
  }
});

module.exports = router;
