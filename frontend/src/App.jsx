import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const TOKEN_STORAGE_KEY = 'gobeauty.auth.tokens';

const fallbackCategories = [
  {
    name: 'Skincare',
    slug: 'skincare',
    children: ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen'],
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    children: ['Foundation', 'Lip Color', 'Eye Makeup', 'Tools'],
  },
  {
    name: 'Hair & Body',
    slug: 'hair-body',
    children: ['Hair Care', 'Body Lotion', 'Body Mist', 'Hand Cream'],
  },
];

const productVisuals = {
  'GBL-SPF-001': {
    brand: 'Go Beauty Lab',
    skinType: ['Oily', 'Combination'],
    rating: 4.8,
    reviews: 128,
    badge: 'Best seller',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80',
    ],
  },
  'BOJ-CREAM-001': {
    brand: 'Beauty of Joseon',
    skinType: ['Dry', 'Sensitive'],
    rating: 4.7,
    reviews: 94,
    badge: 'Imported',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?auto=format&fit=crop&w=900&q=80',
    ],
  },
  'ORD-SERUM-001': {
    brand: 'The Ordinary',
    skinType: ['Oily', 'Acne Prone'],
    rating: 4.6,
    reviews: 211,
    badge: 'Trending',
    image:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1629198735660-e39ea93f5c18?auto=format&fit=crop&w=900&q=80',
    ],
  },
  'GBL-CLEAN-001': {
    brand: 'Go Beauty Lab',
    skinType: ['Normal', 'Combination'],
    rating: 4.5,
    reviews: 63,
    badge: 'Restocking',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    ],
  },
  'ROM-LIP-001': {
    brand: 'Rom&nd',
    skinType: ['All'],
    rating: 4.9,
    reviews: 156,
    badge: 'New shades',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1631214540553-ff044a3ff5d4?auto=format&fit=crop&w=900&q=80',
    ],
  },
  'LDR-HAIR-001': {
    brand: 'Lador',
    skinType: ['All'],
    rating: 4.4,
    reviews: 77,
    badge: 'Salon care',
    image:
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=900&q=80',
    ],
  },
};

const fallbackProducts = [
  {
    id: 1,
    sku: 'GBL-SPF-001',
    slug: 'glow-guard-spf50',
    name: 'Glow Guard SPF 50 PA++++',
    category: 'Skincare',
    price: 1450,
    compareAt: 1750,
    stock: 34,
    description:
      'A lightweight daily sunscreen made for humid Bangladesh weather with a soft, no-white-cast finish.',
  },
  {
    id: 2,
    sku: 'BOJ-CREAM-001',
    slug: 'rice-ceramide-barrier-cream',
    name: 'Rice Ceramide Barrier Cream',
    category: 'Skincare',
    price: 1890,
    compareAt: 2150,
    stock: 21,
    description:
      'A rich moisturizer for dry and sensitive skin that helps support the skin barrier without heaviness.',
  },
  {
    id: 3,
    sku: 'ORD-SERUM-001',
    slug: 'niacinamide-10-serum',
    name: 'Niacinamide 10% Clarity Serum',
    category: 'Skincare',
    price: 1320,
    compareAt: 1500,
    stock: 48,
    description: 'A simple everyday serum for visible pores, oil balance, and uneven tone.',
  },
  {
    id: 4,
    sku: 'GBL-CLEAN-001',
    slug: 'fresh-rose-cleansing-gel',
    name: 'Fresh Rose Cleansing Gel',
    category: 'Skincare',
    price: 890,
    compareAt: 1050,
    stock: 0,
    description:
      'A gentle gel cleanser that removes sweat, sunscreen, and daily buildup without stripping the skin.',
  },
  {
    id: 5,
    sku: 'ROM-LIP-001',
    slug: 'velvet-matte-lip-tint',
    name: 'Velvet Matte Lip Tint',
    category: 'Makeup',
    price: 980,
    compareAt: 1200,
    stock: 39,
    description:
      'Soft blur lip color with long wear, comfortable pigment, and shades that flatter South Asian skin tones.',
  },
  {
    id: 6,
    sku: 'LDR-HAIR-001',
    slug: 'repair-hair-mask',
    name: 'Keratin Repair Hair Mask',
    category: 'Hair & Body',
    price: 1680,
    compareAt: 1900,
    stock: 18,
    description:
      'A weekly treatment for dry, heat-styled, or colored hair that needs softness and shine.',
  },
].map(enrichProduct);

