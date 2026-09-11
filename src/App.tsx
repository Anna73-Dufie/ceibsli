// Alethia Clothing — Full E-Commerce App
import React, { useState, useEffect, useMemo } from "react";
import "./styles.css";

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const B = {
  cream:       "#FDF8F3",
  ivory:       "#F5EDE2",
  rose:        "#C4896A",
  rosePale:    "#FAEEE8",
  roseDeep:    "#9A5E44",
  gold:        "#C9A87C",
  goldLight:   "#EAD8BC",
  charcoal:    "#2A2420",
  ink:         "#1A1612",
  muted:       "#8A7E78",
  mutedLight:  "#B8AEA8",
  border:      "#EAE0D8",
  borderLight: "#F5F0EC",
  white:       "#FFFFFF",
  success:     "#5A8A6A",
};
const SERIF = '"Playfair Display", Georgia, serif';
const SANS  = '"Inter", "Helvetica Neue", sans-serif';

// ─── Types ────────────────────────────────────────────────────────────────────
type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";
type Page = "home" | "shop" | "product" | "cart" | "checkout" | "confirmation" | "about";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  details: string[];
  category: string[];
  colors: { name: string; hex: string }[];
  sizes: Size[];
  images: string[];
  tag?: "New" | "Bestseller" | "Limited" | "Sale";
  featured?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
  size: Size;
  color: string;
}

