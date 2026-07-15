const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction } = require('../config/db');
const { mapCartRows } = require('../lib/mappers');

function parseQuantity(value) {
  const quantity = Number(value);
  return Number.isNaN(quantity) ? 0 : quantity;
}

async function fetchCartItems(customerId) {
  const rows = await runFunction('sp_get_cart', [customerId]);
  return mapCartRows(rows);
}

exports.getCart = asyncHandler(async (req, res) => {
  res.json(await fetchCartItems(req.auth.sub));
});

exports.addCartItem = asyncHandler(async (req, res) => {
  const productId = Number(req.body.product_id);
  const quantity = parseQuantity(req.body.quantity);

  if (!productId || quantity < 1) {
    throw new ApiError(400, 'Valid product and quantity are required');
  }

  await runFunction('sp_add_cart_item', [req.auth.sub, productId, quantity]);
  res.status(201).json(await fetchCartItems(req.auth.sub));
});

exports.updateCartItem = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = parseQuantity(req.body.quantity);

  if (!productId) {
    throw new ApiError(400, 'Valid cart product is required');
  }

  await runFunction('sp_update_cart_item', [req.auth.sub, productId, quantity]);
  res.json(await fetchCartItems(req.auth.sub));
});

exports.deleteCartItem = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  if (!productId) {
    throw new ApiError(400, 'Valid cart product is required');
  }

  await runFunction('sp_delete_cart_item', [req.auth.sub, productId]);
  res.json({
    message: 'Cart item removed',
  });
});

exports.clearCart = asyncHandler(async (req, res) => {
  await runFunction('sp_clear_cart', [req.auth.sub]);
  res.json({
    message: 'Cart cleared',
  });
});
