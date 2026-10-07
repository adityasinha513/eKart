import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from "react-native";
import * as Location from "expo-location";
import { apiMessage, authApi, parseOrderId, readSession, saveSession, shopApi } from "./src/api";
import type { Address, CartItem, Category, Order, Product, Session } from "./src/types";

type Tab = "Shop" | "Cart" | "Orders";
const money = (amount: number) => `₹${Number(amount ?? 0).toFixed(2)}`;
const tomorrow = () => { const date = new Date(); date.setDate(date.getDate() + 1); date.setHours(12, 0, 0, 0); return date.toISOString(); };
const resolveProductImage = (imageUrl: string | null | undefined) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) return imageUrl;
  if (imageUrl.startsWith("/")) {
    const apiHost = process.env.EXPO_PUBLIC_API_BASE_URL
      ? process.env.EXPO_PUBLIC_API_BASE_URL.replace(/\/api\/?$/, "")
      : "http://10.0.2.2:5173";
    return `${apiHost}${imageUrl}`;
  }
  return null;
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<Tab>("Shop");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [payment, setPayment] = useState<"COD" | "ONLINE">("COD");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [state, setState] = useState("Karnataka");
  const [pincode, setPincode] = useState("");
  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);

  const refreshCatalog = useCallback(async () => {
    try {
      const [categoryData, productData] = await Promise.all([shopApi.categories(), shopApi.products()]);
      setCategories(categoryData.filter((item) => ["sweet", "namkeen", "beverages"].includes(item.name.toLowerCase())));
      setProducts(productData);
    } catch (error) { Alert.alert("Shop unavailable", apiMessage(error)); }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!session) return;
    try { setCart(await shopApi.cart(session.emailId)); } catch (error) { Alert.alert("Cart", apiMessage(error)); }
  }, [session]);

  const refreshOrders = useCallback(async () => {
    if (!session) return;
    try { setOrders(await shopApi.orders(session.emailId)); } catch { setOrders([]); }
  }, [session]);

  useEffect(() => {
    void readSession().then(setSession);
    void refreshCatalog();
  }, [refreshCatalog]);
  useEffect(() => { if (session) void refreshCart(); }, [session, refreshCart]);
  useEffect(() => { if (tab === "Orders" && session) void refreshOrders(); }, [tab, session, refreshOrders]);

  const visibleProducts = useMemo(() => products.filter((product) => product.available && (categoryId == null || product.categoryId === categoryId)), [products, categoryId]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.product.discountedPrice ?? item.product.price) * item.quantity, 0), [cart]);
  const deliveryFee = delivery === "DELIVERY" && cartTotal > 0 && cartTotal < 499 ? 40 : 0;

  const signIn = async () => {
    setBusy(true); setAuthError("");
    try {
      if (registering) await authApi.register({ emailId: email.trim(), name: name.trim(), password, phoneNumber: phone });
      const next = await authApi.login(email.trim(), password);
      await saveSession(next); setSession(next);
    } catch (error) { setAuthError(apiMessage(error)); }
    finally { setBusy(false); }
  };

  const addItem = async (product: Product) => {
    if (!session) return;
    setBusy(true);
    try { await shopApi.addToCart(session.emailId, product.productId); await refreshCart(); Alert.alert("Added to cart", product.name); }
    catch (error) { Alert.alert("Could not add item", apiMessage(error)); }
    finally { setBusy(false); }
  };

  const changeCartQuantity = async (item: CartItem, amount: number) => {
    if (!session) return;
    setBusy(true);
    try {
      const next = item.quantity + amount;
      if (next <= 0) await shopApi.removeCartItem(session.emailId, item.product.productId);
      else await shopApi.setCartQuantity(session.emailId, item.product.productId, next);
      await refreshCart();
    } catch (error) { Alert.alert("Cart", apiMessage(error)); }
    finally { setBusy(false); }
  };

  const beginCheckout = async () => {
    if (!session) return;
    try {
      const saved = await shopApi.addresses(session.emailId);
      setAddresses(saved);
      const pinnedAddresses = saved.filter((address) => address.latitude != null && address.longitude != null);
      const preferred = pinnedAddresses.find((address) => address.isDefault) ?? pinnedAddresses[0];
      setSelectedAddress(preferred?.addressId ?? null);
      setCheckoutOpen(true);
    } catch (error) { Alert.alert("Checkout", apiMessage(error)); }
  };

  const pinCurrentLocation = async () => {
    setLocationBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) throw new Error("Location permission is required to check the 20 km service area.");
      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setPin({ latitude: current.coords.latitude, longitude: current.coords.longitude });
    } catch (error) { Alert.alert("Location unavailable", apiMessage(error)); }
    finally { setLocationBusy(false); }
  };

  const placeOrder = async () => {
    if (!session) return;
    setBusy(true);
    try {
      let addressId = selectedAddress ?? undefined;
      if (delivery === "DELIVERY" && !addressId) {
        if (!addressLine.trim() || !city.trim() || !state.trim() || !pincode.trim() || !pin) {
          throw new Error("Enter the delivery address and pin your location first.");
        }
        const created = await shopApi.addAddress(session.emailId, {
          label: "Home", line1: addressLine.trim(), line2: null, city: city.trim(), state: state.trim(),
          pincode: pincode.trim(), landmark: null, latitude: pin.latitude, longitude: pin.longitude,
        });
        addressId = created.addressId;
      }
      const chosenAddress = addresses.find((address) => address.addressId === addressId);
      if (delivery === "DELIVERY" && addressId && (chosenAddress?.latitude == null || chosenAddress.longitude == null) && !pin) {
        throw new Error("Choose an address with a location pin or add a new pinned address.");
      }
      const message = await shopApi.placeOrder({
        customerEmailId: session.emailId, deliveryType: delivery, addressId, paymentThrough: payment, dateOfDelivery: tomorrow(),
      });
      const orderId = parseOrderId(message);
      let paymentPending = false;
      if (payment === "ONLINE" && orderId) {
        try {
          const transaction = await shopApi.createDemoPayment(session.emailId, orderId);
          if (!transaction.simulated) throw new Error("The server is not configured for demo payments.");
          const outcome = await new Promise<"success" | "failure" | "cancel">((resolve) => Alert.alert(
            "Demo payment", "Choose a result for this simulated payment.", [
              { text: "Success", onPress: () => resolve("success") },
              { text: "Failure", style: "destructive", onPress: () => resolve("failure") },
              { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
            ], { cancelable: false },
          ));
          const result = await shopApi.verifyDemoPayment(session.emailId, {
            orderId, gatewayOrderId: transaction.gatewayOrderId,
            gatewayPaymentId: `demo_payment_${transaction.transactionId}`,
            gatewaySignature: outcome === "success" ? "SIMULATED_SUCCESS" : outcome === "failure" ? "SIMULATED_FAILURE" : "SIMULATED_CANCEL",
          });
          if (result?.status !== "CAPTURED") paymentPending = true;
        } catch { paymentPending = true; }
        if (paymentPending) {
          try { await shopApi.cancelDemoPayment(session.emailId, orderId); } catch { /* terminal payment outcome */ }
          try { await shopApi.cancelOrder(orderId); } catch { /* callback may have cancelled already */ }
        }
      }
      setCart([]); setCheckoutOpen(false); setTab("Orders"); await refreshOrders();
      Alert.alert(paymentPending ? "Order placed · payment pending" : "Order placed",
        orderId ? `Order #${orderId} is on its way to the shopkeeper.${paymentPending ? " Check its status before retrying payment." : ""}` : "Your order has been placed.");
    } catch (error) { Alert.alert("Order not placed", apiMessage(error)); }
    finally { setBusy(false); }
  };

  if (!session) return <KeyboardAvoidingView style={styles.authScreen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <StatusBar barStyle="light-content" backgroundColor={COLORS.maroon} />
    <Text style={styles.brand}>Mithai Junction</Text><Text style={styles.tagline}>Sweets, snacks and something refreshing.</Text>
    {registering && <><Field label="Name" value={name} onChangeText={setName} /><Field label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></>}
    <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
    <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
    {!!authError && <Text style={styles.errorText}>{authError}</Text>}
    <ActionButton title={busy ? "Please wait…" : registering ? "Create account" : "Sign in"} onPress={() => void signIn()} disabled={busy} />
    <Pressable onPress={() => { setRegistering(!registering); setAuthError(""); }}><Text style={styles.linkText}>{registering ? "Already have an account? Sign in" : "New here? Create an account"}</Text></Pressable>
  </KeyboardAvoidingView>;

  return <View style={styles.screen}>
    <StatusBar barStyle="dark-content" backgroundColor={COLORS.cream} />
    <View style={styles.header}><View><Text style={styles.brandSmall}>Mithai Junction</Text><Text style={styles.welcome}>Hi {session.name.split(" ")[0]}</Text></View><Pressable onPress={() => void refreshCart()}><Text style={styles.cartBubble}>Cart {cart.reduce((n, item) => n + item.quantity, 0)}</Text></Pressable></View>
    <View style={styles.tabs}>{(["Shop", "Cart", "Orders"] as Tab[]).map((item) => <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.tabActive]}><Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text></Pressable>)}</View>
    {tab === "Shop" && <><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
      <Chip label="All" active={categoryId === null} onPress={() => setCategoryId(null)} />
      {categories.map((category) => <Chip key={category.categoryId} label={category.name} active={categoryId === category.categoryId} onPress={() => setCategoryId(category.categoryId)} />)}
    </ScrollView><ScrollView contentContainerStyle={styles.list}>{visibleProducts.map((product) => <View key={product.productId} style={styles.productCard}>
      {(() => {
        const src = resolveProductImage(product.imageUrl);
        return src ? <Image source={{ uri: src }} style={styles.productImage} /> : <View style={[styles.productImage, styles.imageFallback]}><Text>🍬</Text></View>;
      })()}
      <View style={styles.productBody}><Text style={styles.productTitle}>{product.name}</Text><Text style={styles.muted}>{product.unitQuantity ?? ""} {product.unit?.toLowerCase()}</Text><Text style={styles.price}>{money(product.discountedPrice ?? product.price)}</Text><ActionButton title="Add to cart" onPress={() => void addItem(product)} disabled={busy || product.availableQuantity <= 0} /></View>
    </View>)}</ScrollView></>}
    {tab === "Cart" && <ScrollView contentContainerStyle={styles.list}>
      {cart.length === 0 ? <Text style={styles.empty}>Your cart is empty. Browse the shop to add some treats.</Text> : cart.map((item) => <View key={item.cartProductId} style={styles.rowCard}><View style={{ flex: 1 }}><Text style={styles.productTitle}>{item.product.name}</Text><Text style={styles.muted}>{money(item.product.discountedPrice ?? item.product.price)} each</Text><View style={styles.quantityRow}><Pressable disabled={busy} style={styles.quantityButton} onPress={() => void changeCartQuantity(item, -1)}><Text style={styles.quantityText}>−</Text></Pressable><Text style={styles.productTitle}>{item.quantity}</Text><Pressable disabled={busy} style={styles.quantityButton} onPress={() => void changeCartQuantity(item, 1)}><Text style={styles.quantityText}>+</Text></Pressable></View></View><Text style={styles.price}>{money(item.quantity * (item.product.discountedPrice ?? item.product.price))}</Text></View>)}
      {cart.length > 0 && <><Text style={styles.total}>Total: {money(cartTotal)}</Text><ActionButton title="Checkout" onPress={() => void beginCheckout()} /></>}
    </ScrollView>}
    {tab === "Orders" && <ScrollView contentContainerStyle={styles.list}><ActionButton title="Refresh orders" onPress={() => void refreshOrders()} />{orders.length === 0 ? <Text style={styles.empty}>No orders yet.</Text> : orders.map((order) => <View key={order.orderId} style={styles.rowCard}><View style={{ flex: 1 }}><Text style={styles.productTitle}>Order #{order.orderId}</Text><Text style={styles.muted}>{new Date(order.dateOfOrder).toLocaleString("en-IN")}</Text><Text style={styles.status}>{order.orderStatus === "PLACED" ? "New" : order.orderStatus === "CONFIRMED" ? "Accepted" : order.orderStatus === "PREPARING" ? "Packing" : order.orderStatus === "READY_FOR_PICKUP" ? order.deliveryType === "PICKUP" ? "Ready for pickup" : "Ready" : order.orderStatus === "DELIVERED" && order.deliveryType === "PICKUP" ? "Picked up" : order.orderStatus.replaceAll("_", " ")}</Text><Text style={styles.muted}>{order.deliveryType} · {order.paymentThrough} · Payment {order.paymentStatus}</Text><Text style={styles.muted}>{order.orderedProducts?.map((item) => `${item.product?.name ?? "Product"} × ${item.quantity}`).join(" · ")}</Text></View><Text style={styles.price}>{money(order.totalPrice)}</Text></View>)}</ScrollView>}
    <Pressable style={styles.signOut} onPress={() => { void saveSession(null); setSession(null); setCart([]); }}><Text style={styles.linkText}>Sign out</Text></Pressable>
    <Modal visible={checkoutOpen} animationType="slide" onRequestClose={() => setCheckoutOpen(false)}>
      <ScrollView contentContainerStyle={styles.checkout}><Text style={styles.brandSmall}>Checkout</Text><Text style={styles.sectionTitle}>Delivery method</Text>
        <View style={styles.tabs}><Choice label="Delivery" selected={delivery === "DELIVERY"} onPress={() => setDelivery("DELIVERY")} /><Choice label="Pickup" selected={delivery === "PICKUP"} onPress={() => setDelivery("PICKUP")} /></View>
        {delivery === "DELIVERY" && <><Text style={styles.muted}>Delivery is available within 20 km of the shop. Pin the drop-off location.</Text>
          {addresses.filter((address) => address.latitude != null && address.longitude != null).map((address) => <Pressable key={address.addressId} style={[styles.rowCard, selectedAddress === address.addressId && styles.selected]} onPress={() => setSelectedAddress(address.addressId)}><View><Text style={styles.productTitle}>{address.label ?? "Saved address"}</Text><Text style={styles.muted}>{address.line1}, {address.city} - {address.pincode}</Text></View></Pressable>)}
          {!!addresses.length && <Pressable onPress={() => { setSelectedAddress(null); setPin(null); }}><Text style={styles.linkDark}>Use a new address</Text></Pressable>}
          {!selectedAddress && <><Field label="Address line" value={addressLine} onChangeText={setAddressLine} /><Field label="City" value={city} onChangeText={setCity} /><Field label="State" value={state} onChangeText={setState} /><Field label="Pincode" value={pincode} onChangeText={setPincode} keyboardType="number-pad" />
            <ActionButton title={locationBusy ? "Finding location…" : pin ? "Location pinned ✓" : "Pin current location"} onPress={() => void pinCurrentLocation()} disabled={locationBusy} /></>}
        </>}
        <Text style={styles.sectionTitle}>Payment</Text><View style={styles.tabs}><Choice label="Cash on delivery" selected={payment === "COD"} onPress={() => setPayment("COD")} /><Choice label="Demo payment" selected={payment === "ONLINE"} onPress={() => setPayment("ONLINE")} /></View>
        <Text style={styles.muted}>Demo payment never charges real money.</Text>
        <Text style={styles.muted}>Delivery: {deliveryFee === 0 ? "Free" : money(deliveryFee)} · Total: {money(cartTotal + deliveryFee)}</Text>
        <ActionButton title={busy ? "Placing order…" : `Place order · ${money(cartTotal + deliveryFee)}`} onPress={() => void placeOrder()} disabled={busy || (delivery === "DELIVERY" && !selectedAddress && !pin)} />
        <Pressable onPress={() => setCheckoutOpen(false)}><Text style={styles.linkText}>Back to cart</Text></Pressable>
      </ScrollView>
    </Modal>
  </View>;
}

const COLORS = { maroon: "#681e2b", cream: "#fff9ee", ink: "#311d1d", muted: "#756466", border: "#eadfda", gold: "#b87719", green: "#e7f5eb" };
function Field(props: { label: string; value: string; onChangeText: (value: string) => void; secureTextEntry?: boolean; keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad"; autoCapitalize?: "none" | "sentences" }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{props.label}</Text><TextInput value={props.value} onChangeText={props.onChangeText} style={styles.input} secureTextEntry={props.secureTextEntry} keyboardType={props.keyboardType ?? "default"} autoCapitalize={props.autoCapitalize} /></View>;
}
function ActionButton({ title, onPress, disabled = false }: { title: string; onPress: () => void; disabled?: boolean }) {
  return <Pressable onPress={onPress} disabled={disabled} style={[styles.button, disabled && { opacity: 0.55 }]}><Text style={styles.buttonText}>{title}</Text></Pressable>;
}
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}
function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.choice, selected && styles.selected]}><Text style={[styles.choiceText, selected && { color: COLORS.maroon }]}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream, paddingTop: 48 },
  authScreen: { flex: 1, justifyContent: "center", backgroundColor: COLORS.maroon, paddingHorizontal: 28, paddingTop: 24 },
  brand: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 8 },
  tagline: { color: "#f1dfe0", marginBottom: 32, fontSize: 16 },
  brandSmall: { color: COLORS.maroon, fontSize: 23, fontWeight: "800" },
  welcome: { color: COLORS.muted, marginTop: 3 },
  header: { paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cartBubble: { backgroundColor: "#f2e3d0", color: COLORS.maroon, fontWeight: "700", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18 },
  tabs: { flexDirection: "row", marginHorizontal: 16, marginBottom: 12, backgroundColor: "#f0e9e4", borderRadius: 14, padding: 4 },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  tabActive: { backgroundColor: "#fff", borderRadius: 11 },
  tabText: { color: COLORS.muted, fontWeight: "600" },
  tabTextActive: { color: COLORS.maroon },
  chips: { gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  chip: { borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: COLORS.maroon, borderColor: COLORS.maroon },
  chipText: { color: COLORS.ink }, chipTextActive: { color: "#fff" },
  list: { padding: 16, gap: 12, paddingBottom: 36 },
  productCard: { backgroundColor: "#fff", borderColor: COLORS.border, borderWidth: 1, borderRadius: 18, overflow: "hidden", flexDirection: "row" },
  productImage: { width: 112, height: 150, backgroundColor: "#f5e7d9" }, imageFallback: { alignItems: "center", justifyContent: "center" },
  productBody: { flex: 1, padding: 12, justifyContent: "center", gap: 5 },
  productTitle: { color: COLORS.ink, fontSize: 16, fontWeight: "700" },
  muted: { color: COLORS.muted, fontSize: 13 },
  price: { color: COLORS.maroon, fontSize: 16, fontWeight: "800" },
  rowCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: COLORS.border },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 9 },
  quantityButton: { width: 31, height: 31, borderRadius: 16, backgroundColor: "#f2e3d0", alignItems: "center", justifyContent: "center" },
  quantityText: { color: COLORS.maroon, fontSize: 20, fontWeight: "700", marginTop: -2 },
  total: { textAlign: "right", fontWeight: "800", color: COLORS.maroon, fontSize: 18, marginVertical: 8 },
  button: { backgroundColor: COLORS.maroon, alignItems: "center", borderRadius: 13, paddingHorizontal: 15, paddingVertical: 12, marginTop: 7 },
  buttonText: { color: "#fff", fontWeight: "700" },
  status: { color: "#237148", backgroundColor: COLORS.green, alignSelf: "flex-start", overflow: "hidden", borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, marginTop: 6, fontSize: 11, fontWeight: "700" },
  empty: { color: COLORS.muted, textAlign: "center", marginTop: 36, paddingHorizontal: 20 },
  signOut: { alignItems: "center", padding: 10 },
  linkText: { color: "#fff", textAlign: "center", marginTop: 18, fontWeight: "600" },
  linkDark: { color: COLORS.maroon, marginVertical: 8, fontWeight: "700" },
  errorText: { color: "#ffd4d4", marginBottom: 8 },
  field: { marginBottom: 12 }, fieldLabel: { color: "#d9c4c7", marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 12, color: COLORS.ink },
  checkout: { backgroundColor: COLORS.cream, paddingTop: 55, paddingHorizontal: 18, paddingBottom: 40, gap: 12, flexGrow: 1 },
  sectionTitle: { color: COLORS.ink, fontWeight: "800", fontSize: 16, marginTop: 8 },
  choice: { flex: 1, padding: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: "#fff", borderRadius: 12 },
  choiceText: { textAlign: "center", color: COLORS.ink, fontWeight: "600" },
  selected: { borderColor: COLORS.maroon, borderWidth: 2, backgroundColor: "#faeff0" },
});
