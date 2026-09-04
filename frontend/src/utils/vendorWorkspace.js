const normalizeId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value._id || value.id || "";
  }
  return "";
};

export const getVendorId = (vendor, user) =>
  normalizeId(vendor?._id || vendor?.id || user?.user_id || user?._id || user?.id);

export const productBelongsToVendor = (product, vendorId) =>
  normalizeId(product?.vendor_id) === normalizeId(vendorId);

export const filterVendorProducts = (products = [], vendorId = "") =>
  products.filter((product) => productBelongsToVendor(product, vendorId));

export const buildVendorProductMap = (products = []) =>
  new Map(products.map((product) => [normalizeId(product?._id), product]));

export const getVendorRelevantItems = (order, vendorProductMap) =>
  (order?.items || []).filter((item) =>
    vendorProductMap.has(normalizeId(item?.product_id))
  );

export const decorateVendorOrder = (order, vendorProductMap) => {
  const relevantItems = getVendorRelevantItems(order, vendorProductMap);
  const relevantTotal = relevantItems.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0),
    0
  );

  return {
    ...order,
    relevantItems,
    relevantTotal,
    relevantQuantity: relevantItems.reduce(
      (sum, item) => sum + Number(item?.quantity || 0),
      0
    ),
    isSharedOrder:
      relevantItems.length > 0 && relevantItems.length !== (order?.items || []).length
  };
};

export const filterVendorOrders = (orders = [], vendorProducts = []) => {
  const vendorProductMap = buildVendorProductMap(vendorProducts);

  return orders
    .map((order) => decorateVendorOrder(order, vendorProductMap))
    .filter((order) => order.relevantItems.length > 0);
};

export const calculateVendorOverview = (products = [], orders = []) => {
  const pendingOrders = orders.filter((order) =>
    ["PENDING", "PAID", "PROCESSING"].includes(order?.status)
  ).length;
  const deliveredOrders = orders.filter((order) => order?.status === "DELIVERED").length;
  const sharedOrders = orders.filter((order) => order?.isSharedOrder).length;
  const totalRevenue = orders.reduce(
    (sum, order) =>
      order?.status === "CANCELLED" ? sum : sum + Number(order?.relevantTotal || 0),
    0
  );
  const ratedProducts = products.filter((product) => Number(product?.rating || 0) > 0);

  const topProduct = [...products]
    .sort((a, b) => Number(b?.sold_count || 0) - Number(a?.sold_count || 0))[0];

  return {
    totalProducts: products.length,
    activeProducts: products.filter((product) => product?.status !== "INACTIVE").length,
    inactiveProducts: products.filter((product) => product?.status === "INACTIVE").length,
    lowStockProducts: products.filter((product) => Number(product?.stock || 0) < 10).length,
    outOfStockProducts: products.filter((product) => Number(product?.stock || 0) <= 0).length,
    auctionExclusive: products.filter((product) => product?.is_auction_exclusive).length,
    reservedAuctionProducts: products.filter(
      (product) => product?.auction_availability === "RESERVED"
    ).length,
    pendingOrders,
    deliveredOrders,
    sharedOrders,
    totalRevenue,
    averageOrderValue: orders.length ? totalRevenue / orders.length : 0,
    totalUnitsSold: products.reduce(
      (sum, product) => sum + Number(product?.sold_count || 0),
      0
    ),
    totalViews: products.reduce(
      (sum, product) => sum + Number(product?.views || 0),
      0
    ),
    averageRating: ratedProducts.length
      ? ratedProducts.reduce((sum, product) => sum + Number(product?.rating || 0), 0) /
        ratedProducts.length
      : 0,
    topProduct
  };
};

export const formatCompactDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};