const filtersInitial = {
  category: 'All',
  brand: 'All',
  skinType: 'All',
  availability: 'All',
  sort: 'featured',
};

function formatPrice(value) {
  return `Tk ${Number(value || 0).toLocaleString('en-BD')}`;
}

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function readStoredTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

function storeTokens(tokens) {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
}

function clearStoredTokens() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

async function apiRequest(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.detail || data.error || Object.values(data).flat().join(' ') || 'Request failed.';
    throw new Error(message);
  }

  return data;
}

function listFromApi(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function enrichProduct(product) {
  const categoryName = product.category?.name || product.category || 'Skincare';
  const price = Number(product.price || 0);
  const visual = productVisuals[product.sku] || {};
  const image =
    visual.image ||
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80';

  return {
    ...product,
    category: categoryName,
    categoryId: product.category?.id || product.category_id,
    slug: product.slug || slugify(product.name),
    brand: product.brand || visual.brand || 'Go Beauty Lab',
    skinType: product.skinType || visual.skinType || ['All'],
    price,
    compareAt: Number(product.compareAt || Math.round(price * 1.18)),
    rating: product.rating || visual.rating || 4.5,
    reviews: product.reviews || visual.reviews || 24,
    badge: product.stock > 0 ? visual.badge || 'Available' : 'Out of stock',
    image,
    gallery: visual.gallery || [image],
    description: product.description || 'Authentic beauty product available from Go Beauty Bangladesh.',
  };
}

function buildCategoryTree(apiCategories) {
  const categories = listFromApi(apiCategories);
  if (!categories.length) return fallbackCategories;

  const childrenByParent = categories.reduce((groups, category) => {
    const parentKey = category.parent || 'root';
    return { ...groups, [parentKey]: [...(groups[parentKey] || []), category] };
  }, {});

  const roots = childrenByParent.root || categories.filter((category) => !category.parent);

  return roots.map((category) => ({
    name: category.name,
    slug: category.slug,
    children: (childrenByParent[category.id] || []).map((child) => child.name),
  }));
}

export default function App() {
  const [view, setView] = useState('home');
  const [filters, setFilters] = useState(filtersInitial);
  const [categories, setCategories] = useState(fallbackCategories);
  const [products, setProducts] = useState(fallbackProducts);
  const [catalogStatus, setCatalogStatus] = useState('loading');
  const [selectedProduct, setSelectedProduct] = useState(fallbackProducts[0]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tokens, setTokens] = useState(readStoredTokens);
  const [authUser, setAuthUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [checkoutState, setCheckoutState] = useState({ status: 'idle', message: '' });

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const filteredProducts = useMemo(() => {
    const next = products.filter((product) => {
      const categoryOk = filters.category === 'All' || product.category === filters.category;
      const brandOk = filters.brand === 'All' || product.brand === filters.brand;
      const skinOk = filters.skinType === 'All' || product.skinType.includes(filters.skinType);
      const availableOk = filters.availability === 'All' || product.stock > 0;
      return categoryOk && brandOk && skinOk && availableOk;
    });

    if (filters.sort === 'price-low') return [...next].sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-high') return [...next].sort((a, b) => b.price - a.price);
    if (filters.sort === 'newest') return [...next].reverse();
    if (filters.sort === 'best-selling') return [...next].sort((a, b) => b.reviews - a.reviews);
    return next;
  }, [filters, products]);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!tokens?.access) return;
    loadCurrentUser(tokens.access);
  }, [tokens]);

  async function loadCatalog() {
    try {
      const [categoryData, productData] = await Promise.all([
        apiRequest('/categories/'),
        apiRequest('/products/'),
      ]);
      const nextProducts = listFromApi(productData).map(enrichProduct);
      setCategories(buildCategoryTree(categoryData));
      setProducts(nextProducts.length ? nextProducts : fallbackProducts);
      setSelectedProduct(nextProducts[0] || fallbackProducts[0]);
      setCatalogStatus('ready');
    } catch {
      setCatalogStatus('fallback');
    }
  }

  async function loadCurrentUser(accessToken) {
    try {
      const user = await apiRequest('/auth/me/', { token: accessToken });
      setAuthUser(user);
      setAuthMessage('');
      await loadOrders(accessToken);
    } catch {
      clearStoredTokens();
      setTokens(null);
      setAuthUser(null);
    }
  }

  async function loadOrders(accessToken = tokens?.access) {
    if (!accessToken) return;
    const orderData = await apiRequest('/orders/', { token: accessToken });
    setOrders(listFromApi(orderData));
  }

  function navigate(nextView) {
    setView(nextView);
    setCartOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function openProduct(product) {
    const fallbackRelated = products.filter((item) => item.id !== product.id).slice(0, 3);
    setSelectedProduct(product);
    setRelatedProducts(fallbackRelated);
    navigate('product');

    try {
      const [detailData, recommendationData] = await Promise.all([
        apiRequest(`/products/${product.id}/`),
        apiRequest(`/products/${product.id}/recommendations/`),
      ]);
      setSelectedProduct(enrichProduct(detailData));
      const recommendations = listFromApi(recommendationData).map(enrichProduct);
      setRelatedProducts(recommendations.length ? recommendations : fallbackRelated);
    } catch {
      setRelatedProducts(fallbackRelated);
    }
  }

  function addToCart(product) {
    if (product.stock === 0) return;
    setCart((items) => {
      const found = items.find((item) => item.id === product.id);
      if (!found) return [...items, { ...product, qty: 1 }];

      return items.map((item) =>
        item.id === product.id ? { ...item, qty: Math.min(item.stock, item.qty + 1) } : item,
      );
    });
    setCartOpen(true);
  }

  function updateQty(id, delta) {
    setCart((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, qty: Math.max(0, Math.min(item.stock, item.qty + delta)) } : item,
        )
        .filter((item) => item.qty > 0),
    );
  }

  async function login(credentials) {
    setAuthMessage('Signing in...');
    try {
      const data = await apiRequest('/auth/login/', { method: 'POST', body: credentials });
      const nextTokens = { access: data.access, refresh: data.refresh };
      storeTokens(nextTokens);
      setTokens(nextTokens);
      setAuthUser(data.user);
      setAuthMessage('Logged in successfully.');
      await loadOrders(nextTokens.access);
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  async function register(payload) {
    setAuthMessage('Creating account...');
    try {
      await apiRequest('/auth/register/', { method: 'POST', body: payload });
      await login({ email: payload.email, password: payload.password });
    } catch (error) {
      setAuthMessage(error.message);
    }
  }

  function logout() {
    clearStoredTokens();
    setTokens(null);
    setAuthUser(null);
    setOrders([]);
    setAuthMessage('');
  }

  async function createOrder() {
    if (!tokens?.access) {
      setCheckoutState({ status: 'error', message: 'Please login before checkout.' });
      navigate('account');
      return;
    }

    setCheckoutState({ status: 'loading', message: 'Creating your order...' });
    try {
      const order = await apiRequest('/orders/', {
        method: 'POST',
        token: tokens.access,
        body: {
          items: cart.map((item) => ({ product_id: item.id, quantity: item.qty })),
        },
      });
      setCart([]);
      setCheckoutState({
        status: 'success',
        message: `Order #${order.id} created. Payment gateway integration is the next phase.`,
      });
      await loadOrders(tokens.access);
      navigate('account');
    } catch (error) {
      setCheckoutState({ status: 'error', message: error.message });
    }
  }

  return (
    <div className="site-shell">
      <TopNotice />
      <Header
        categories={categories}
        cartCount={cartCount}
        currentView={view}
        onNavigate={navigate}
        onCartOpen={() => setCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen((open) => !open)}
      />

      <main>
        {view === 'home' && (
          <HomePage
            categories={categories}
            products={products}
            catalogStatus={catalogStatus}
            onNavigate={navigate}
            onProductOpen={openProduct}
            onAddToCart={addToCart}
          />
        )}
        {view === 'products' && (
          <ProductsPage
            products={filteredProducts}
            allProducts={products}
            filters={filters}
            onFilterChange={setFilters}
            onProductOpen={openProduct}
            onAddToCart={addToCart}
          />
        )}
        {view === 'product' && (
          <ProductDetail
            product={selectedProduct}
            relatedProducts={relatedProducts}
            onAddToCart={addToCart}
            onProductOpen={openProduct}
          />
        )}
        {view === 'cart' && (
          <CartPage cart={cart} total={cartTotal} onQty={updateQty} onCheckout={() => navigate('checkout')} />
        )}
        {view === 'checkout' && (
          <CheckoutPage
            cart={cart}
            total={cartTotal}
            checkoutState={checkoutState}
            isAuthenticated={Boolean(authUser)}
            onSubmit={createOrder}
          />
        )}
        {view === 'account' && (
          <AccountPage
            user={authUser}
            orders={orders}
            message={authMessage || checkoutState.message}
            onLogin={login}
            onRegister={register}
            onLogout={logout}
          />
        )}
      </main>

      <Footer onNavigate={navigate} />
      <CartDrawer
        open={cartOpen}
        cart={cart}
        total={cartTotal}
        onClose={() => setCartOpen(false)}
        onQty={updateQty}
        onCartPage={() => navigate('cart')}
        onCheckout={() => navigate('checkout')}
      />
    </div>
  );
}

function TopNotice() {
  return (
    <div className="top-notice">
      <span>Gobeauty.bd</span>
      <span>Free delivery in Dhaka from Tk 2,500</span>
      <span>bKash, card, and Cash on Delivery</span>
    </div>
  );
}

function Header({
  categories,
  cartCount,
  currentView,
  onNavigate,
  onCartOpen,
  mobileMenuOpen,
  onMobileToggle,
}) {
  const navItems = [
    ['home', 'Home'],
    ['products', 'Products'],
    ['account', 'Account'],
  ];

  return (
    <header className="site-header">
      <div className="brand-lockup" role="button" tabIndex="0" onClick={() => onNavigate('home')}>
        <span className="brand-mark">GB</span>
        <span>
          <strong>Go Beauty Bangladesh</strong>
          <small>Skincare, makeup, hair & body</small>
        </span>
      </div>

      <nav className={`main-nav ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="mega-trigger">
          <button type="button" onClick={() => onNavigate('products')}>Categories</button>
          <div className="mega-menu">
            {categories.map((category) => (
              <div key={category.slug || category.name}>
                <strong>{category.name}</strong>
                {(category.children.length ? category.children : ['All products']).map((child) => (
                  <button key={child} type="button" onClick={() => onNavigate('products')}>
                    {child}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        {navItems.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={currentView === key ? 'active' : ''}
            onClick={() => onNavigate(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button search-button" type="button" aria-label="Search products">
          <span />
        </button>
        <button className="cart-button" type="button" onClick={onCartOpen}>
          Cart <strong>{cartCount}</strong>
        </button>
        <button
          className="icon-button menu-button"
          type="button"
          aria-label="Open navigation"
          onClick={onMobileToggle}
        >
          <span />
        </button>
      </div>
    </header>
  );
}

function HomePage({ categories, products, catalogStatus, onNavigate, onProductOpen, onAddToCart }) {
  return (
    <>
      <section className="hero">
        <div className="hero-media">
          <img
            src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80"
            alt="Beauty products arranged for Go Beauty Bangladesh"
          />
        </div>
        <div className="hero-content">
          <p>Authentic beauty, delivered across Bangladesh</p>
          <h1>Go Beauty Bangladesh</h1>
          <span>Curated skincare, makeup, and personal care at Gobeauty.bd.</span>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={() => onNavigate('products')}>
              Shop products
            </button>
            <button type="button" className="secondary-button" onClick={() => onNavigate('account')}>
              Track order
            </button>
          </div>
        </div>
      </section>

      {catalogStatus === 'fallback' && (
        <div className="empty-state compact">
          <p>Backend is offline, so the storefront is showing local demo products.</p>
        </div>
      )}

      <section className="category-strip">
        {categories.map((category) => (
          <button key={category.slug || category.name} type="button" onClick={() => onNavigate('products')}>
            <span>{category.name}</span>
            <small>{category.children.slice(0, 3).join(' / ') || 'All products'}</small>
          </button>
        ))}
      </section>

      <section className="section-block">
        <SectionHeading
          label="Featured picks"
          title="Humidity-friendly beauty essentials"
          action="View all"
          onAction={() => onNavigate('products')}
        />
        <ProductGrid
          products={products.slice(0, 4)}
          onProductOpen={onProductOpen}
          onAddToCart={onAddToCart}
        />
      </section>

      <section className="promise-band">
        <div>
          <strong>Authenticity checked</strong>
          <span>Source notes and batch checks for imported products.</span>
        </div>
        <div>
          <strong>Fast local delivery</strong>
          <span>Dhaka, Chattogram, Sylhet, and nationwide courier.</span>
        </div>
        <div>
          <strong>Secure checkout</strong>
          <span>Backend-created orders now protect product price and stock rules.</span>
        </div>
      </section>
    </>
  );
}

function ProductsPage({ products, allProducts, filters, onFilterChange, onProductOpen, onAddToCart }) {
  const categoryOptions = ['All', ...new Set(allProducts.map((product) => product.category))];
  const brandOptions = ['All', ...new Set(allProducts.map((product) => product.brand))];

  return (
    <section className="catalog-layout page-pad">
      <aside className="filters-panel">
        <div>
          <h2>Filters</h2>
          <button type="button" onClick={() => onFilterChange(filtersInitial)}>Reset</button>
        </div>
        <FilterSelect
          label="Category"
          value={filters.category}
          options={categoryOptions}
          onChange={(category) => onFilterChange({ ...filters, category })}
        />
        <FilterSelect
          label="Brand"
          value={filters.brand}
          options={brandOptions}
          onChange={(brand) => onFilterChange({ ...filters, brand })}
        />
        <FilterSelect
          label="Skin type"
          value={filters.skinType}
          options={['All', 'Oily', 'Dry', 'Sensitive', 'Combination', 'Acne Prone', 'Normal']}
          onChange={(skinType) => onFilterChange({ ...filters, skinType })}
        />
        <label className="check-line">
          <input
            type="checkbox"
            checked={filters.availability === 'In stock'}
            onChange={(event) =>
              onFilterChange({ ...filters, availability: event.target.checked ? 'In stock' : 'All' })
            }
          />
          In stock only
        </label>
      </aside>

      <div className="catalog-main">
        <div className="catalog-toolbar">
          <div>
            <p>Product listing</p>
            <h1>{products.length} products found</h1>
          </div>
          <select
            aria-label="Sort products"
            value={filters.sort}
            onChange={(event) => onFilterChange({ ...filters, sort: event.target.value })}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="newest">Newest</option>
            <option value="best-selling">Best selling</option>
          </select>
        </div>
        <ProductGrid products={products} onProductOpen={onProductOpen} onAddToCart={onAddToCart} />
      </div>
    </section>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="filter-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProductGrid({ products, onProductOpen, onAddToCart }) {
  if (!products.length) {
    return (
      <div className="empty-state">
        <h2>No products match these filters</h2>
        <p>Try another brand, category, or skin type.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onOpen={() => onProductOpen(product)}
          onAdd={() => onAddToCart(product)}
        />
      ))}
    </div>
  );
}

function ProductCard({ product, onOpen, onAdd }) {
  return (
    <article className="product-card">
      <button type="button" className="product-image" onClick={onOpen}>
        <img src={product.image} alt={product.name} />
        <span>{product.badge}</span>
      </button>
      <div className="product-info">
        <small>{product.brand}</small>
        <button type="button" className="product-title" onClick={onOpen}>
          {product.name}
        </button>
        <div className="rating-row">
          <span>{'★'.repeat(Math.round(product.rating))}</span>
          <small>{product.rating} ({product.reviews})</small>
        </div>
        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>
          <span>{formatPrice(product.compareAt)}</span>
        </div>
        <button className="add-button" type="button" disabled={product.stock === 0} onClick={onAdd}>
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

function ProductDetail({ product, relatedProducts, onAddToCart, onProductOpen }) {
  return (
    <section className="product-detail page-pad">
      <div className="gallery-panel">
        <img src={product.gallery[0]} alt={product.name} />
        <div>
          {product.gallery.map((image) => (
            <img key={image} src={image} alt="" />
          ))}
        </div>
      </div>

      <div className="detail-copy">
        <p>{product.brand}</p>
        <h1>{product.name}</h1>
        <div className="rating-row">
          <span>{'★'.repeat(Math.round(product.rating))}</span>
          <small>{product.rating} rating from {product.reviews} reviews</small>
        </div>
        <div className="detail-price">
          <strong>{formatPrice(product.price)}</strong>
          <span>{formatPrice(product.compareAt)}</span>
        </div>
        <p>{product.description}</p>
        <div className="detail-tags">
          {product.skinType.map((type) => (
            <span key={type}>{type}</span>
          ))}
          <span>{product.stock > 0 ? `${product.stock} in stock` : 'Restocking soon'}</span>
        </div>
        <button
          type="button"
          className="primary-button wide"
          disabled={product.stock === 0}
          onClick={() => onAddToCart(product)}
        >
          {product.stock === 0 ? 'Notify me' : 'Add to cart'}
        </button>

        <div className="reviews-box">
          <h2>Customer reviews</h2>
          <article>
            <strong>Farhana A.</strong>
            <span>Verified customer</span>
            <p>Texture feels light and delivery was fast. I liked the clear expiry information.</p>
          </article>
          <article>
            <strong>Nusrat J.</strong>
            <span>Verified customer</span>
            <p>Good packaging and the product matched the photos.</p>
          </article>
        </div>
      </div>

      <div className="related-row">
        <SectionHeading label="You may also like" title="Related products" />
        <ProductGrid products={relatedProducts} onProductOpen={onProductOpen} onAddToCart={onAddToCart} />
      </div>
    </section>
  );
}

function CartPage({ cart, total, onQty, onCheckout }) {
  return (
    <section className="page-pad cart-page">
      <h1>Shopping cart</h1>
      <CartItems cart={cart} onQty={onQty} />
      <OrderSummary total={total} onCheckout={onCheckout} />
    </section>
  );
}

function CheckoutPage({ cart, total, checkoutState, isAuthenticated, onSubmit }) {
  return (
    <section className="checkout page-pad">
      <div>
        <p>Secure checkout</p>
        <h1>Delivery and payment</h1>
        <form className="checkout-form">
          <label>
            Full name
            <input type="text" placeholder="Your name" disabled={!isAuthenticated} />
          </label>
          <label>
            Phone number
            <input type="tel" placeholder="+880" disabled={!isAuthenticated} />
          </label>
          <label>
            Delivery address
            <textarea placeholder="House, road, area, city" disabled={!isAuthenticated} />
          </label>
          <label>
            Payment method
            <select defaultValue="pending" disabled>
              <option value="pending">Payment gateway next phase</option>
            </select>
          </label>
          {checkoutState.message && <p className="form-message">{checkoutState.message}</p>}
          <button
            type="button"
            className="primary-button wide"
            disabled={!cart.length || checkoutState.status === 'loading'}
            onClick={onSubmit}
          >
            {checkoutState.status === 'loading' ? 'Creating order...' : 'Place order'}
          </button>
        </form>
      </div>
      <OrderSummary total={total} readonly />
    </section>
  );
}

function AccountPage({ user, orders, message, onLogin, onRegister, onLogout }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submitAccountForm(event) {
    event.preventDefault();
    if (mode === 'login') {
      onLogin({ email: form.email, password: form.password });
      return;
    }
    onRegister(form);
  }

  if (user) {
    return (
      <section className="account page-pad">
        <div>
          <p>Customer account</p>
          <h1>{user.email}</h1>
          {message && <p className="form-message">{message}</p>}
          <button type="button" className="secondary-button wide" onClick={onLogout}>
            Logout
          </button>
        </div>
        <OrderHistory orders={orders} />
      </section>
    );
  }

  return (
    <section className="account page-pad">
      <div>
        <p>Customer account</p>
        <h1>{mode === 'login' ? 'Login to your account' : 'Create an account'}</h1>
        <form className="checkout-form" onSubmit={submitAccountForm}>
          {mode === 'register' && (
            <>
              <label>
                First name
                <input value={form.first_name} onChange={(event) => updateField('first_name', event.target.value)} />
              </label>
              <label>
                Last name
                <input value={form.last_name} onChange={(event) => updateField('last_name', event.target.value)} />
              </label>
            </>
          )}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              placeholder="name@email.com"
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              placeholder="Password"
              onChange={(event) => updateField('password', event.target.value)}
              required
            />
          </label>
          {message && <p className="form-message">{message}</p>}
          <button type="submit" className="primary-button wide">
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
          <button
            type="button"
            className="secondary-button wide"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create account' : 'Back to login'}
          </button>
        </form>
      </div>
      <OrderHistory orders={[]} />
    </section>
  );
}

function OrderHistory({ orders }) {
  return (
    <div className="order-history">
      <h2>Recent orders</h2>
      {!orders.length && (
        <article>
          <strong>No orders yet</strong>
          <span>Ready</span>
          <p>Your backend orders will appear here after checkout.</p>
        </article>
      )}
      {orders.map((order) => (
        <article key={order.id}>
          <strong>#{order.id}</strong>
          <span>{order.status}</span>
          <p>
            {order.items?.length || 0} items - total {formatPrice(order.total_amount)}
          </p>
        </article>
      ))}
    </div>
  );
}

function CartDrawer({ open, cart, total, onClose, onQty, onCartPage, onCheckout }) {
  return (
    <div className={`drawer-overlay ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button className="drawer-scrim" type="button" onClick={onClose} aria-label="Close cart" />
      <aside className="cart-drawer">
        <div className="drawer-header">
          <h2>Cart</h2>
          <button type="button" onClick={onClose}>Close</button>
        </div>
        <CartItems cart={cart} onQty={onQty} />
        <OrderSummary total={total} onCheckout={onCheckout} onCartPage={onCartPage} />
      </aside>
    </div>
  );
}

function CartItems({ cart, onQty }) {
  if (!cart.length) {
    return (
      <div className="empty-state compact">
        <h2>Your cart is empty</h2>
        <p>Add a product to start checkout.</p>
      </div>
    );
  }

  return (
    <div className="cart-items">
      {cart.map((item) => (
        <article key={item.id} className="cart-item">
          <img src={item.image} alt={item.name} />
          <div>
            <strong>{item.name}</strong>
            <span>{formatPrice(item.price)}</span>
            <div className="qty-stepper">
              <button type="button" onClick={() => onQty(item.id, -1)}>-</button>
              <span>{item.qty}</span>
              <button type="button" onClick={() => onQty(item.id, 1)}>+</button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function OrderSummary({ total, onCheckout, onCartPage, readonly = false }) {
  const delivery = total > 0 && total < 2500 ? 80 : 0;
  const grandTotal = total + delivery;

  return (
    <div className="order-summary">
      <div>
        <span>Subtotal</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      <div>
        <span>Delivery</span>
        <strong>{delivery ? formatPrice(delivery) : 'Free'}</strong>
      </div>
      <div className="grand-total">
        <span>Total</span>
        <strong>{formatPrice(grandTotal)}</strong>
      </div>
      {!readonly && (
        <>
          {onCartPage && (
            <button type="button" className="secondary-button wide" onClick={onCartPage}>
              View cart
            </button>
          )}
          <button type="button" className="primary-button wide" disabled={!total} onClick={onCheckout}>
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

function SectionHeading({ label, title, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        <p>{label}</p>
        <h2>{title}</h2>
      </div>
      {action && (
        <button type="button" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div>
        <strong>Go Beauty Bangladesh</strong>
        <p>Gobeauty.bd brings authentic skincare, makeup, and personal care products to beauty shoppers across Bangladesh.</p>
      </div>
      <div>
        <span>Shop</span>
        <button type="button" onClick={() => onNavigate('products')}>All products</button>
        <button type="button" onClick={() => onNavigate('products')}>Skincare</button>
        <button type="button" onClick={() => onNavigate('products')}>Makeup</button>
      </div>
      <div>
        <span>Support</span>
        <button type="button" onClick={() => onNavigate('account')}>Track order</button>
        <button type="button" onClick={() => onNavigate('checkout')}>Delivery</button>
        <button type="button" onClick={() => onNavigate('checkout')}>Payments</button>
      </div>
    </footer>
  );
}