// ─── Product Catalogue ────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Rosette Floral Midi",
    price: 195,
    description:
      "A romantically draped floral midi dress in lightweight chiffon. Blooming florals in soft blush and sage dance across a cream foundation — perfect for garden parties and sun-drenched afternoons.",
    details: [
      "100% polyester chiffon",
      "Midi length — knee to lower calf",
      "V-neckline with flutter sleeves",
      "Hidden side zip closure",
      "Hand wash cold; lay flat to dry",
    ],
    category: ["Casual", "Midi"],
    colors: [{ name: "Blush", hex: "#E8B4A8" }, { name: "Sage", hex: "#A8B89A" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "New",
    featured: true,
  },
  {
    id: 2,
    name: "Midnight Velvet Gown",
    price: 485,
    description:
      "Sculpted from rich crushed velvet, this floor-length evening gown commands every room. A deep cowl back and long sleeves create an air of powerful femininity and old-world glamour.",
    details: [
      "Crushed velvet blend",
      "Floor-length silhouette",
      "Cowl neckline and open back",
      "Fully lined",
      "Dry clean only",
    ],
    category: ["Formal", "Maxi"],
    colors: [{ name: "Midnight", hex: "#1A1428" }, { name: "Bordeaux", hex: "#6B2737" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1517690623533-b4c8f3fe30e8?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "Bestseller",
    featured: true,
  },
  {
    id: 3,
    name: "Breezy Wrap Dress",
    price: 145,
    description:
      "The quintessential everyday dress — an effortless wrap silhouette in soft crepe that flatters every shape. Adjustable tie waist, flowing skirt, and V-neckline make this your go-to.",
    details: [
      "Stretch crepe fabric",
      "Adjustable wrap closure",
      "Below-the-knee midi length",
      "Machine washable, cold",
    ],
    category: ["Casual", "Midi"],
    colors: [
      { name: "Terracotta", hex: "#C4785A" },
      { name: "Cream", hex: "#F5EDE2" },
      { name: "Navy", hex: "#2B3A5C" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=80",
    ],
    featured: true,
  },
  {
    id: 4,
    name: "Côte d'Azur Mini",
    price: 128,
    description:
      "Inspired by the French Riviera, this off-shoulder mini radiates sun-soaked charm. Breezy cotton poplin, a smocked bodice, and a flouncy skirt make it as pretty as it is playful.",
    details: [
      "100% cotton poplin",
      "Smocked off-shoulder bodice",
      "Mini length",
      "Machine washable",
    ],
    category: ["Casual", "Mini"],
    colors: [{ name: "Sky Blue", hex: "#87BDDC" }, { name: "White", hex: "#F9F7F4" }],
    sizes: ["XS", "S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "New",
  },
  {
    id: 5,
    name: "Riviera Linen Shirt Dress",
    price: 168,
    description:
      "Clean lines meet relaxed luxury in this belted linen shirt dress. Oversized buttons, a relaxed collar, and a self-tie belt give it effortless polish from morning to evening.",
    details: [
      "100% European linen",
      "Relaxed shirt-style collar",
      "Self-tie belt included",
      "Midi length",
      "Machine wash gentle cycle",
    ],
    category: ["Casual", "Midi"],
    colors: [
      { name: "Natural", hex: "#D4C4A8" },
      { name: "Sand", hex: "#C2A88A" },
      { name: "Slate", hex: "#8A9BAB" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=700&q=80",
    ],
  },
  {
    id: 6,
    name: "Pearl Satin Slip",
    price: 265,
    description:
      "Effortless elegance in liquid satin. Bias-cut to move beautifully with the body, with delicate adjustable straps and a subtle cowl neck that catches the light just so.",
    details: [
      "Satin-finish fabric",
      "Bias cut for fluid drape",
      "Adjustable spaghetti straps",
      "Midi length",
      "Dry clean recommended",
    ],
    category: ["Formal", "Midi"],
    colors: [
      { name: "Pearl", hex: "#EDE0D0" },
      { name: "Blush", hex: "#DCB0A0" },
      { name: "Champagne", hex: "#D4BC8C" },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1566206091558-7f218b696731?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "Bestseller",
    featured: true,
  },
  {
    id: 7,
    name: "Obsidian Bodycon",
    price: 215,
    description:
      "Precision-engineered stretch fabric wraps the body in second-skin confidence. A subtle scoop back and clean minimal neckline keep this sleek mini in the sophisticated realm.",
    details: [
      "Stretch ponte fabric",
      "Figure-hugging silhouette",
      "Mini length with scoop back",
      "Machine wash cold",
    ],
    category: ["Formal", "Mini"],
    colors: [{ name: "Black", hex: "#1C1C1C" }, { name: "Espresso", hex: "#3C2818" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?auto=format&fit=crop&w=700&q=80",
    ],
  },
  {
    id: 8,
    name: "Bohème Maxi",
    price: 228,
    description:
      "Free-spirited and beautifully fluid, this tiered boho maxi is made for long summer days. Delicate lace-trim at the hem and a prairie neckline make it utterly romantic.",
    details: [
      "Viscose blend",
      "Tiered maxi skirt",
      "Lace hem and sleeve detail",
      "Smocked back for fit",
      "Hand wash cold",
    ],
    category: ["Boho", "Maxi", "Casual"],
    colors: [
      { name: "Ivory", hex: "#F0E8D8" },
      { name: "Dusty Rose", hex: "#D4A8A0" },
      { name: "Rust", hex: "#B86448" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "New",
    featured: true,
  },
  {
    id: 9,
    name: "Garden Party Sundress",
    price: 158,
    description:
      "Woven from soft floral cotton, this sundress is the picture of a perfect summer afternoon. Square neckline, built-in smocked bodice, and a full midi skirt bring feminine joy.",
    details: [
      "100% cotton",
      "Built-in smocked bodice",
      "Square neckline with thin straps",
      "Midi length",
      "Machine washable",
    ],
    category: ["Casual", "Midi"],
    colors: [{ name: "Meadow", hex: "#A8C4A0" }, { name: "Lavender", hex: "#C4B8D8" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=700&q=80",
    ],
  },
  {
    id: 10,
    name: "La Petite Noire",
    price: 245,
    description:
      "The definitive little black dress, reimagined. A clean A-line silhouette, structured bodice, and subtle high-low hem give this wardrobe staple a fresh, editorial edge.",
    details: [
      "Structured crepe fabric",
      "A-line silhouette",
      "High-low hem detail",
      "Hidden back zip",
      "Dry clean only",
    ],
    category: ["Formal", "Mini"],
    colors: [{ name: "Black", hex: "#1C1C1C" }],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1504703395950-b89145a5425b?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "Bestseller",
  },
  {
    id: 11,
    name: "Terracotta Wrap",
    price: 178,
    originalPrice: 215,
    description:
      "Rich terracotta tones in silky jersey — this midi hugs curves gracefully while remaining entirely comfortable. A statement dress that looks anything but effortless.",
    details: [
      "Stretch jersey blend",
      "Adjustable wrap tie",
      "Midi length, V-neckline",
      "Machine wash cold",
    ],
    category: ["Casual", "Midi"],
    colors: [{ name: "Terracotta", hex: "#C4785A" }, { name: "Sienna", hex: "#A85C3C" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1562137369-1a1a0bc73a0b?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "Sale",
  },
  {
    id: 12,
    name: "Champagne Chiffon Gown",
    price: 395,
    description:
      "A sweep of champagne chiffon cascades into an elegant floor-length gown. Delicate plissé pleating, a one-shoulder neckline, and a subtle train make this the ultimate occasion dress.",
    details: [
      "Layered pleated chiffon",
      "One-shoulder neckline",
      "Floor-length with subtle train",
      "Fully lined",
      "Dry clean only",
    ],
    category: ["Formal", "Maxi"],
    colors: [{ name: "Champagne", hex: "#D4BC8C" }, { name: "Rose Gold", hex: "#D4A89C" }],
    sizes: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1623091411395-09e79fdbfcf3?auto=format&fit=crop&w=700&q=80",
      "https://images.unsplash.com/photo-1585837575652-267ba8b7ae0b?auto=format&fit=crop&w=700&q=80",
    ],
    tag: "Limited",
    featured: true,
  },
];

// ─── Cart Storage ─────────────────────────────────────────────────────────────
const CART_KEY = "alethia_cart_v1";

function loadCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem(CART_KEY) ?? "[]"); } catch { return []; }
}
function saveCart(c: CartItem[]) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$${n.toFixed(2)}`;

function useWindowWidth() {
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1024));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

const TAG_COLORS: Record<string, string> = {
  New: B.rose, Bestseller: B.gold, Limited: "#7C6CAA", Sale: B.success,
};

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]         = useState<Page>("home");
  const [selected, setSel]      = useState<Product | null>(null);
  const [cart, setCart]         = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderNum, setOrderNum] = useState("");

  useEffect(() => { saveCart(cart); }, [cart]);

  const navigate = (p: Page, product?: Product) => {
    if (product) setSel(product);
    setPage(p);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const idx = prev.findIndex(
        i => i.product.id === item.product.id && i.size === item.size && i.color === item.color
      );
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = { ...u[idx], quantity: u[idx].quantity + item.quantity };
        return u;
      }
      return [...prev, item];
    });
    setCartOpen(true);
  };

  const updateQty = (idx: number, delta: number) => {
    setCart(prev => {
      const u = [...prev];
      const nq = u[idx].quantity + delta;
      if (nq <= 0) u.splice(idx, 1);
      else u[idx] = { ...u[idx], quantity: nq };
      return u;
    });
  };

  const removeFromCart = (idx: number) => setCart(prev => prev.filter((_, i) => i !== idx));

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const placeOrder = () => {
    const n = "ALT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setOrderNum(n);
    setCart([]);
    navigate("confirmation");
  };

  const shared = { navigate, addToCart, cart, cartCount, cartTotal, updateQty, removeFromCart };

  return (
    <div style={{ minHeight: "100vh", background: B.cream, fontFamily: SANS }}>
      <Header cartCount={cartCount} navigate={navigate} page={page} onCartOpen={() => setCartOpen(true)} />

      {cartOpen && (
        <>
          <div onClick={() => setCartOpen(false)} className="fade-in"
            style={{ position: "fixed", inset: 0, background: "rgba(26,22,18,0.5)", zIndex: 299 }} />
          <CartSidebar
            cart={cart} cartTotal={cartTotal} onClose={() => setCartOpen(false)}
            updateQty={updateQty} removeFromCart={removeFromCart}
            navigate={(p) => { setCartOpen(false); navigate(p); }}
          />
        </>
      )}

      {page === "home"         && <HomePage        {...shared} />}
      {page === "shop"         && <ShopPage         {...shared} />}
      {page === "product" && selected && <ProductDetailPage product={selected} {...shared} />}
      {page === "cart"         && <CartPage         {...shared} placeOrder={placeOrder} />}
      {page === "checkout"     && <CheckoutPage     {...shared} placeOrder={placeOrder} />}
      {page === "confirmation" && <ConfirmationPage orderNum={orderNum} navigate={navigate} />}
      {page === "about"        && <AboutPage        navigate={navigate} />}

      <Footer navigate={navigate} />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header({ cartCount, navigate, page, onCartOpen }: {
  cartCount: number; navigate: (p: Page) => void; page: Page; onCartOpen: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useWindowWidth() < 768;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const links: { label: string; page: Page }[] = [
    { label: "Home", page: "home" },
    { label: "Shop", page: "shop" },
    { label: "About", page: "about" },
  ];

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(253,248,243,0.97)" : B.cream,
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: `1px solid ${scrolled ? B.border : "transparent"}`,
      boxShadow: scrolled ? "0 2px 20px rgba(42,36,32,0.07)" : "none",
      transition: "all 0.3s",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: isMobile ? "0 20px" : "0 40px",
        height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Logo */}
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 20 : 24, color: B.charcoal, fontWeight: 500, letterSpacing: "0.02em", lineHeight: 1 }}>
            Alethia
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.24em", color: B.muted, textTransform: "uppercase" }}>
            Clothing
          </div>
        </button>

        {/* Desktop nav */}
        {!isMobile && (
          <nav style={{ display: "flex", gap: 36 }}>
            {links.map(l => (
              <button key={l.page} onClick={() => navigate(l.page)} style={{ background: "none", border: "none" }}>
                <span className={`nav-link ${page === l.page ? "active" : ""}`}>{l.label}</span>
              </button>
            ))}
          </nav>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Cart */}
          <button onClick={onCartOpen} style={{ background: "none", border: "none", position: "relative", cursor: "pointer", padding: 6 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={B.charcoal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 0, right: 0,
                width: 16, height: 16, borderRadius: "50%",
                background: B.rose, color: B.white,
                fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{cartCount}</span>
            )}
          </button>

          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={B.charcoal} strokeWidth="2" strokeLinecap="round">
                {menuOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div className="fade-in" style={{ background: B.cream, borderTop: `1px solid ${B.border}`, padding: "16px 24px 24px" }}>
          {links.map(l => (
            <button key={l.page} onClick={() => { navigate(l.page); setMenuOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none",
                borderBottom: `1px solid ${B.borderLight}`, padding: "14px 0",
                fontFamily: SERIF, fontStyle: "italic", fontSize: 20,
                color: page === l.page ? B.rose : B.charcoal, cursor: "pointer" }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSidebar({ cart, cartTotal, onClose, updateQty, removeFromCart, navigate }: {
  cart: CartItem[]; cartTotal: number; onClose: () => void;
  updateQty: (i: number, d: number) => void; removeFromCart: (i: number) => void;
  navigate: (p: Page) => void;
}) {
  return (
    <div className="cart-sidebar">
      <div style={{ padding: "20px 24px", borderBottom: `1px solid ${B.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, color: B.charcoal }}>Your Bag</div>
          <div style={{ fontSize: 11, color: B.muted, marginTop: 2 }}>{cart.length} item{cart.length !== 1 ? "s" : ""}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, opacity: 0.6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={B.charcoal} strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: cart.length === 0 ? "60px 24px" : "20px 24px" }}>
        {cart.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🛍️</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: B.charcoal, marginBottom: 8 }}>Your bag is empty</div>
            <p style={{ fontSize: 13, color: B.muted, marginBottom: 24 }}>Add something beautiful.</p>
            <button className="btn-dark" onClick={() => navigate("shop")}>Shop Dresses</button>
          </div>
        ) : (
          cart.map((item, i) => (
            <div key={`${item.product.id}-${item.size}-${item.color}`} style={{
              display: "flex", gap: 14,
              paddingBottom: 18, marginBottom: 18,
              borderBottom: i < cart.length - 1 ? `1px solid ${B.borderLight}` : "none",
            }}>
              <div style={{ width: 72, height: 90, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: B.ivory }}>
                <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 500, color: B.charcoal, marginBottom: 2, lineHeight: 1.3 }}>{item.product.name}</div>
                <div style={{ fontSize: 11, color: B.muted, marginBottom: 8 }}>{item.size} · {item.color}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button className="qty-btn" onClick={() => updateQty(i, -1)}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: "center" }}>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(i, 1)}>+</button>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: B.charcoal }}>{fmt(item.product.price * item.quantity)}</div>
                </div>
              </div>
              <button onClick={() => removeFromCart(i)} style={{ background: "none", border: "none", cursor: "pointer", alignSelf: "flex-start", padding: 2, opacity: 0.4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B.charcoal} strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div style={{ padding: "18px 24px 32px", borderTop: `1px solid ${B.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: B.muted, marginBottom: 5 }}>
            <span>Subtotal</span>
            <span style={{ color: B.charcoal, fontWeight: 600 }}>{fmt(cartTotal)}</span>
          </div>
          <div style={{ fontSize: 11, color: B.mutedLight, marginBottom: 18 }}>Shipping & taxes calculated at checkout.</div>
          <button className="btn-dark" onClick={() => navigate("checkout")} style={{ width: "100%", marginBottom: 10, padding: "15px" }}>Checkout</button>
          <button className="btn-outline-dark" onClick={() => navigate("cart")} style={{ width: "100%", padding: "14px" }}>View Full Bag</button>
        </div>
      )}
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────
function HomePage({ navigate }: {
  navigate: (p: Page, product?: Product) => void;
  addToCart: (item: CartItem) => void;
  cart: CartItem[]; cartCount: number; cartTotal: number;
  updateQty: (i: number, d: number) => void; removeFromCart: (i: number) => void;
}) {
  const isMobile = useWindowWidth() < 768;
  const featured = PRODUCTS.filter(p => p.featured);

  return (
    <>
      {/* ── Hero ── */}
      <section style={{ position: "relative", height: isMobile ? "85vh" : "100vh", minHeight: isMobile ? 480 : 600, display: "flex", alignItems: "center", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=85)",
          backgroundSize: "cover", backgroundPosition: "center 20%",
          transition: "transform 8s ease",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(26,22,18,0.74) 0%, rgba(26,22,18,0.42) 55%, rgba(26,22,18,0.12) 100%)" }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1280, margin: "0 auto", padding: isMobile ? "0 28px" : "0 80px", width: "100%" }}>
          <div style={{ maxWidth: 580 }}>
            <div className="fade-up" style={{ fontSize: 11, letterSpacing: "0.24em", color: "rgba(253,248,243,0.6)", textTransform: "uppercase", fontWeight: 600, marginBottom: 22 }}>
              Women's Boutique Dresses
            </div>
            <h1 className="fade-up delay-1" style={{
              fontFamily: SERIF, fontStyle: "italic",
              fontSize: isMobile ? 52 : 86,
              fontWeight: 400, lineHeight: 1.07,
              color: B.cream, marginBottom: 22, letterSpacing: "-0.01em",
            }}>
              Alethia<br />Clothing
            </h1>
            <p className="fade-up delay-2" style={{ fontSize: isMobile ? 16 : 20, color: "rgba(253,248,243,0.72)", fontWeight: 300, letterSpacing: "0.05em", marginBottom: 44, fontFamily: SANS }}>
              Dressed in grace.
            </p>
            <div className="fade-up delay-3" style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button className="btn-rose" onClick={() => navigate("shop")} style={{ padding: isMobile ? "12px 26px" : "15px 36px", fontSize: isMobile ? 11 : 12 }}>
                Shop Dresses
              </button>
              <button className="btn-outline-light" onClick={() => navigate("about")} style={{ padding: isMobile ? "11px 26px" : "14px 36px", fontSize: isMobile ? 11 : 12 }}>
                Our Story
              </button>
            </div>
          </div>
        </div>
        {!isMobile && (
          <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ width: 1, height: 52, background: "rgba(253,248,243,0.28)" }} />
            <div style={{ fontSize: 9, color: "rgba(253,248,243,0.38)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Scroll</div>
          </div>
        )}
      </section>

      {/* ── Brand strip ── */}
      <div style={{ background: B.charcoal, padding: isMobile ? "20px" : "20px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "center", gap: isMobile ? 22 : 56, flexWrap: "wrap" }}>
          {[["🚚", "Free Shipping $150+"], ["♻️", "Ethically Sourced"], ["✨", "Complimentary Styling"], ["↩️", "30-Day Returns"]].map(([icon, text]) => (
            <div key={String(text)} style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(253,248,243,0.62)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── New Arrivals ── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: B.rose, textTransform: "uppercase", marginBottom: 12 }}>The Edit</div>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 34 : 50, fontWeight: 400, color: B.charcoal }}>New Arrivals</h2>
            <div style={{ width: 44, height: 1, background: B.gold, margin: "18px auto 0" }} />
          </div>
          <div className="featured-grid">
            {featured.map((p, i) => (
              <div key={p.id} className={`fade-up delay-${(i % 6) + 1}`}>
                <ProductCard product={p} navigate={navigate} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button className="btn-outline-dark" onClick={() => navigate("shop")}>View All Dresses</button>
          </div>
        </div>
      </section>

      {/* ── Quote banner ── */}
      <section style={{ background: B.ivory, borderTop: `1px solid ${B.border}`, borderBottom: `1px solid ${B.border}`, padding: isMobile ? "52px 28px" : "84px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontSize: isMobile ? 44 : 60, color: B.goldLight, fontFamily: SERIF, lineHeight: 0.7, marginBottom: 22 }}>"</div>
          <p style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 20 : 30, fontWeight: 400, color: B.charcoal, lineHeight: 1.55, marginBottom: 22 }}>
            Every woman deserves to feel like she walked out of a painting.
          </p>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: B.muted, textTransform: "uppercase" }}>— Amara Osei, Founder</div>
        </div>
      </section>

      {/* ── Shop by Style ── */}
      <section style={{ padding: isMobile ? "52px 20px" : "80px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: B.rose, textTransform: "uppercase", marginBottom: 12 }}>Explore</div>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 30 : 44, fontWeight: 400, color: B.charcoal }}>Shop by Style</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: isMobile ? 12 : 18 }}>
            {[
              { label: "Casual",  img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=75" },
              { label: "Formal",  img: "https://images.unsplash.com/photo-1517690623533-b4c8f3fe30e8?auto=format&fit=crop&w=500&q=75" },
              { label: "Maxi",    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=500&q=75" },
              { label: "Boho",    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=75" },
            ].map(cat => (
              <StyleTile key={cat.label} label={cat.label} img={cat.img} onClick={() => navigate("shop")} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function StyleTile({ label, img, onClick, isMobile }: { label: string; img: string; onClick: () => void; isMobile: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ position: "relative", aspectRatio: "3/4", border: "none", overflow: "hidden", borderRadius: 8, cursor: "pointer", background: B.ivory, display: "block" }}>
      <img src={img} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hover ? "scale(1.06)" : "scale(1)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(26,22,18,0.58) 0%, transparent 55%)" }} />
      <div style={{ position: "absolute", bottom: isMobile ? 14 : 18, left: 0, right: 0, textAlign: "center" }}>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 18 : 24, color: B.cream, fontWeight: 400 }}>{label}</span>
      </div>
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product: p, navigate }: {
  product: Product; navigate: (pg: Page, product?: Product) => void;
}) {
  return (
    <div className="product-card" onClick={() => navigate("product", p)}>
      <div className="card-img">
        <img src={p.images[0]} alt={p.name} loading="lazy" />
        {p.tag && (
          <div style={{ position: "absolute", top: 12, left: 12, background: TAG_COLORS[p.tag] ?? B.rose, color: B.white, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 2 }}>
            {p.tag}
          </div>
        )}
      </div>
      <div style={{ padding: "15px 16px 20px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: B.rose, textTransform: "uppercase", marginBottom: 5 }}>{p.category[0]}</div>
        <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, color: B.charcoal, marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: B.charcoal }}>{fmt(p.price)}</span>
          {p.originalPrice && <span style={{ fontSize: 12, color: B.mutedLight, textDecoration: "line-through" }}>{fmt(p.originalPrice)}</span>}
        </div>
        <div style={{ display: "flex", gap: 5, marginTop: 10, flexWrap: "wrap" }}>
          {p.colors.slice(0, 4).map(c => (
            <div key={c.name} title={c.name} style={{ width: 13, height: 13, borderRadius: "50%", background: c.hex, border: "1px solid rgba(42,36,32,0.15)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shop Page ────────────────────────────────────────────────────────────────
function ShopPage({ navigate }: {
  navigate: (p: Page, product?: Product) => void;
  addToCart: (item: CartItem) => void;
  cart: CartItem[]; cartCount: number; cartTotal: number;
  updateQty: (i: number, d: number) => void; removeFromCart: (i: number) => void;
}) {
  const isMobile = useWindowWidth() < 768;
  const [activeFilter, setFilter] = useState("All");
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc" | "newest">("featured");

  const FILTERS = ["All", "Casual", "Formal", "Boho", "Mini", "Midi", "Maxi"];

  const list = useMemo(() => {
    let items = activeFilter === "All" ? PRODUCTS : PRODUCTS.filter(p => p.category.includes(activeFilter));
    if (sort === "price-asc")  items = [...items].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") items = [...items].sort((a, b) => b.price - a.price);
    if (sort === "newest")     items = [...items].sort((a) => (a.tag === "New" ? -1 : 0));
    if (sort === "featured")   items = [...items].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    return items;
  }, [activeFilter, sort]);

  return (
    <div style={{ paddingTop: 68 }}>
      <div style={{ background: B.ivory, borderBottom: `1px solid ${B.border}`, padding: isMobile ? "36px 20px 28px" : "56px 40px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: B.rose, textTransform: "uppercase", marginBottom: 10 }}>Our Collection</div>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 36 : 54, fontWeight: 400, color: B.charcoal, marginBottom: 10 }}>Shop All Dresses</h1>
          <p style={{ fontSize: 14, color: B.muted, maxWidth: 480, lineHeight: 1.7 }}>Curated with intention — every dress in the Alethia collection is designed to make you feel extraordinary.</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "28px 20px" : "36px 40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button key={f} className={`filter-chip ${activeFilter === f ? "active" : ""}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: B.muted }}>{list.length} items</span>
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
              style={{ padding: "8px 12px", border: `1px solid ${B.border}`, borderRadius: 4, fontSize: 12, color: B.charcoal, background: B.white, outline: "none", cursor: "pointer" }}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>

        <div className="product-grid">
          {list.map((p, i) => (
            <div key={p.id} className={`fade-up delay-${Math.min((i % 6) + 1, 6)}`}>
              <ProductCard product={p} navigate={navigate} />
            </div>
          ))}
        </div>

        {list.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: B.charcoal, marginBottom: 12 }}>No dresses found</div>
            <button className="btn-outline-dark" onClick={() => setFilter("All")}>Clear Filter</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Detail ───────────────────────────────────────────────────────────
