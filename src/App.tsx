import { FormEvent, useMemo, useState, useEffect } from "react";

type Role = "user" | "vendor";
type Tab = "shop" | "track" | "cart" | "history" | "vendor" | "about";
type Cart = Record<number, number>;

type Product = {
  id: number;
  name: string;
  vendor: string;
  area: string;
  price: number;
  mrp: number;
  weight: string;
  category: string;
  image: string;
  localAlt: string;
  rating: number;
  stock: number;
};

type Order = {
  id: string;
  items: string;
  amount: number;
  address: string;
  status: "Preparing" | "Confirmed" | "Rejected" | "Rider assigned" | "On the way" | "Delivered";
  when: string;
};

const starterProducts: Product[] = [
  {
    id: 1,
    name: "Dabur Red Paste",
    vendor: "Ravi Kirana Store",
    area: "Sector 14, Gandhinagar",
    price: 55,
    mrp: 95,
    weight: "200 g",
    category: "Care",
    localAlt: "Colgate alternative",
    rating: 4.8,
    stock: 18,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 2,
    name: "Patanjali Kanti Soap",
    vendor: "Patel General Store",
    area: "Ring Road, Ahmedabad",
    price: 39,
    mrp: 85,
    weight: "150 g",
    category: "Care",
    localAlt: "Dove alternative",
    rating: 4.6,
    stock: 25,
    image: "https://images.unsplash.com/photo-1607006483224-512c11757212?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 3,
    name: "Haldiram Bhujia",
    vendor: "Ravi Kirana Store",
    area: "Sector 14, Gandhinagar",
    price: 20,
    mrp: 20,
    weight: "90 g",
    category: "Snacks",
    localAlt: "Chips alternative",
    rating: 4.9,
    stock: 40,
    image: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 4,
    name: "Toor Dal Premium",
    vendor: "Sharma Bazaar",
    area: "CG Road, Ahmedabad",
    price: 138,
    mrp: 160,
    weight: "1 kg",
    category: "Grocery",
    localAlt: "Local mill packed",
    rating: 4.7,
    stock: 31,
    image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 5,
    name: "Khadi Herbal Shampoo",
    vendor: "Apna Desi Mart",
    area: "Navrangpura",
    price: 155,
    mrp: 220,
    weight: "210 ml",
    category: "Care",
    localAlt: "Imported shampoo alternative",
    rating: 4.5,
    stock: 14,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 6,
    name: "Cold Pressed Groundnut Oil",
    vendor: "Patel General Store",
    area: "Ring Road, Ahmedabad",
    price: 245,
    mrp: 285,
    weight: "1 L",
    category: "Grocery",
    localAlt: "Refined oil alternative",
    rating: 4.8,
    stock: 12,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80",
  },
];

const categories = ["All", "Grocery", "Care", "Snacks"];
const words = ["Local", "Fast", "Fresh", "Swadeshi"];

const trackingSteps: { status: Order["status"]; title: string; banner: string; emoji: string }[] = [
  { status: "Preparing", title: "Order Placed", banner: "Your order has been placed with the local vendor", emoji: "📝" },
  { status: "Confirmed", title: "Vendor Confirmed", banner: "Vendor accepted your order — being packed now", emoji: "✅" },
  { status: "Rider assigned", title: "Picked Up From Shop", banner: "Rider has collected your order from the shop", emoji: "📦" },
  { status: "On the way", title: "On The Way", banner: "Rider is heading to your address — arriving soon!", emoji: "🛵" },
  { status: "Delivered", title: "Delivered", banner: "Order delivered. Thanks for buying local!", emoji: "🎉" },
];

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
}

