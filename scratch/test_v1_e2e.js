/**
 * Mithai Junction / eKart V1 End-to-End Validation Suite
 * Runs against live Gateway at http://localhost:4000/api
 */

const BASE_URL = 'http://localhost:4000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, headers: res.headers, body };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED ASSERTION: ${message}`);
    throw new Error(message);
  }
  console.log(`  ✓ ${message}`);
}

async function run() {
  console.log('====================================================');
  console.log('  STARTING MITHAI JUNCTION V1 E2E VALIDATION SUITE');
  console.log('====================================================\n');

  const rand = Math.floor(100000000 + Math.random() * 900000000);
  const customerEmail = `e2e_cust_${rand}@testmithai.com`;
  const customerPhone = `9${String(rand).substring(0, 9)}`;
  const customerPassword = 'Password@123';

  // ----------------------------------------------------
  // 1. PUBLIC CATALOGUE & PRODUCTS
  // ----------------------------------------------------
  console.log('--- 1. Public Catalogue & Products ---');
  const catRes = await request('/products/products');
  assert(catRes.status === 200, 'Catalogue returns 200 OK');
  assert(Array.isArray(catRes.body), 'Catalogue returns array of products');
  assert(catRes.body.length === 17, `Public catalogue has exactly 17 active products (got ${catRes.body.length})`);

  // Check product imagery & data
  const sampleProduct = catRes.body.find(p => p.productId === 1075);
  assert(sampleProduct && sampleProduct.name === 'Kaju Katli', 'Product 1075 is Kaju Katli');
  assert(sampleProduct.imageUrl === '/images/products/kaju-katli.jpg', 'Kaju Katli image is local /images/products/kaju-katli.jpg');
  assert(sampleProduct.price > 0, 'Kaju Katli has valid price');

  const detailRes = await request('/products/product/1075');
  assert(detailRes.status === 200, 'Product detail 1075 returns 200 OK');
  assert(detailRes.body.productId === 1075, 'Product detail matches requested id');

  // ----------------------------------------------------
  // 2. CUSTOMER AUTHENTICATION (REGISTER & LOGIN)
  // ----------------------------------------------------
  console.log('\n--- 2. Customer Authentication ---');
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      emailId: customerEmail,
      name: 'Rohan Sharma',
      password: customerPassword,
      phoneNumber: customerPhone,
    }),
  });
  assert(regRes.status === 200, `Customer registration succeeded (HTTP ${regRes.status})`);

  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      emailId: customerEmail,
      password: customerPassword,
    }),
  });
  assert(loginRes.status === 200, 'Customer login succeeded');
  assert(loginRes.body.accessToken && loginRes.body.role === 'CUSTOMER', 'Customer received accessToken with role CUSTOMER');
  const customerToken = loginRes.body.accessToken;

  // ----------------------------------------------------
  // 3. CART OPERATIONS
  // ----------------------------------------------------
  console.log('\n--- 3. Cart Operations ---');
  const addCartRes = await request('/customers/customercarts/add-product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      cartProducts: [{ product: { productId: 1075 }, quantity: 2 }],
    }),
  });
  assert(addCartRes.status === 200 || addCartRes.status === 201, `Added product to cart (HTTP ${addCartRes.status})`);

  const getCartRes = await request(`/cart/customer/${encodeURIComponent(customerEmail)}/products`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(getCartRes.status === 200, 'Get cart items returns 200 OK');
  assert(Array.isArray(getCartRes.body) && getCartRes.body.length === 1, 'Cart has 1 item');
  assert(getCartRes.body[0].quantity === 2, 'Cart item quantity is 2');

  // Update quantity to 1
  const updateCartRes = await request(`/cart/customer/${encodeURIComponent(customerEmail)}/product/1075`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(1),
  });
  assert(updateCartRes.status === 200, 'Updated cart item quantity to 1');

  // Verify updated quantity
  const getCartAfterUpdate = await request(`/cart/customer/${encodeURIComponent(customerEmail)}/products`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(getCartAfterUpdate.body[0].quantity === 1, 'Cart item quantity updated to 1');

  // ----------------------------------------------------
  // 4. DELIVERY RADIUS VALIDATION (20 KM STORE RADIUS)
  // ----------------------------------------------------
  console.log('\n--- 4. Delivery Radius Validation ---');
  // Store is at 12.9756, 77.6066 (MG Road Bengaluru)
  // Add address 1: Outside 20km (Mysuru ~140 km: lat 12.2958, lng 76.6394)
  const farAddressRes = await request(`/customers/customer/${encodeURIComponent(customerEmail)}/addresses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      label: 'Mysuru Outstation',
      line1: 'Near Mysore Palace',
      city: 'Mysuru',
      state: 'Karnataka',
      pincode: '570001',
      latitude: 12.2958,
      longitude: 76.6394,
      isDefault: false,
    }),
  });
  assert(farAddressRes.status === 200 || farAddressRes.status === 201, 'Added far address (>20km)');
  const farAddressId = farAddressRes.body.addressId;

  // Add address 2: Inside 20km (Indiranagar ~4 km: lat 12.9784, lng 77.6408)
  const nearAddressRes = await request(`/customers/customer/${encodeURIComponent(customerEmail)}/addresses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      label: 'Indiranagar Home',
      line1: '100ft Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      isDefault: true,
    }),
  });
  assert(nearAddressRes.status === 200 || nearAddressRes.status === 201, 'Added near address (<20km)');
  const nearAddressId = nearAddressRes.body.addressId;

  // Attempt to place DELIVERY order with far address -> MUST BE REJECTED
  const futureDeliveryDate = new Date(Date.now() + 86400000).toISOString();
  const farOrderRes = await request('/orders/place-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      deliveryType: 'DELIVERY',
      addressId: farAddressId,
      paymentThrough: 'COD',
      dateOfDelivery: futureDeliveryDate,
    }),
  });
  assert(farOrderRes.status === 400 || farOrderRes.status === 409, `Order outside 20km rejected with HTTP ${farOrderRes.status}`);
  assert(JSON.stringify(farOrderRes.body).toLowerCase().includes('delivery') || JSON.stringify(farOrderRes.body).toLowerCase().includes('area') || JSON.stringify(farOrderRes.body).toLowerCase().includes('outside'), 'Rejection message cites delivery area limitation');

  // Place DELIVERY order with near address -> MUST SUCCEED
  const nearOrderRes = await request('/orders/place-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      deliveryType: 'DELIVERY',
      addressId: nearAddressId,
      paymentThrough: 'COD',
      dateOfDelivery: futureDeliveryDate,
    }),
  });
  assert(nearOrderRes.status === 200 || nearOrderRes.status === 201, `Order inside 20km succeeded with HTTP ${nearOrderRes.status}`);
  const deliveryOrderId = Number(String(nearOrderRes.body).match(/(\d+)\s*$/)?.[1]);
  assert(deliveryOrderId > 0, `Parsed Delivery Order ID: ${deliveryOrderId}`);

  // ----------------------------------------------------
  // 5. PICKUP ORDER VALIDATION (NO RADIUS REQUIREMENT)
  // ----------------------------------------------------
  console.log('\n--- 5. Pickup Order Validation ---');
  // Add item 1076 to cart
  await request('/customers/customercarts/add-product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      cartProducts: [{ product: { productId: 1076 }, quantity: 1 }],
    }),
  });

  const pickupOrderRes = await request('/orders/place-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      deliveryType: 'PICKUP',
      paymentThrough: 'COD',
      dateOfDelivery: futureDeliveryDate,
    }),
  });
  assert(pickupOrderRes.status === 200 || pickupOrderRes.status === 201, `Pickup order placed successfully with HTTP ${pickupOrderRes.status}`);
  const pickupOrderId = Number(String(pickupOrderRes.body).match(/(\d+)\s*$/)?.[1]);
  assert(pickupOrderId > 0, `Parsed Pickup Order ID: ${pickupOrderId}`);

  // ----------------------------------------------------
  // 6. CUSTOMER ORDER TRACKING & ELIGIBLE CANCELLATION
  // ----------------------------------------------------
  console.log('\n--- 6. Customer Order Tracking & Cancellation ---');
  const getOrderRes = await request(`/orders/order/${deliveryOrderId}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(getOrderRes.status === 200, `Fetched order ${deliveryOrderId}`);
  assert(getOrderRes.body.orderStatus === 'PLACED', 'Order status is initially PLACED');
  assert(getOrderRes.body.deliveryType === 'DELIVERY', 'Delivery type is DELIVERY');
  assert(getOrderRes.body.deliveryAddressSnapshot != null, 'Order contains delivery address snapshot');
  assert(getOrderRes.body.orderedProducts?.length === 1, 'Order contains 1 ordered product');
  assert(getOrderRes.body.orderedProducts[0].product?.name === 'Kaju Katli', 'Product snapshot contains product name');

  // Customer cancels the pickup order while it is in PLACED state
  const cancelRes = await request(`/orders/order/${pickupOrderId}/cancel`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(cancelRes.status === 200 || cancelRes.status === 204, `Customer cancelled order ${pickupOrderId} (HTTP ${cancelRes.status})`);

  const cancelledOrderRes = await request(`/orders/order/${pickupOrderId}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(cancelledOrderRes.body.orderStatus === 'CANCELLED', 'Order status changed to CANCELLED');

  // Check customer order history
  const customerOrdersRes = await request(`/orders/customer/${encodeURIComponent(customerEmail)}/orders`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(customerOrdersRes.status === 200, 'Customer order history returns 200 OK');
  assert(Array.isArray(customerOrdersRes.body) && customerOrdersRes.body.length >= 2, 'Customer history contains all placed orders');

  // ----------------------------------------------------
  // 7. PAYMENT SIMULATION (ONLINE PAYMENT LIFECYCLE)
  // ----------------------------------------------------
  console.log('\n--- 7. Online Payment Lifecycle ---');
  // Add product 1077 (Besan Ladoo) to cart
  await request('/customers/customercarts/add-product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      cartProducts: [{ product: { productId: 1077 }, quantity: 1 }],
    }),
  });

  const onlineOrderRes = await request('/orders/place-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      deliveryType: 'DELIVERY',
      addressId: nearAddressId,
      paymentThrough: 'ONLINE',
      dateOfDelivery: futureDeliveryDate,
    }),
  });
  const onlineOrderId = Number(String(onlineOrderRes.body).match(/(\d+)\s*$/)?.[1]);
  assert(onlineOrderId > 0, `Created online order ${onlineOrderId}`);

  // Create payment order
  const payOrderRes = await request(`/payments/customer/${encodeURIComponent(customerEmail)}/order/${onlineOrderId}/create-payment-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(payOrderRes.status === 200 || payOrderRes.status === 201, `Created simulated payment order (HTTP ${payOrderRes.status})`);
  assert(payOrderRes.body.simulated === true, 'Payment is marked simulated in test environment');

  // Verify payment
  const verifyPayRes = await request(`/payments/customer/${encodeURIComponent(customerEmail)}/verify-payment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      orderId: onlineOrderId,
      gatewayOrderId: payOrderRes.body.gatewayOrderId,
      gatewayPaymentId: 'pay_simulated_test_123',
      gatewaySignature: 'SIMULATED_SUCCESS',
    }),
  });
  assert(verifyPayRes.status === 200, 'Payment verified successfully');
  assert(verifyPayRes.body.status === 'CAPTURED' || verifyPayRes.body.status === 'PAID', 'Payment status is CAPTURED/PAID');

  // Check order status has paymentStatus PAID
  const paidOrderRes = await request(`/orders/order/${onlineOrderId}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(paidOrderRes.body.paymentStatus === 'PAID', 'Order paymentStatus updated to PAID');

  // ----------------------------------------------------
  // 8. ADMIN OPERATIONS & LIFECYCLE FULFILLMENT
  // ----------------------------------------------------
  console.log('\n--- 8. Admin Operations & Lifecycle Fulfillment ---');
  const adminLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      emailId: 'admin@mithaijunction.dev',
      password: 'MithaiV1!Admin#2026',
    }),
  });
  assert(adminLoginRes.status === 200, 'Admin login succeeded');
  assert(adminLoginRes.body.role === 'ADMIN', 'Admin role confirmed');
  const adminToken = adminLoginRes.body.accessToken;

  // Admin order list contains deliveryOrderId
  const adminOrdersRes = await request('/admin/orders', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminOrdersRes.status === 200, 'Admin orders list returns 200 OK');
  const adminOrder = adminOrdersRes.body.find(o => o.orderId === deliveryOrderId);
  assert(adminOrder != null, `Fresh customer order ${deliveryOrderId} is visible in Admin Orders`);
  assert(adminOrder.customerName === 'Rohan Sharma', 'Order enriched with customer name');

  // Delivery order lifecycle: PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> OUT_FOR_DELIVERY -> DELIVERED
  console.log('  Executing Delivery Order Fulfillment pipeline:');

  // Step 1: PLACED -> CONFIRMED
  const step1 = await request(`/admin/orders/${deliveryOrderId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'CONFIRMED', note: 'Order accepted by store' }),
  });
  assert(step1.status === 200 && step1.body.orderStatus === 'CONFIRMED', 'Transition: PLACED -> CONFIRMED (Accepted)');

  // Step 2: CONFIRMED -> PREPARING
  const step2 = await request(`/admin/orders/${deliveryOrderId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'PREPARING', note: 'Packing fresh sweets' }),
  });
  assert(step2.status === 200 && step2.body.orderStatus === 'PREPARING', 'Transition: CONFIRMED -> PREPARING (Packing)');

  // Step 3: PREPARING -> READY_FOR_PICKUP
  const step3 = await request(`/admin/orders/${deliveryOrderId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'READY_FOR_PICKUP', note: 'Order boxed and ready' }),
  });
  assert(step3.status === 200 && step3.body.orderStatus === 'READY_FOR_PICKUP', 'Transition: PREPARING -> READY_FOR_PICKUP (Ready)');

  // Step 4: READY_FOR_PICKUP -> OUT_FOR_DELIVERY
  const step4 = await request(`/admin/orders/${deliveryOrderId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'OUT_FOR_DELIVERY', note: 'Dispatched with delivery partner' }),
  });
  assert(step4.status === 200 && step4.body.orderStatus === 'OUT_FOR_DELIVERY', 'Transition: READY_FOR_PICKUP -> OUT_FOR_DELIVERY');

  // Step 5: OUT_FOR_DELIVERY -> DELIVERED
  const step5 = await request(`/admin/orders/${deliveryOrderId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'DELIVERED', note: 'Handed over to customer' }),
  });
  assert(step5.status === 200 && step5.body.orderStatus === 'DELIVERED', 'Transition: OUT_FOR_DELIVERY -> DELIVERED');
  assert(step5.body.paymentStatus === 'PAID', 'COD payment marked PAID upon DELIVERED handoff');

  // Check invalid state transition rejected (e.g. DELIVERED -> PREPARING)
  const invalidTransition = await request(`/admin/orders/${deliveryOrderId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'PREPARING' }),
  });
  assert(invalidTransition.status === 409 || invalidTransition.status === 400, `Invalid state transition rejected with HTTP ${invalidTransition.status}`);

  // Admin Customer list
  const adminCustRes = await request('/admin/customers', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminCustRes.status === 200, 'Admin customers list returns 200 OK');
  assert(Array.isArray(adminCustRes.body), 'Admin customers is an array');
  const foundCust = adminCustRes.body.find(c => c.emailId === customerEmail);
  assert(foundCust != null, 'Newly registered customer found in Admin customers');
  assert(foundCust.password == null && foundCust.passwordHash == null, 'Customer password hash is not exposed to admin');

  // Admin Product Inventory Update
  const stockRes = await request('/admin/products/1075/stock', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(80),
  });
  assert(stockRes.status === 200, 'Admin updated product 1075 stock to 80');

  // ----------------------------------------------------
  // 8B. PICKUP ORDER FULFILLMENT PIPELINE
  // ----------------------------------------------------
  console.log('\n--- 8B. Pickup Order Fulfillment Pipeline ---');
  // Add item 1076 to cart
  await request('/customers/customercarts/add-product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      cartProducts: [{ product: { productId: 1076 }, quantity: 1 }],
    }),
  });
  const freshPickupRes = await request('/orders/place-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      deliveryType: 'PICKUP',
      paymentThrough: 'COD',
      dateOfDelivery: futureDeliveryDate,
    }),
  });
  const freshPickupId = Number(String(freshPickupRes.body).match(/(\d+)\s*$/)?.[1]);
  assert(freshPickupId > 0, `Created fresh pickup order ${freshPickupId}`);

  // Transition: PLACED -> CONFIRMED -> PREPARING -> READY_FOR_PICKUP -> DELIVERED
  const pStep1 = await request(`/admin/orders/${freshPickupId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'CONFIRMED', note: 'Accepted' }),
  });
  assert(pStep1.status === 200 && pStep1.body.orderStatus === 'CONFIRMED', 'Pickup: PLACED -> CONFIRMED');

  const pStep2 = await request(`/admin/orders/${freshPickupId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'PREPARING', note: 'Packing' }),
  });
  assert(pStep2.status === 200 && pStep2.body.orderStatus === 'PREPARING', 'Pickup: CONFIRMED -> PREPARING');

  const pStep3 = await request(`/admin/orders/${freshPickupId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'READY_FOR_PICKUP', note: 'Ready for customer pickup' }),
  });
  assert(pStep3.status === 200 && pStep3.body.orderStatus === 'READY_FOR_PICKUP', 'Pickup: PREPARING -> READY_FOR_PICKUP');

  // Direct to DELIVERED (Picked up)
  const pStep4 = await request(`/admin/orders/${freshPickupId}/status`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'DELIVERED', note: 'Picked up by customer' }),
  });
  assert(pStep4.status === 200 && pStep4.body.orderStatus === 'DELIVERED', 'Pickup: READY_FOR_PICKUP -> DELIVERED (Picked up)');
  assert(pStep4.body.paymentStatus === 'PAID', 'COD payment marked PAID upon pickup handoff');

  // ----------------------------------------------------
  // 8C. STOCK OVERSELLING PREVENTION
  // ----------------------------------------------------
  console.log('\n--- 8C. Stock Overselling Prevention ---');
  const oversellCartRes = await request('/customers/customercarts/add-product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      cartProducts: [{ product: { productId: 1076 }, quantity: 99999 }],
    }),
  });
  assert(oversellCartRes.status === 409 || oversellCartRes.status === 400, `Overselling quantity rejected at cart stage (HTTP ${oversellCartRes.status})`);

  // ----------------------------------------------------
  // 8D. ONLINE PAYMENT CANCELLATION FLOW
  // ----------------------------------------------------
  console.log('\n--- 8D. Online Payment Cancellation Flow ---');
  await request('/customers/customercarts/add-product', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      cartProducts: [{ product: { productId: 1077 }, quantity: 1 }],
    }),
  });
  const cancelOnlineOrderRes = await request('/orders/place-order', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: JSON.stringify({
      customerEmailId: customerEmail,
      deliveryType: 'DELIVERY',
      addressId: nearAddressId,
      paymentThrough: 'ONLINE',
      dateOfDelivery: futureDeliveryDate,
    }),
  });
  const cancelOnlineOrderId = Number(String(cancelOnlineOrderRes.body).match(/(\d+)\s*$/)?.[1]);
  assert(cancelOnlineOrderId > 0, `Created online order ${cancelOnlineOrderId} for cancel test`);

  // Create payment order
  await request(`/payments/customer/${encodeURIComponent(customerEmail)}/order/${cancelOnlineOrderId}/create-payment-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  });

  // Cancel payment
  const cancelPayRes = await request(`/payments/customer/${encodeURIComponent(customerEmail)}/order/${cancelOnlineOrderId}/cancel-payment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(cancelPayRes.status === 204 || cancelPayRes.status === 200, `Payment cancelled successfully (HTTP ${cancelPayRes.status})`);

  // Verify order paymentStatus changed to CANCELLED
  const checkCancelledPayOrder = await request(`/orders/order/${cancelOnlineOrderId}`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(checkCancelledPayOrder.body.paymentStatus === 'CANCELLED', 'Order paymentStatus updated to CANCELLED');

  // ----------------------------------------------------
  // 9. SECURITY & BOUNDARIES
  // ----------------------------------------------------
  console.log('\n--- 9. Security & Access Boundaries ---');
  // Unauthenticated admin API -> 401
  const unauthRes = await request('/admin/orders');
  assert(unauthRes.status === 401, 'Unauthenticated admin request returns 401 Unauthorized');

  // Customer token accessing admin API -> 403
  const custOnAdminRes = await request('/admin/orders', {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  assert(custOnAdminRes.status === 403, 'Customer token on admin API returns 403 Forbidden');

  // Customer A accessing Customer B's order -> 403
  // Create customer 2
  const rand2 = Math.floor(100000000 + Math.random() * 900000000);
  const cust2Email = `e2e_cust2_${rand2}@testmithai.com`;
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      emailId: cust2Email,
      name: 'Another Customer',
      password: customerPassword,
      phoneNumber: `9${String(rand2).substring(0, 9)}`,
    }),
  });
  const cust2Login = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ emailId: cust2Email, password: customerPassword }),
  });
  const cust2Token = cust2Login.body.accessToken;

  const idorRes = await request(`/orders/order/${deliveryOrderId}`, {
    headers: { Authorization: `Bearer ${cust2Token}` },
  });
  assert(idorRes.status === 403, `IDOR prevented: Customer 2 accessing Customer 1's order returns 403 Forbidden`);

  // Direct internal inventory reservation endpoint through Gateway -> 403 Forbidden
  const directReserveRes = await request('/products/orders/999/reserve', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(directReserveRes.status === 403, 'Internal inventory reservation endpoint through Gateway returns 403 Forbidden');

  console.log('\n====================================================');
  console.log('  🎉 ALL E2E INTEGRATION & SECURITY TESTS PASSED! 🎉');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('\n❌ E2E TEST FAILED:', err);
  process.exit(1);
});