function ProductDetailPage({ product: p, navigate, addToCart }: {
  product: Product;
  navigate: (pg: Page, product?: Product) => void;
  addToCart: (item: CartItem) => void;
  cart: CartItem[]; cartCount: number; cartTotal: number;
  updateQty: (i: number, d: number) => void; removeFromCart: (i: number) => void;
}) {
  const isMobile = useWindowWidth() < 1024;
  const [mainImg, setMainImg]     = useState(0);
  const [selSize, setSize]        = useState<Size | null>(null);
  const [selColor, setColor]      = useState(p.colors[0].name);
  const [qty, setQty]             = useState(1);
  const [detailsOpen, setDetails] = useState(false);
  const [added, setAdded]         = useState(false);

  useEffect(() => { setMainImg(0); setSize(null); setColor(p.colors[0].name); setQty(1); setAdded(false); }, [p.id]);

  const related = PRODUCTS.filter(r => r.id !== p.id && r.category.some(c => p.category.includes(c))).slice(0, 4);

  const handleAdd = () => {
    if (!selSize) { alert("Please select a size."); return; }
    addToCart({ product: p, quantity: qty, size: selSize, color: selColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div style={{ paddingTop: 68 }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "16px 20px 0" : "18px 40px 0" }}>
        <div style={{ display: "flex", gap: 8, fontSize: 11, color: B.muted, flexWrap: "wrap" }}>
          {[["Home", "home"], ["Shop", "shop"]].map(([label, pg]) => (
            <React.Fragment key={pg}>
              <button onClick={() => navigate(pg as Page)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: B.muted, letterSpacing: "0.05em" }}>{label}</button>
              <span>›</span>
            </React.Fragment>
          ))}
          <span style={{ color: B.charcoal }}>{p.name}</span>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "24px 20px 56px" : "36px 40px 88px" }}>
        <div className="detail-layout">
          {/* Images */}
          <div>
            <div style={{ borderRadius: 10, overflow: "hidden", aspectRatio: "3/4", background: B.ivory, marginBottom: 14 }}>
              <img src={p.images[mainImg]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {p.images.map((img, i) => (
                <img key={i} src={img} alt="" className={`gallery-thumb ${mainImg === i ? "active" : ""}`} onClick={() => setMainImg(i)} />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {p.tag && (
              <div style={{ display: "inline-block", background: TAG_COLORS[p.tag] ?? B.rose, color: B.white, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 2, marginBottom: 14 }}>
                {p.tag}
              </div>
            )}
            <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 30 : 42, fontWeight: 400, color: B.charcoal, lineHeight: 1.2, marginBottom: 12 }}>{p.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <span style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 500, color: B.charcoal }}>{fmt(p.price)}</span>
              {p.originalPrice && <span style={{ fontSize: 16, color: B.mutedLight, textDecoration: "line-through" }}>{fmt(p.originalPrice)}</span>}
            </div>
            <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.8, marginBottom: 28 }}>{p.description}</p>

            {/* Color selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: B.charcoal, marginBottom: 12 }}>
                Colour: <span style={{ fontWeight: 400, textTransform: "none", color: B.muted, letterSpacing: "0.03em" }}>{selColor}</span>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {p.colors.map(c => (
                  <button key={c.name} title={c.name} onClick={() => setColor(c.name)}
                    style={{ width: 32, height: 32, borderRadius: "50%", background: c.hex, border: "none", cursor: "pointer",
                      boxShadow: selColor === c.name ? `0 0 0 2px ${B.white}, 0 0 0 4px ${B.charcoal}` : `0 0 0 1.5px rgba(42,36,32,0.18)`,
                      transition: "box-shadow 0.15s" }} />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: B.charcoal }}>Size</div>
                <button style={{ background: "none", border: "none", fontSize: 11, color: B.rose, cursor: "pointer", textDecoration: "underline" }}>Size Guide</button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(["XS", "S", "M", "L", "XL", "XXL"] as Size[]).map(s => {
                  const avail = p.sizes.includes(s);
                  return (
                    <button key={s} disabled={!avail} onClick={() => avail && setSize(s)}
                      className={`size-btn ${selSize === s ? "selected" : ""} ${!avail ? "unavailable" : ""}`}>{s}</button>
                  );
                })}
              </div>
            </div>

            {/* Qty + Add */}
            <div style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "stretch" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${B.border}`, borderRadius: 4, padding: "0 12px" }}>
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: "none" }}>−</button>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => q + 1)} style={{ border: "none" }}>+</button>
              </div>
              <button className={added ? "btn-rose" : "btn-dark"} onClick={handleAdd} style={{ flex: 1, padding: "14px 20px" }}>
                {added ? "✓  Added to Bag" : "Add to Bag"}
              </button>
            </div>
            <button className="btn-outline-dark" style={{ width: "100%", marginBottom: 28, padding: "13px" }}>♡  Save to Wishlist</button>

            {/* Details accordion */}
            <button className="accordion-row" onClick={() => setDetails(o => !o)}>
              <span>Product Details</span>
              <span style={{ fontSize: 20, fontWeight: 200, lineHeight: 1, transform: detailsOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>+</span>
            </button>
            {detailsOpen && (
              <ul style={{ padding: "14px 0 14px 18px", listStyle: "disc", fontSize: 13, color: B.muted, lineHeight: 2.1 }}>
                {p.details.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            )}
            <div style={{ borderTop: `1px solid ${B.border}`, padding: "14px 0", fontSize: 12, color: B.muted, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15 }}>🚚</span>
              Free shipping on orders over $150 · Easy 30-day returns
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: isMobile ? 56 : 88 }}>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: B.rose, textTransform: "uppercase", marginBottom: 10 }}>You May Also Love</div>
              <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 28 : 38, fontWeight: 400, color: B.charcoal }}>Related Styles</h2>
            </div>
            <div className="product-grid">
              {related.map((r, i) => (
                <div key={r.id} className={`fade-up delay-${i + 1}`}>
                  <ProductCard product={r} navigate={navigate} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Cart Page ────────────────────────────────────────────────────────────────
function CartPage({ cart, cartTotal, updateQty, removeFromCart, navigate, placeOrder }: {
  cart: CartItem[]; cartTotal: number;
  updateQty: (i: number, d: number) => void; removeFromCart: (i: number) => void;
  navigate: (p: Page, product?: Product) => void; placeOrder: () => void;
  addToCart: (item: CartItem) => void; cartCount: number;
}) {
  const isMobile = useWindowWidth() < 1024;
  const shipping = cartTotal >= 150 ? 0 : 12.95;
  const tax = cartTotal * 0.08;

  return (
    <div style={{ paddingTop: 68, minHeight: "80vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "32px 20px 64px" : "52px 40px 88px" }}>
        <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 34 : 48, fontWeight: 400, color: B.charcoal, marginBottom: 36 }}>Shopping Bag</h1>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 0" }}>
            <div style={{ fontSize: 60, marginBottom: 18 }}>🛍️</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: B.charcoal, marginBottom: 12 }}>Your bag is empty</div>
            <p style={{ color: B.muted, marginBottom: 28, fontSize: 14 }}>Discover something beautiful in our collection.</p>
            <button className="btn-rose" onClick={() => navigate("shop")} style={{ padding: "14px 36px" }}>Shop All Dresses</button>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items list */}
            <div>
              {cart.map((item, i) => (
                <div key={`${item.product.id}-${item.size}-${item.color}`} style={{ display: "flex", gap: isMobile ? 14 : 22, paddingBottom: 28, marginBottom: 28, borderBottom: i < cart.length - 1 ? `1px solid ${B.border}` : "none" }}>
                  <div onClick={() => navigate("product", item.product)} style={{ width: isMobile ? 88 : 120, height: isMobile ? 108 : 150, borderRadius: 8, overflow: "hidden", flexShrink: 0, cursor: "pointer", background: B.ivory }}>
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, gap: 12 }}>
                      <div onClick={() => navigate("product", item.product)} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 17 : 21, color: B.charcoal, cursor: "pointer", lineHeight: 1.3 }}>{item.product.name}</div>
                      <div style={{ fontFamily: SERIF, fontSize: isMobile ? 16 : 19, fontWeight: 500, color: B.charcoal, whiteSpace: "nowrap" }}>{fmt(item.product.price * item.quantity)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: B.muted, marginBottom: 5 }}>Size: {item.size}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16 }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", background: item.product.colors.find(c => c.name === item.color)?.hex ?? "#ccc", border: "1px solid rgba(0,0,0,0.1)" }} />
                      <span style={{ fontSize: 12, color: B.muted }}>{item.color}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button className="qty-btn" onClick={() => updateQty(i, -1)}>−</button>
                        <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(i, 1)}>+</button>
                      </div>
                      <button onClick={() => removeFromCart(i)} style={{ background: "none", border: "none", fontSize: 11, color: B.muted, cursor: "pointer", textDecoration: "underline" }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{ background: B.ivory, borderRadius: 10, padding: "28px 24px", border: `1px solid ${B.border}`, position: "sticky", top: 84 }}>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 20, color: B.charcoal, marginBottom: 22 }}>Order Summary</div>
              {[["Subtotal", fmt(cartTotal)], ["Shipping", shipping === 0 ? "Free" : fmt(shipping)], ["Est. Tax", fmt(tax)]].map(([l, v]) => (
                <div key={String(l)} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12, color: B.muted }}>
                  <span>{l}</span><span style={{ color: B.charcoal, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${B.border}`, marginTop: 16, paddingTop: 16, display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700, color: B.charcoal, marginBottom: 22 }}>
                <span>Total</span><span>{fmt(cartTotal + shipping + tax)}</span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize: 11, color: B.rose, marginBottom: 16, textAlign: "center", fontWeight: 500 }}>
                  Add {fmt(150 - cartTotal)} more for free shipping!
                </div>
              )}
              <button className="btn-dark" onClick={() => navigate("checkout")} style={{ width: "100%", padding: "15px", marginBottom: 10 }}>Proceed to Checkout</button>
              <button className="btn-outline-dark" onClick={() => navigate("shop")} style={{ width: "100%", padding: "13px" }}>Continue Shopping</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Checkout Page ────────────────────────────────────────────────────────────
