function normalizePhotos(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [];
  }
}

function mapProductRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    price: Number(row.price),
    description: row.description || '',
    materials: row.materials || undefined,
    category_id: Number(row.category_id),
    category_name: row.category_name || undefined,
    photos: normalizePhotos(row.photos),
    video_url: row.video_url || undefined,
    badge: row.badge ?? null,
    in_stock: Boolean(row.in_stock),
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function mapCategoryRow(row) {
  return {
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    product_count: Number(row.product_count || 0),
  };
}

function mapUserRow(row) {
  return {
    id: Number(row.id),
    full_name: row.full_name,
    email: row.email,
    mobile: row.mobile,
    address: row.address || '',
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function normalizeOrderItems(value) {
  const rawItems = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? JSON.parse(value)
      : [];

  return rawItems.map((item) => ({
    quantity: Number(item.quantity || 0),
    product: {
      id: Number(item.product?.id || 0),
      name: item.product?.name || '',
      slug: item.product?.slug || '',
      price: Number(item.product?.price || 0),
      description: item.product?.description || '',
      materials: item.product?.materials || undefined,
      category_id: Number(item.product?.category_id || 0),
      category_name: item.product?.category_name || undefined,
      photos: normalizePhotos(item.product?.photos),
      video_url: item.product?.video_url || undefined,
      badge: item.product?.badge ?? null,
      in_stock: item.product?.in_stock !== false,
    },
  }));
}

function mapOrderRow(row) {
  return {
    id: Number(row.id),
    customer_id: row.customer_id ? Number(row.customer_id) : undefined,
    customer_name: row.customer_name,
    customer_email: row.customer_email || undefined,
    phone: row.phone,
    address: row.address,
    pincode: row.pincode,
    note: row.note || undefined,
    total: Number(row.total || 0),
    status: row.status,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    items: normalizeOrderItems(row.items),
  };
}

function mapCartRows(rows) {
  return rows.map((row) => ({
    product: mapProductRow(row),
    quantity: Number(row.quantity || 0),
  }));
}

function mapDashboardStats(row) {
  return {
    total_products: Number(row.total_products || 0),
    total_orders: Number(row.total_orders || 0),
    total_customers: Number(row.total_customers || 0),
    total_categories: Number(row.total_categories || 0),
  };
}

module.exports = {
  mapProductRow,
  mapCategoryRow,
  mapUserRow,
  mapOrderRow,
  mapCartRows,
  mapDashboardStats,
};

