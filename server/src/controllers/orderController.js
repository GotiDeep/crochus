const asyncHandler = require('../lib/asyncHandler');
const ApiError = require('../lib/apiError');
const { runFunction } = require('../config/db');
const { mapOrderRow } = require('../lib/mappers');
const { sendCustomerOrderEmail, sendAdminOrderNotificationEmail } = require('../services/mailService');

function validateOrderPayload(body) {
  return (
    String(body.full_name || '').trim() &&
    /^\d{10}$/.test(String(body.phone || '').trim()) &&
    String(body.address || '').trim() &&
    /^\d{6}$/.test(String(body.pincode || '').trim())
  );
}

exports.createOrder = asyncHandler(async (req, res) => {
  if (!validateOrderPayload(req.body)) {
    throw new ApiError(400, 'Please provide valid delivery details');
  }

  const orderRows = await runFunction('sp_create_order', [
    req.auth.sub,
    String(req.body.full_name).trim(),
    String(req.body.phone).trim(),
    String(req.body.address).trim(),
    String(req.body.pincode).trim(),
    String(req.body.note || '').trim() || null,
  ]);

  const createdOrder = orderRows[0];
  const detailRows = await runFunction('sp_get_order_detail', [createdOrder.order_id, req.auth.sub]);
  const settingRows = await runFunction('sp_get_whatsapp_number');
  const mappedOrder = mapOrderRow(detailRows[0]);

  // Asynchronously dispatch both Customer and Admin emails (never block response or fail order placement)
  Promise.allSettled([
    sendCustomerOrderEmail(mappedOrder),
    sendAdminOrderNotificationEmail(mappedOrder),
  ]).then((results) => {
    results.forEach((result, idx) => {
      const type = idx === 0 ? 'Customer' : 'Admin';
      if (result.status === 'rejected') {
        console.error(`[OrderController] Failed to send ${type} order email for order #${mappedOrder.id}:`, result.reason?.message || result.reason);
      }
    });
  });

  res.status(201).json({
    order: mappedOrder,
    whatsapp_number: settingRows[0]?.whatsapp_number || '',
  });
});

exports.getOrderHistory = asyncHandler(async (req, res) => {
  const rows = await runFunction('sp_get_order_history', [req.auth.sub]);
  res.json(rows.map((row) => mapOrderRow(row)));
});