function CheckoutPage({ cart, cartTotal, navigate, placeOrder }: {
  cart: CartItem[]; cartTotal: number;
  navigate: (p: Page) => void; placeOrder: () => void;
  addToCart: (item: CartItem) => void; cartCount: number;
  updateQty: (i: number, d: number) => void; removeFromCart: (i: number) => void;
}) {
  const isMobile = useWindowWidth() < 1024;
  const shipping = cartTotal >= 150 ? 0 : 12.95;
  const tax      = cartTotal * 0.08;

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "United States",
    cardName: "", cardNumber: "", expiry: "", cvv: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder();
  };

  const lbl: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: B.muted, marginBottom: 6 };

  return (
    <div style={{ paddingTop: 68, minHeight: "80vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "32px 20px 64px" : "52px 40px 88px" }}>
        <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 32 : 46, fontWeight: 400, color: B.charcoal, marginBottom: 36 }}>Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="checkout-layout">
            {/* Form */}
            <div>
              <FormCard title="Contact Information">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={lbl}>First Name</label><input required className="form-input" value={form.firstName} onChange={set("firstName")} placeholder="Jane" /></div>
                  <div><label style={lbl}>Last Name</label><input required className="form-input" value={form.lastName} onChange={set("lastName")} placeholder="Doe" /></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Email</label><input required type="email" className="form-input" value={form.email} onChange={set("email")} placeholder="jane@example.com" /></div>
                <div><label style={lbl}>Phone</label><input className="form-input" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" /></div>
              </FormCard>

              <FormCard title="Shipping Address">
                <div style={{ marginBottom: 14 }}><label style={lbl}>Address</label><input required className="form-input" value={form.address} onChange={set("address")} placeholder="123 Rose Lane" /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div><label style={lbl}>City</label><input required className="form-input" value={form.city} onChange={set("city")} placeholder="New York" /></div>
                  <div><label style={lbl}>State / Province</label><input required className="form-input" value={form.state} onChange={set("state")} placeholder="NY" /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div><label style={lbl}>ZIP / Postal</label><input required className="form-input" value={form.zip} onChange={set("zip")} placeholder="10001" /></div>
                  <div>
                    <label style={lbl}>Country</label>
                    <select className="form-input" value={form.country} onChange={set("country")} style={{ cursor: "pointer" }}>
                      {["United States","Canada","United Kingdom","Australia","France","Germany","South Africa"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </FormCard>

              <FormCard title="Payment Details">
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, padding: "10px 14px", background: B.rosePale, borderRadius: 6, fontSize: 12, color: B.roseDeep }}>
                  🔒 Your payment information is secure and encrypted.
                </div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Name on Card</label><input required className="form-input" value={form.cardName} onChange={set("cardName")} placeholder="Jane Doe" /></div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Card Number</label><input required className="form-input" value={form.cardNumber} onChange={set("cardNumber")} placeholder="•••• •••• •••• ••••" maxLength={19} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div><label style={lbl}>Expiry</label><input required className="form-input" value={form.expiry} onChange={set("expiry")} placeholder="MM / YY" /></div>
                  <div><label style={lbl}>CVV</label><input required className="form-input" value={form.cvv} onChange={set("cvv")} placeholder="•••" maxLength={4} /></div>
                </div>
              </FormCard>
            </div>

            {/* Summary */}
            <div>
              <div style={{ background: B.ivory, borderRadius: 10, padding: "26px 22px", border: `1px solid ${B.border}`, position: "sticky", top: 84 }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: B.charcoal, marginBottom: 20 }}>Order Summary</div>
                <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 18 }}>
                  {cart.map(item => (
                    <div key={`${item.product.id}-${item.size}`} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
                      <div style={{ position: "relative" }}>
                        <div style={{ width: 52, height: 64, borderRadius: 5, overflow: "hidden", background: B.border }}>
                          <img src={item.product.images[0]} alt={item.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, background: B.charcoal, color: B.white, borderRadius: "50%", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.quantity}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: B.charcoal, lineHeight: 1.3 }}>{item.product.name}</div>
                        <div style={{ fontSize: 11, color: B.muted }}>{item.size} · {item.color}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: B.charcoal, whiteSpace: "nowrap" }}>{fmt(item.product.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: `1px solid ${B.border}`, paddingTop: 14 }}>
                  {[["Subtotal", fmt(cartTotal)], ["Shipping", shipping === 0 ? "Free" : fmt(shipping)], ["Tax", fmt(tax)]].map(([l, v]) => (
                    <div key={String(l)} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10, color: B.muted }}>
                      <span>{l}</span><span style={{ color: B.charcoal, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, color: B.charcoal, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${B.border}`, marginBottom: 20 }}>
                    <span>Total</span><span>{fmt(cartTotal + shipping + tax)}</span>
                  </div>
                  <button type="submit" className="btn-dark" style={{ width: "100%", padding: "15px" }}>Place Order →</button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: B.white, border: `1px solid ${B.border}`, borderRadius: 10, padding: "24px 22px", marginBottom: 18 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: B.charcoal, marginBottom: 20 }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Confirmation Page ────────────────────────────────────────────────────────
function ConfirmationPage({ orderNum, navigate }: { orderNum: string; navigate: (p: Page) => void }) {
  const isMobile = useWindowWidth() < 768;
  return (
    <div style={{ paddingTop: 68, minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="fade-up" style={{ textAlign: "center", maxWidth: 520, padding: isMobile ? "40px 24px" : "64px 40px", margin: "40px auto" }}>
        <div style={{ width: 76, height: 76, background: B.rosePale, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: 34, color: B.rose }}>✓</div>
        <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 32 : 48, fontWeight: 400, color: B.charcoal, marginBottom: 14 }}>Thank You!</h1>
        <p style={{ fontSize: 15, color: B.muted, lineHeight: 1.75, marginBottom: 16 }}>Your order has been placed and is being prepared with care. A handwritten note is on its way too.</p>
        <div style={{ display: "inline-block", background: B.ivory, border: `1px solid ${B.border}`, borderRadius: 6, padding: "10px 24px", marginBottom: 28 }}>
          <span style={{ fontSize: 11, color: B.muted }}>Order  </span>
          <span style={{ fontFamily: SERIF, fontWeight: 600, color: B.charcoal, fontSize: 16 }}>{orderNum}</span>
        </div>
        <p style={{ fontSize: 12, color: B.mutedLight, marginBottom: 36 }}>A confirmation email will be sent shortly. Thank you for choosing Alethia.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-rose" onClick={() => navigate("shop")} style={{ padding: "14px 32px" }}>Continue Shopping</button>
          <button className="btn-outline-dark" onClick={() => navigate("home")} style={{ padding: "13px 32px" }}>Back to Home</button>
        </div>
      </div>
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────
function AboutPage({ navigate }: { navigate: (p: Page) => void }) {
  const isMobile = useWindowWidth() < 768;
  return (
    <div style={{ paddingTop: 68 }}>
      {/* Hero image */}
      <div style={{ position: "relative", height: isMobile ? 340 : 520, overflow: "hidden" }}>
        <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=80" alt="Alethia Clothing" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(26,22,18,0.35)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <h1 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 38 : 68, fontWeight: 400, color: B.cream, textAlign: "center", letterSpacing: "0.02em" }}>Our Story</h1>
        </div>
      </div>

      {/* Story */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: isMobile ? "52px 24px" : "88px 40px", textAlign: "center" }}>
        <div className="fade-up" style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.24em", color: B.rose, textTransform: "uppercase", marginBottom: 18 }}>Est. 2021 · Cape Town</div>
        <h2 className="fade-up delay-1" style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 26 : 38, fontWeight: 400, color: B.charcoal, lineHeight: 1.35, marginBottom: 28 }}>
          Alethia was born from a belief that every woman deserves to dress with intention.
        </h2>
        <p className="fade-up delay-2" style={{ fontSize: 15, color: B.muted, lineHeight: 1.9, marginBottom: 22 }}>
          Founded by Amara Osei, Alethia Clothing began as a small atelier in Cape Town's Woodstock neighbourhood, where each dress was hand-finished and delivered wrapped in tissue paper with a handwritten note. The brand's name — from the Greek word for truth — reflects a commitment to authenticity: honest materials, honest craftsmanship, and designs that honour the real shapes and lives of women.
        </p>
        <p className="fade-up delay-3" style={{ fontSize: 15, color: B.muted, lineHeight: 1.9 }}>
          Today, Alethia dresses are worn by women across the globe who share one thing: they refuse to choose between comfort and beauty. Each piece is designed to move with you, age gracefully, and earn a permanent place in your wardrobe.
        </p>
      </div>

      {/* Values */}
      <div style={{ background: B.ivory, borderTop: `1px solid ${B.border}`, borderBottom: `1px solid ${B.border}`, padding: isMobile ? "52px 24px" : "80px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 30 : 42, fontWeight: 400, color: B.charcoal }}>What We Stand For</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: isMobile ? 32 : 48 }}>
            {[
              { icon: "🌿", title: "Sustainable Sourcing",  body: "Every fabric is chosen for its provenance. We partner with mills that meet the highest ethical and environmental standards — because what touches your skin matters." },
              { icon: "✂️", title: "Artisan Craft",         body: "Our dresses are cut and finished by skilled artisans. No fast-fashion shortcuts. Quality that lasts a lifetime, not a season." },
              { icon: "💌", title: "Personal Touch",        body: "Every order is packed by hand with a personal note. Because you are not a transaction — you are our community, and we are grateful for you." },
            ].map(v => (
              <div key={v.title} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 500, color: B.charcoal, marginBottom: 12 }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: B.muted, lineHeight: 1.8 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: isMobile ? "56px 24px" : "88px 40px" }}>
        <h2 style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: isMobile ? 28 : 42, fontWeight: 400, color: B.charcoal, marginBottom: 22 }}>Ready to find your dress?</h2>
        <button className="btn-rose" onClick={() => navigate("shop")} style={{ padding: "15px 44px" }}>Shop the Collection</button>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ navigate }: { navigate: (p: Page) => void }) {
  const isMobile = useWindowWidth() < 768;
  const [email, setEmail]       = useState("");
  const [subscribed, setSub]    = useState(false);

  return (
    <footer style={{ background: B.charcoal, color: "rgba(253,248,243,0.65)", fontFamily: SANS }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "52px 24px 36px" : "72px 40px 44px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "2fr 1fr 1fr 2fr", gap: isMobile ? "36px 24px" : "0 56px", marginBottom: 52 }}>
          {/* Brand column */}
          <div style={{ gridColumn: isMobile ? "span 2" : "auto" }}>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 28, color: B.cream, marginBottom: 2 }}>Alethia</div>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.26em", color: B.rose, textTransform: "uppercase", marginBottom: 16 }}>Clothing</div>
            <p style={{ fontSize: 13, lineHeight: 1.8, maxWidth: 270, marginBottom: 24 }}>Boutique women's dresses, designed for the woman who lives beautifully.</p>
            <div style={{ display: "flex", gap: 12 }}>
              {["IG", "FB", "PT"].map(s => (
                <div key={s} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(253,248,243,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, cursor: "pointer", color: "rgba(253,248,243,0.55)", transition: "border-color 0.2s" }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = "rgba(253,248,243,0.55)")}
                  onMouseOut={e => (e.currentTarget.style.borderColor = "rgba(253,248,243,0.18)")}
                >{s}</div>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: B.cream, marginBottom: 18 }}>Shop</div>
            {[["New Arrivals", "shop"], ["All Dresses", "shop"], ["Formal", "shop"], ["Casual", "shop"], ["Sale", "shop"]].map(([l, pg]) => (
              <button key={l} onClick={() => navigate(pg as Page)} style={{ display: "block", background: "none", border: "none", color: "rgba(253,248,243,0.6)", fontSize: 13, marginBottom: 10, cursor: "pointer", padding: 0, textAlign: "left" }}
                onMouseOver={e => (e.currentTarget.style.color = B.cream)}
                onMouseOut={e => (e.currentTarget.style.color = "rgba(253,248,243,0.6)")}
              >{l}</button>
            ))}
          </div>

          {/* Help links */}
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: B.cream, marginBottom: 18 }}>Help</div>
            {["About Us", "Sizing Guide", "Shipping & Returns", "Contact Us", "FAQ"].map(l => (
              <div key={l} style={{ fontSize: 13, color: "rgba(253,248,243,0.6)", marginBottom: 10, cursor: "pointer" }}
                onMouseOver={e => (e.currentTarget.style.color = B.cream)}
                onMouseOut={e => (e.currentTarget.style.color = "rgba(253,248,243,0.6)")}
              >{l}</div>
            ))}
          </div>

          {/* Newsletter */}
          <div style={{ gridColumn: isMobile ? "span 2" : "auto" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: B.cream, marginBottom: 14 }}>Stay in the Loop</div>
            <p style={{ fontSize: 13, lineHeight: 1.75, marginBottom: 18 }}>New arrivals, styling notes, and exclusive offers — delivered gently to your inbox.</p>
            {subscribed ? (
              <div style={{ fontSize: 13, color: B.gold }}>✓  Thank you for subscribing!</div>
            ) : (
              <div style={{ display: "flex" }}>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
                  style={{ flex: 1, padding: "11px 14px", background: "rgba(253,248,243,0.07)", border: "1px solid rgba(253,248,243,0.16)", borderRight: "none", borderRadius: "3px 0 0 3px", color: B.cream, fontSize: 13, outline: "none" }} />
                <button onClick={() => { if (email) setSub(true); }}
                  style={{ padding: "11px 16px", background: B.rose, color: B.white, border: "none", borderRadius: "0 3px 3px 0", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer" }}>
                  Join
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(253,248,243,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(253,248,243,0.3)" }}>© 2026 Alethia Clothing. All rights reserved.</div>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy Policy", "Terms", "Cookies"].map(l => (
              <span key={l} style={{ fontSize: 11, color: "rgba(253,248,243,0.3)", cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