function TrackOrder({ order, updateStatus, notify }: { order: Order; updateStatus: (id: string, s: Order["status"]) => void; notify: (m: string) => void }) {
  const validStatuses = trackingSteps.map((s) => s.status);
  const initialIndex = order.status === "Rejected" ? -1 : Math.max(0, validStatuses.indexOf(order.status));
  const [stepIndex, setStepIndex] = useState(initialIndex);

  useEffect(() => {
    setStepIndex(order.status === "Rejected" ? -1 : Math.max(0, validStatuses.indexOf(order.status)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  useEffect(() => {
    if (order.status === "Rejected") return;
    if (stepIndex >= trackingSteps.length - 1) return;
    // Pause at "Preparing" — wait for vendor to confirm before auto-progressing
    if (stepIndex === 0) return;
    const timer = window.setTimeout(() => {
      const nextIdx = stepIndex + 1;
      setStepIndex(nextIdx);
      updateStatus(order.id, trackingSteps[nextIdx].status);
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [stepIndex, order.id, order.status, updateStatus]);

  const currentStep = stepIndex >= 0 ? trackingSteps[stepIndex] : null;
  const isRejected = order.status === "Rejected";
  const eta = Math.max(2, 25 - stepIndex * 6);
  const now = new Date();
  const baseTime = now.getTime() - 12 * 60000;

  // Path for the bike to follow on the map (SVG coordinates within viewBox 0 0 100 100)
  const bikePath = "M 18,15 C 25,30 35,40 50,45 S 70,60 80,80";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-[#ede5d5]">
        <div className={`px-5 py-5 text-center text-white ${isRejected ? "bg-red-500" : "bg-[#48b445]"}`}>
          <p className="font-['Baloo_2'] text-3xl font-extrabold">
            {isRejected ? "Order Rejected" : currentStep?.title || "Tracking..."}
          </p>
          <p className="text-white/85">
            {isRejected ? "Vendor could not fulfill this order" : `Arriving in ${eta} minutes`}
          </p>
        </div>
        <div className="relative h-[460px] overflow-hidden sm:h-[560px]">
          <GoogleMap query={`Sector 14 Gandhinagar to ${order.address}`} className="h-full" />
          
          {/* Animated bike route */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {/* Background path (light) */}
            <path d={bikePath} fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
            {/* Animated dashed path */}
            <path className="route-dash" d={bikePath} fill="none" stroke="#2677ea" strokeWidth="2.4" strokeLinecap="round" />
            
            {/* Shop pin (start) */}
            <g transform="translate(18,15)">
              <circle r="2.5" fill="#0f7a2f" />
              <circle className="pulse-dot" r="2.5" fill="#0f7a2f" opacity="0.5" />
            </g>
            
            {/* Home pin (end) */}
            <g transform="translate(80,80)">
              <circle r="2.5" fill="#e8650a" />
              <circle className="pulse-dot" r="2.5" fill="#e8650a" opacity="0.5" />
            </g>
            
            {/* Animated bike emoji moving along the path */}
            {!isRejected && stepIndex >= 2 && (
              <g>
                <text fontSize="7" textAnchor="middle" dominantBaseline="central">
                  🛵
                  <animateMotion dur="14s" repeatCount="indefinite" rotate="auto" path={bikePath} />
                </text>
              </g>
            )}
          </svg>

          {/* Shop label */}
          <div className="absolute left-2 top-2 max-w-[180px] rounded-xl bg-white/95 px-3 py-2 text-xs shadow-lg sm:left-4 sm:top-4">
            <strong className="block text-[#0f7a2f]">🏪 Shop Pickup</strong>
            <span className="text-[#777]">Local vendor</span>
          </div>

          {/* Home label */}
          <div className="absolute bottom-4 right-4 max-w-[200px] rounded-xl bg-white/95 px-3 py-2 text-xs shadow-lg">
            <strong className="block text-[#e8650a]">🏠 Your Home</strong>
            <span className="line-clamp-1 text-[#777]">{order.address}</span>
          </div>

          {/* Bottom status banner like Zomato */}
          {!isRejected && currentStep && (
            <div key={stepIndex} className="status-banner absolute bottom-0 left-0 right-0 bg-white/98 backdrop-blur-md px-5 py-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f5e9] text-2xl">{currentStep.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0f7a2f]">Live Status</p>
                  <p className="line-clamp-1 font-['Baloo_2'] text-base font-bold text-[#1b2a5c]">{currentStep.banner}</p>
                </div>
                <div className="grid h-10 w-10 animate-pulse place-items-center rounded-full bg-[#0f7a2f] text-white">●</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar: Timeline + actions */}
      <aside className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#ede5d5]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Order Tracking</p>
          <h2 className="font-['Baloo_2'] text-2xl font-extrabold text-[#1b2a5c]">{order.id}</h2>
          <p className="mt-1 text-sm text-[#777]">{order.items}</p>
          <p className="mt-1 text-sm font-bold text-[#0f7a2f]">Total: Rs.{order.amount}</p>

          {/* Vertical timeline */}
          <div className="mt-6 space-y-0">
            {trackingSteps.map((step, idx) => {
              const isDone = !isRejected && idx <= stepIndex;
              const isCurrent = !isRejected && idx === stepIndex;
              const time = new Date(baseTime + idx * 5 * 60000);
              return (
                <div key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
                  {idx < trackingSteps.length - 1 && (
                    <div className={`absolute left-[14px] top-7 h-full w-[2px] ${isDone ? "bg-[#0f7a2f]" : "bg-[#e0d4c0]"}`} />
                  )}
                  <div className={`relative z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                    isCurrent ? "bg-[#0f7a2f] text-white ring-4 ring-[#0f7a2f]/20" : 
                    isDone ? "bg-[#0f7a2f] text-white" : "bg-[#f0e8d8] text-[#aaa]"
                  }`}>
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className={`font-['Baloo_2'] font-bold ${isDone ? "text-[#1b2a5c]" : "text-[#aaa]"}`}>
                      {step.title}
                    </p>
                    {isDone && (
                      <p className="text-xs text-[#777]">{formatTime(time)} · {idx === stepIndex ? "Just now" : "Completed"}</p>
                    )}
                    {!isDone && idx === stepIndex + 1 && (
                      <p className="text-xs text-[#bf6000]">Up next...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {isRejected && (
            <div className="mt-4 rounded-xl bg-red-50 p-4">
              <p className="font-bold text-red-600">❌ This order was rejected by the vendor</p>
              <p className="mt-1 text-xs text-red-500">No payment will be charged.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-[#fff3e0] p-5">
          <p className="font-['Baloo_2'] text-lg font-bold text-[#bf6000]">Need help with this order?</p>
          <div className="mt-3 grid gap-2">
            <button onClick={() => notify("Calling rider Anirudh on +91 98XXX XXXXX...")} className="rounded-xl bg-white py-3 text-sm font-bold text-[#bf6000]">📞 Call Rider</button>
            <button onClick={() => notify("Support ticket opened. We will contact you in 5 minutes.")} className="rounded-xl bg-white py-3 text-sm font-bold text-[#bf6000]">💬 Contact Support</button>
          </div>
        </div>
      </aside>
    </div>
  );
}

function GoogleMap({ query, className = "" }: { query: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#eaf4e6] ${className}`}>
      <iframe
        title={`Google Map ${query}`}
        className="absolute inset-0 h-full w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
      />
    </div>
  );
}

function DynamicWord() {
  return (
    <span className="relative inline-grid h-[1.15em] overflow-hidden align-bottom text-[#ffb347] w-[5.5ch] sm:w-[6ch]">
      {words.map((word, index) => (
        <span
          key={word}
          className="word-cycle absolute inset-0 flex items-center whitespace-nowrap"
          style={{ animationDelay: `${index * 1.8}s` }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

function AuthScreen({ onEnter }: { onEnter: (role: Role, name: string, address: string) => void }) {
  const [role, setRole] = useState<Role>("user");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Sector 14, Gandhinagar");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 10) {
      setError("Enter your name and a valid 10 digit phone number.");
      return;
    }
    onEnter(role, name.trim(), address.trim() || "Gandhinagar");
  }

  return (
    <main className="min-h-screen bg-[#fff8ee] text-[#222]">
      <section className="relative isolate min-h-screen overflow-hidden bg-[#102052] text-white">
        <GoogleMap query="local market Gandhinagar Gujarat" className="absolute inset-0 -z-20 opacity-25 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1b2a5c] via-[#1b2a5c]/95 to-[#e8650a]/75" />
        <div className="mx-auto grid min-h-screen max-w-6xl gap-8 px-5 py-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-10 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#e8650a] font-['Baloo_2'] text-xl font-extrabold">स्व</span>
              <span>
                <span className="block font-['Baloo_2'] text-3xl font-extrabold leading-none">Swa<span className="text-[#ffb347]">deshi</span></span>
                <span className="text-xs uppercase tracking-[0.22em] text-white/65">Apna Desh, Apna Bazaar</span>
              </span>
            </div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/65">Swadeshi: Local items, delivered fast</p>
            <h1 className="font-['Baloo_2'] text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[1.1] tracking-tight">
              <div className="mb-1">Enter as</div>
              <DynamicWord />
              <div className="mt-1 text-[clamp(2rem,6vw,3.5rem)] text-white/90">buyer or vendor.</div>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/78">
              Buyers can shop from photos, order multiple products, and track riders. Vendors can list products, set a map location, and see buyer history.
            </p>
          </div>

          <form onSubmit={submit} className="rounded-3xl bg-white p-5 text-[#222] shadow-2xl shadow-black/25 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Strict sign up</p>
            <h2 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Continue to Swadeshi</h2>
            <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#fff3e0] p-2">
              <button type="button" onClick={() => setRole("user")} className={`rounded-xl py-3 font-['Baloo_2'] font-bold transition ${role === "user" ? "bg-[#e8650a] text-white" : "text-[#8d6a33]"}`}>Buyer</button>
              <button type="button" onClick={() => setRole("vendor")} className={`rounded-xl py-3 font-['Baloo_2'] font-bold transition ${role === "vendor" ? "bg-[#0f7a2f] text-white" : "text-[#53745d]"}`}>Vendor</button>
            </div>
            <div className="mt-5 grid gap-3">
              <label className="text-sm font-bold text-[#777]">{role === "vendor" ? "Owner or shop name" : "Full name"}<input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-[#e0d4c0] px-3 py-3 font-normal outline-none focus:border-[#e8650a]" placeholder={role === "vendor" ? "Ravi Kirana Store" : "Amit Patel"} /></label>
              <label className="text-sm font-bold text-[#777]">Phone number<input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-xl border border-[#e0d4c0] px-3 py-3 font-normal outline-none focus:border-[#e8650a]" placeholder="9876543210" /></label>
              <label className="text-sm font-bold text-[#777]">{role === "vendor" ? "Shop address" : "Delivery address"}<input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded-xl border border-[#e0d4c0] px-3 py-3 font-normal outline-none focus:border-[#e8650a]" /></label>
            </div>
            {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">{error}</p>}
            <button className="mt-5 w-full rounded-2xl bg-[#1b2a5c] py-4 font-['Baloo_2'] text-lg font-extrabold text-white transition hover:-translate-y-0.5">
              Sign up and enter as {role === "vendor" ? "Vendor" : "Buyer"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [session, setSession] = useState<{ role: Role; name: string; address: string } | null>(() => {
    const saved = localStorage.getItem("swadeshi_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("swadeshi_products");
    return saved ? JSON.parse(saved) : starterProducts;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("swadeshi_orders");
    return saved ? JSON.parse(saved) : [
      { id: "SWD-2089", items: "Khadi Herbal Shampoo x 1, Patanjali Kanti Soap x 2", amount: 233, address: "Plot 22, Vastrapur", status: "Preparing", when: "Just now" },
      { id: "SWD-2076", items: "Cold Pressed Groundnut Oil x 1", amount: 245, address: "Bopal Road, Ahmedabad", status: "Preparing", when: "5 min ago" },
      { id: "SWD-1042", items: "Dabur Red Paste, Haldiram Bhujia", amount: 75, address: "Sector 14, Gandhinagar", status: "On the way", when: "Today" },
      { id: "SWD-1031", items: "Toor Dal Premium x 2", amount: 276, address: "Office, CG Road", status: "Delivered", when: "Yesterday" }
    ];
  });

  const [tab, setTab] = useState<Tab>("shop");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Cart>({});
  const [toast, setToast] = useState("");
  const [activeOrder, setActiveOrder] = useState<Order>(orders[0] || { id: "0", items: "", amount: 0, address: "", status: "Preparing", when: "" });
  const [vendorForm, setVendorForm] = useState({ name: "", price: "", mrp: "", weight: "", category: "Grocery", image: "", stock: "" });

  function updateOrderStatus(id: string, newStatus: Order["status"]) {
    setOrders((current) => current.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));
    if (activeOrder.id === id) {
      setActiveOrder((current) => ({ ...current, status: newStatus }));
    }
    notify(`Order ${id} updated to ${newStatus}`);
  }

  useEffect(() => {
    localStorage.setItem("swadeshi_session", JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem("swadeshi_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("swadeshi_orders", JSON.stringify(orders));
  }, [orders]);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesText = !text || [product.name, product.vendor, product.category, product.localAlt].some((value) => value.toLowerCase().includes(text));
      const matchesCategory = category === "All" || product.category === category;
      return matchesText && matchesCategory;
    });
  }, [category, products, search]);

  const cartProducts = products.filter((product) => cart[product.id]);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = cartProducts.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  function updateQty(id: number, delta: number) {
    setCart((current) => {
      const product = products.find((item) => item.id === id);
      const nextQty = Math.max(0, Math.min(product?.stock || 99, (current[id] || 0) + delta));
      const next = { ...current, [id]: nextQty };
      if (nextQty === 0) delete next[id];
      return next;
    });
  }

  function checkout() {
    if (!cartCount) {
      notify("Add at least one product before checkout.");
      setTab("shop");
      return;
    }
    const nextOrder: Order = {
      id: `SWD-${Math.floor(2000 + Math.random() * 7000)}`,
      items: cartProducts.map((product) => `${product.name} x ${cart[product.id]}`).join(", "),
      amount: cartTotal,
      address: session?.address || "Gandhinagar",
      status: "Preparing",
      when: "Now",
    };
    setActiveOrder(nextOrder);
    setOrders((current) => [nextOrder, ...current]);
    setCart({});
    setTab("track");
    notify("Order placed. Rider will be assigned soon.");
  }

  function reorder(order: Order) {
    const nextCart: Cart = {};
    products.forEach((product) => {
      if (order.items.toLowerCase().includes(product.name.toLowerCase())) nextCart[product.id] = 1;
    });
    setCart(nextCart);
    setTab("cart");
    notify(nextCart[Object.keys(nextCart)[0] as unknown as number] ? "Products added again." : "Similar products are shown in cart.");
  }

  function addVendorProduct(event: FormEvent) {
    event.preventDefault();
    if (!vendorForm.name.trim() || Number(vendorForm.price) <= 0) {
      notify("Enter product name and valid price.");
      return;
    }
    const product: Product = {
      id: Date.now(),
      name: vendorForm.name.trim(),
      vendor: session?.name || "Your Store",
      area: session?.address || "Your locality",
      price: Number(vendorForm.price),
      mrp: Number(vendorForm.mrp) || Number(vendorForm.price),
      weight: vendorForm.weight || "1 pc",
      category: vendorForm.category,
      image: vendorForm.image || "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=500&q=80",
      localAlt: "Added by local vendor",
      rating: 4.5,
      stock: Number(vendorForm.stock) || 10,
    };
    setProducts((current) => [product, ...current]);
    setVendorForm({ name: "", price: "", mrp: "", weight: "", category: "Grocery", image: "", stock: "" });
    notify("Product is live for nearby buyers.");
  }

  if (!session) return <AuthScreen onEnter={(role, name, address) => { setSession({ role, name, address }); setTab(role === "vendor" ? "vendor" : "shop"); }} />;

  const navItems: [Tab, string][] = session.role === "vendor"
    ? [["vendor", "Vendor"], ["shop", "Market"], ["track", "Track"], ["history", "Sales"], ["about", "About"]]
    : [["shop", "Shop"], ["track", "Track"], ["cart", `Cart ${cartCount || ""}`], ["history", "History"], ["about", "About"]];

  return (
    <main className="min-h-screen bg-[#fff8ee] text-[#222]">
      <section className="relative isolate overflow-hidden bg-[#102052] text-white">
        <GoogleMap query={`${session.address} local shops`} className="absolute inset-0 -z-20 opacity-25 grayscale" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1b2a5c] via-[#1b2a5c]/95 to-[#e8650a]/70" />
        <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <button className="flex items-center gap-3 text-left" onClick={() => setTab(session.role === "vendor" ? "vendor" : "shop")}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8650a] font-['Baloo_2'] text-xl font-extrabold">स्व</span>
              <span><span className="block font-['Baloo_2'] text-2xl font-extrabold leading-none">Swa<span className="text-[#ffb347]">deshi</span></span><span className="text-xs uppercase tracking-[0.22em] text-white/65">{session.role === "vendor" ? "Vendor dashboard" : "Buyer app"}</span></span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => notify(`Location set to ${session.address}`)} className="hidden rounded-full bg-white/12 px-4 py-2 text-sm font-bold backdrop-blur sm:block">Use location</button>
              <button onClick={() => { setSession(null); localStorage.removeItem("swadeshi_session"); }} className="rounded-full border border-white/25 px-4 py-2 text-sm font-bold">Logout</button>
            </div>
          </header>
          <div className="max-w-3xl pb-8 pt-16 sm:pt-20">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-white/65">Welcome, {session.name}</p>
            <h1 className="font-['Baloo_2'] text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[1.1] tracking-tight">
              <div className="flex flex-wrap items-center gap-x-4">
                <span>Buy</span>
                <DynamicWord />
              </div>
              <div className="mt-1">Support Bharat.</div>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/78">A persistent local commerce flow with sign up, photo products, multi-item cart, Google Maps, live delivery tracking, and real order records.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => setTab(session.role === "vendor" ? "vendor" : "shop")} className="rounded-full bg-[#e8650a] px-6 py-3 font-['Baloo_2'] font-bold shadow-xl shadow-black/20 transition hover:-translate-y-0.5">{session.role === "vendor" ? "Add Product" : "Start Shopping"}</button>
              <button onClick={() => setTab("track")} className="rounded-full border border-white/35 px-6 py-3 font-['Baloo_2'] font-bold backdrop-blur transition hover:bg-white/10">Track Order</button>
            </div>
          </div>
          <div className="h-1 rounded-full bg-gradient-to-r from-[#e8650a] via-white to-[#0f7a2f]" />
        </div>
      </section>

      <nav className="sticky top-0 z-30 border-b border-[#f0e8d8] bg-white/95 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-5 text-center font-['Baloo_2'] text-sm font-bold text-[#7f7668]">
          {navItems.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`border-b-4 px-2 py-4 transition ${tab === id ? "border-[#e8650a] text-[#e8650a]" : "border-transparent hover:text-[#1b2a5c]"}`}>{label}</button>)}
        </div>
      </nav>

      {toast && <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1b2a5c] px-5 py-3 text-sm font-bold text-white shadow-2xl">{toast}</div>}

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-8 lg:px-10">
        {tab === "shop" && (
          <div className="space-y-10 pb-24">
            {/* Search and filters */}
            <div className="space-y-4">
              <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[#ede5d5]">
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none" placeholder="Search for dal, soap, oil, vendor..." />
                <button onClick={() => notify(`${filtered.length} products found near you.`)} className="rounded-xl bg-[#0f7a2f] px-5 py-3 font-['Baloo_2'] font-bold text-white">Search</button>
              </div>
              <div className="flex gap-2 overflow-auto pb-1">
                {categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap ${category === item ? "bg-[#e8650a] text-white" : "bg-white text-[#777] ring-1 ring-[#ede5d5]"}`}>{item}</button>)}
              </div>
            </div>

            {/* Pro tip banner */}
            <div className="rounded-2xl bg-gradient-to-r from-[#fff3e0] to-[#ffe0c2] px-5 py-4 ring-1 ring-[#eadcc7]">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#bf6000]">Swadeshi Pro Tip 💡</p>
              <p className="mt-1 text-sm text-[#7f6043]">Buy from vendors within 2km for the fastest 30-minute local delivery.</p>
            </div>

            {/* Products full-width grid */}
            <div>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Photo Products</p>
                  <h2 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Order multiple local items</h2>
                </div>
                <button onClick={() => setTab("cart")} className="rounded-full bg-[#fff3e0] px-4 py-2 text-sm font-bold text-[#bf6000]">View cart: Rs.{cartTotal}</button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filtered.map((product) => {
                  const qty = cart[product.id] || 0;
                  return (
                    <article key={product.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#ede5d5] transition hover:-translate-y-1 hover:shadow-xl">
                      <button onClick={() => notify(`${product.name}: ${product.stock} in stock at ${product.vendor}.`)} className="relative block h-40 w-full bg-[#fff2e0] text-left">
                        <img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply" />
                        <span className="absolute bottom-2 left-2 rounded-md bg-[#0f7a2f] px-2 py-1 text-xs font-bold text-white">★ {product.rating}</span>
                        <span className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-xs font-bold text-[#1b2a5c]">{product.weight}</span>
                      </button>
                      <div className="p-3">
                        <p className="line-clamp-1 font-['Baloo_2'] text-lg font-bold text-[#1b2a5c]">{product.name}</p>
                        <p className="line-clamp-1 text-xs text-[#888]">{product.vendor}</p>
                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-[#0f7a2f]">{product.localAlt}</p>
                        <div className="mt-2 flex items-end gap-2"><strong className="text-xl">Rs.{product.price}</strong><span className="text-sm text-[#999] line-through">Rs.{product.mrp}</span></div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <button onClick={() => notify(`${product.name} saved to favourites.`)} className="rounded-full border border-[#eadcc7] px-3 py-2 text-lg leading-none text-[#1b2a5c]">♡</button>
                          {qty === 0 ? <button onClick={() => { updateQty(product.id, 1); notify(`${product.name} added to cart.`); }} className="flex-1 rounded-full bg-[#4ba3ff] px-3 py-2 font-['Baloo_2'] font-bold text-white">Add</button> : <div className="flex flex-1 items-center overflow-hidden rounded-full bg-[#4ba3ff] font-bold text-white"><button onClick={() => updateQty(product.id, -1)} className="px-3 py-2">-</button><span className="flex-1 bg-white py-2 text-center text-[#1b2a5c]">{qty}</span><button onClick={() => updateQty(product.id, 1)} className="px-3 py-2">+</button></div>}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            
            {/* Map at bottom */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-[#ede5d5]">
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Nearby vendors</p>
                <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Google Map: Discover Local Shops</h3>
              </div>
              <GoogleMap query={`kirana stores near ${session.address}`} className="h-96 sm:h-[500px]" />
              <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                <button onClick={() => setSearch("Ravi")} className="rounded-2xl bg-[#fff3e0] p-5 text-left transition hover:shadow-lg hover:ring-2 hover:ring-[#e8650a]">
                  <strong className="block font-['Baloo_2'] text-xl text-[#1b2a5c]">Ravi Kirana</strong>
                  <span className="text-sm font-bold text-[#0f7a2f]">0.4 km · Open Now</span>
                </button>
                <button onClick={() => setSearch("Patel")} className="rounded-2xl bg-[#fff3e0] p-5 text-left transition hover:shadow-lg hover:ring-2 hover:ring-[#e8650a]">
                  <strong className="block font-['Baloo_2'] text-xl text-[#1b2a5c]">Patel Store</strong>
                  <span className="text-sm font-bold text-[#0f7a2f]">1.1 km · Delivery</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky bottom cart bar - shows when items in cart on Shop tab */}
        {tab === "shop" && cartCount > 0 && (
          <div className="fixed bottom-4 left-1/2 z-40 w-[95%] max-w-3xl -translate-x-1/2 rounded-2xl bg-[#1b2a5c] p-3 text-white shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-['Baloo_2'] text-lg font-extrabold leading-tight">Rs.{cartTotal}</p>
                <p className="text-xs text-white/70">{cartCount} item(s) in cart</p>
              </div>
              <button onClick={() => setTab("cart")} className="rounded-xl bg-white/15 px-4 py-2.5 text-sm font-bold backdrop-blur transition hover:bg-white/25">View Cart</button>
              <button onClick={checkout} className="rounded-xl bg-[#e8650a] px-5 py-2.5 font-['Baloo_2'] font-bold transition hover:scale-105">Place Order →</button>
            </div>
          </div>
        )}

        {tab === "cart" && (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#ede5d5] sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Cart</p>
              <h2 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Review your basket</h2>
              <div className="mt-5 space-y-4">
                {cartProducts.length === 0 && (
                  <div className="rounded-2xl bg-[#fff3e0] p-8 text-center">
                    <p className="text-4xl">🛒</p>
                    <p className="mt-2 font-['Baloo_2'] text-xl font-bold text-[#8d6a33]">Your cart is empty</p>
                    <p className="mt-1 text-sm text-[#a08660]">Browse and add products from the shop.</p>
                    <button onClick={() => setTab("shop")} className="mt-4 rounded-full bg-[#e8650a] px-6 py-2 font-bold text-white">Browse Products</button>
                  </div>
                )}
                {cartProducts.map((product) => (
                  <div key={product.id} className="overflow-hidden rounded-2xl border border-[#ede5d5] bg-white">
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      {/* Product image - fills width on mobile, fixed on larger */}
                      <img src={product.image} alt={product.name} className="h-44 w-full rounded-xl object-cover sm:h-28 sm:w-32 sm:flex-shrink-0" />
                      
                      {/* Product info */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <strong className="font-['Baloo_2'] text-lg font-bold text-[#1b2a5c]">{product.name}</strong>
                          <button onClick={() => updateQty(product.id, -cart[product.id])} className="text-sm text-red-500 hover:text-red-700" title="Remove">✕</button>
                        </div>
                        <p className="text-sm text-[#888]">{product.vendor} · {product.weight}</p>
                        <p className="text-xs text-[#0f7a2f]">{product.localAlt}</p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-base font-bold text-[#1b2a5c]">Rs.{product.price}</span>
                          <span className="text-sm text-[#999] line-through">Rs.{product.mrp}</span>
                        </div>
                      </div>
                      
                      {/* Quantity + total */}
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="flex items-center overflow-hidden rounded-full bg-[#4ba3ff] font-bold text-white">
                          <button onClick={() => updateQty(product.id, -1)} className="px-4 py-2">-</button>
                          <span className="bg-white px-5 py-2 text-[#1b2a5c]">{cart[product.id]}</span>
                          <button onClick={() => updateQty(product.id, 1)} className="px-4 py-2">+</button>
                        </div>
                        <strong className="font-['Baloo_2'] text-xl text-[#1b2a5c]">Rs.{product.price * cart[product.id]}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl bg-[#1b2a5c] p-5 text-white">
                <p className="font-['Baloo_2'] text-2xl font-extrabold">Payment summary</p>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-white/70">Subtotal</span><span>Rs.{cartTotal}</span></div>
                  <div className="flex justify-between"><span className="text-white/70">Delivery</span><span className="text-[#48b445]">FREE</span></div>
                </div>
                <p className="mt-4 text-sm text-white/70">Deliver to: <strong className="text-white">{session.address}</strong></p>
                <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4">
                  <span className="font-bold">Total</span>
                  <span className="font-['Baloo_2'] text-2xl font-extrabold">Rs.{cartTotal}</span>
                </div>
                <button onClick={checkout} className="mt-4 w-full rounded-xl bg-[#e8650a] py-3 font-['Baloo_2'] font-bold transition hover:scale-[1.02]">Confirm Order</button>
                <button onClick={() => setTab("shop")} className="mt-3 w-full rounded-xl border border-white/25 py-3 font-['Baloo_2'] font-bold">Add More Items</button>
              </div>
            </aside>
          </div>
        )}

        {tab === "track" && <TrackOrder order={activeOrder} updateStatus={updateOrderStatus} notify={notify} />}

        {tab === "vendor" && (
          <div className="space-y-10">
            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <form onSubmit={addVendorProduct} className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#ede5d5]"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Vendor Panel</p><h2 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Add product</h2><div className="mt-5 grid gap-3"><input value={vendorForm.image} onChange={(e) => setVendorForm({ ...vendorForm, image: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none" placeholder="Product photo URL" /><input value={vendorForm.name} onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none" placeholder="Product name" /><div className="grid grid-cols-2 gap-3"><input value={vendorForm.price} onChange={(e) => setVendorForm({ ...vendorForm, price: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none" placeholder="Price" /><input value={vendorForm.mrp} onChange={(e) => setVendorForm({ ...vendorForm, mrp: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none" placeholder="MRP" /></div><div className="grid grid-cols-2 gap-3"><input value={vendorForm.weight} onChange={(e) => setVendorForm({ ...vendorForm, weight: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none" placeholder="Weight" /><input value={vendorForm.stock} onChange={(e) => setVendorForm({ ...vendorForm, stock: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none" placeholder="Stock" /></div><select value={vendorForm.category} onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })} className="rounded-xl border border-[#e0d4c0] px-3 py-3 outline-none"><option>Grocery</option><option>Care</option><option>Snacks</option></select><button className="rounded-xl bg-gradient-to-r from-[#e8650a] to-[#e8882a] py-3 font-['Baloo_2'] text-lg font-bold text-white">Make Product Live</button><button type="button" onClick={() => { setVendorForm({ ...vendorForm, image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=500&q=80" }); notify("Demo photo added."); }} className="rounded-xl border border-[#eadcc7] py-3 font-bold text-[#1b2a5c]">Use Demo Photo</button></div></form>
              <div className="space-y-5">
                {/* Pending orders awaiting vendor action — always visible header */}
                <div className="rounded-3xl bg-gradient-to-br from-[#fff8ee] to-[#fff3e0] p-5 shadow-lg ring-2 ring-[#e8650a]">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-10 w-10 place-items-center rounded-full bg-[#e8650a] text-xl text-white ${orders.some((o) => o.status === "Preparing") ? "animate-pulse" : ""}`}>!</span>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#bf6000]">Action needed</p>
                        <h3 className="font-['Baloo_2'] text-2xl font-extrabold text-[#1b2a5c]">
                          Pending Orders ({orders.filter((o) => o.status === "Preparing").length})
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const demo: Order = {
                          id: `SWD-${Math.floor(2000 + Math.random() * 7000)}`,
                          items: "Demo: Toor Dal x 1, Patanjali Soap x 2",
                          amount: 215,
                          address: "Demo Buyer, " + (session?.address || "Local"),
                          status: "Preparing",
                          when: "Just now",
                        };
                        setOrders((current) => [demo, ...current]);
                        notify("New demo order received!");
                      }}
                      className="rounded-xl bg-[#1b2a5c] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d1840]"
                    >
                      + Add Demo Order
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    {orders.filter((o) => o.status === "Preparing").length === 0 ? (
                      <div className="rounded-2xl bg-white/60 p-6 text-center">
                        <p className="text-3xl">✅</p>
                        <p className="mt-2 font-bold text-[#0f7a2f]">All caught up!</p>
                        <p className="text-sm text-[#7f6043]">No pending orders right now. Click "Add Demo Order" to test the flow.</p>
                      </div>
                    ) : (
                      orders.filter((o) => o.status === "Preparing").map((order) => (
                        <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p className="font-['Baloo_2'] text-lg font-bold text-[#1b2a5c]">{order.id}</p>
                              <p className="text-sm text-[#555]">{order.items}</p>
                              <p className="mt-1 text-xs text-[#888]">📍 {order.address}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-['Baloo_2'] text-2xl font-extrabold text-[#0f7a2f]">Rs.{order.amount}</p>
                              <p className="text-xs text-[#999]">{order.when}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => { updateOrderStatus(order.id, "Confirmed"); notify(`Order ${order.id} confirmed!`); }}
                              className="flex-1 rounded-xl bg-[#0f7a2f] py-2.5 font-['Baloo_2'] font-bold text-white transition hover:bg-[#0a5a22]"
                            >
                              ✓ Confirm Order
                            </button>
                            <button
                              onClick={() => { updateOrderStatus(order.id, "Rejected"); notify(`Order ${order.id} rejected.`); }}
                              className="flex-1 rounded-xl bg-red-500 py-2.5 font-['Baloo_2'] font-bold text-white transition hover:bg-red-600"
                            >
                              ✕ Reject Order
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Buyer History Table */}
                <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#ede5d5]">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Buyer History</p>
                  <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">What sold, how much, where</h3>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead className="bg-[#fff3e0] font-['Baloo_2'] text-[#e8650a]">
                        <tr>
                          <th className="p-3">Order</th>
                          <th className="p-3">Product</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Where</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-[#f5ede0]">
                            <td className="p-3 font-bold text-[#1b2a5c]">{order.id}</td>
                            <td className="p-3">{order.items}</td>
                            <td className="p-3">Rs.{order.amount}</td>
                            <td className="p-3">{order.address}</td>
                            <td className="p-3">
                              <div className="flex flex-col gap-2">
                                <span className={`font-bold ${order.status === "Rejected" ? "text-red-500" : "text-[#0f7a2f]"}`}>{order.status}</span>
                                {order.status === "Preparing" && (
                                  <div className="flex gap-1">
                                    <button onClick={() => updateOrderStatus(order.id, "Confirmed")} className="rounded-md bg-[#0f7a2f] px-2 py-1 text-xs text-white">Confirm</button>
                                    <button onClick={() => updateOrderStatus(order.id, "Rejected")} className="rounded-md bg-red-500 px-2 py-1 text-xs text-white">Reject</button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-[#ede5d5]">
              <div className="p-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Shop location</p>
                <h3 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Google Map: Manage Your Shop Location</h3>
                <p className="text-sm text-[#777]">Confirm where buyers and riders should arrive for pickup.</p>
              </div>
              <GoogleMap query={session.address} className="h-96 sm:h-[500px]" />
              <div className="p-6">
                <button onClick={() => notify(`Pickup pin saved at ${session.address}.`)} className="rounded-xl bg-[#0f7a2f] px-8 py-3 font-bold text-white shadow-lg transition hover:scale-105">Save Current Location as Shop Pin</button>
              </div>
            </div>
          </div>
        )}

{tab === "history" && (
  <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#ede5d5]">
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">{session.role === "vendor" ? "Sales History" : "Order History"}</p>
    <h2 className="font-['Baloo_2'] text-3xl font-extrabold text-[#1b2a5c]">Past activity</h2>
    <div className="mt-5 space-y-3">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-[#ede5d5] p-4">
          <div className="flex flex-wrap justify-between gap-2">
            <strong className="text-[#1b2a5c]">{order.id}</strong>
            <span className="text-sm text-[#999]">{order.when}</span>
          </div>
          <p className="mt-1 font-semibold">{order.items}</p>
          <p className="text-sm text-[#777]">Rs.{order.amount} · {order.address}</p>
          <p className={`mt-2 text-sm font-bold ${order.status === "Rejected" ? "text-red-500" : "text-[#0f7a2f]"}`}>Status: {order.status}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {session.role === "vendor" ? (
              order.status === "Preparing" && (
                <>
                  <button onClick={() => updateOrderStatus(order.id, "Confirmed")} className="rounded-full bg-[#0f7a2f] px-4 py-2 text-sm font-bold text-white">Confirm Order</button>
                  <button onClick={() => updateOrderStatus(order.id, "Rejected")} className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white">Reject Order</button>
                </>
              )
            ) : (
              <>
                <button onClick={() => { setActiveOrder(order); setTab("track"); }} className="rounded-full bg-[#e8f5e9] px-4 py-2 text-sm font-bold text-[#0f7a2f]">Track</button>
                <button onClick={() => reorder(order)} className="rounded-full bg-[#fff3e0] px-4 py-2 text-sm font-bold text-[#bf6000]">Reorder</button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

        {tab === "about" && <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#ede5d5]"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#999]">Our Mission</p><h2 className="font-['Baloo_2'] text-4xl font-extrabold text-[#1b2a5c]">Useful local delivery for Bharat</h2><p className="mt-4 leading-8 text-[#555]">Swadeshi now works like a real life marketplace prototype: account entry, role based screens, interactive cart, product creation, Google Maps, rider tracking, support, order history, and vendor sales history.</p></div>}
      </section>
    </main>
  );
}
