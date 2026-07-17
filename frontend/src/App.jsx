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
  search: '',
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
  let response;

  try {
    response = await fetch(buildApiUrl(path), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Backend API is not reachable at ${API_BASE_URL}. Start Django or update VITE_API_BASE_URL.`);
  }

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
    product.image_url ||
    product.image ||
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
    gallery: product.gallery || visual.gallery || [image],
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
  const [authStatus, setAuthStatus] = useState('idle');
  const [authMessage, setAuthMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState('idle');
  const [productStatus, setProductStatus] = useState('idle');
  const [checkoutState, setCheckoutState] = useState({ status: 'idle', message: '' });
  const [pendingRedirectView, setPendingRedirectView] = useState('');
  const [paymentProvider, setPaymentProvider] = useState('bkash');
  const [paymentState, setPaymentState] = useState({
    status: 'idle',
    message: '',
    payment: null,
    redirectUrl: '',
  });

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const filteredProducts = useMemo(() => {
    const next = products.filter((product) => {
      const selectedCategory = categories.find((category) => category.name === filters.category);
      const selectedCategoryNames = selectedCategory
        ? [selectedCategory.name, ...selectedCategory.children]
        : [filters.category];
      const searchTerm = filters.search.trim().toLowerCase();
      const searchText = [
        product.name,
        product.brand,
        product.category,
        product.sku,
        product.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const categoryOk = filters.category === 'All' || selectedCategoryNames.includes(product.category);
      const brandOk = filters.brand === 'All' || product.brand === filters.brand;
      const skinOk = filters.skinType === 'All' || product.skinType.includes(filters.skinType);
      const availableOk = filters.availability === 'All' || product.stock > 0;
      const searchOk = !searchTerm || searchText.includes(searchTerm);
      return categoryOk && brandOk && skinOk && availableOk && searchOk;
    });

    if (filters.sort === 'price-low') return [...next].sort((a, b) => a.price - b.price);
    if (filters.sort === 'price-high') return [...next].sort((a, b) => b.price - a.price);
    if (filters.sort === 'newest') return [...next].reverse();
    if (filters.sort === 'best-selling') return [...next].sort((a, b) => b.reviews - a.reviews);
    return next;
  }, [categories, filters, products]);

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!tokens?.access) return;
    loadCurrentUser(tokens.access);
  }, [tokens]);

  async function loadCatalog() {
    setCatalogStatus('loading');
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
    setAuthStatus('loading');
    try {
      const user = await apiRequest('/auth/me/', { token: accessToken });
      setAuthUser(user);
      setAuthMessage('');
      await loadOrders(accessToken);
      setAuthStatus('idle');
    } catch {
      clearStoredTokens();
      setTokens(null);
      setAuthUser(null);
      setAuthStatus('idle');
    }
  }

  async function loadOrders(accessToken = tokens?.access) {
    if (!accessToken) return;
    setOrdersStatus('loading');
    try {
      const orderData = await apiRequest('/orders/', { token: accessToken });
      setOrders(listFromApi(orderData));
      setOrdersStatus('ready');
    } catch {
      setOrdersStatus('error');
    }
  }

  function navigate(nextView) {
    if (nextView === 'checkout' && !authUser) {
      setPendingRedirectView('checkout');
      setAuthMessage('Login to continue checkout. Your cart is saved.');
      setView('account');
      setCartOpen(false);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setView(nextView);
    setCartOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function searchProducts(search) {
    setFilters({ ...filtersInitial, search: search.trim() });
    navigate('products');
  }

  function browseCategory(category = 'All') {
    setFilters({ ...filtersInitial, category });
    navigate('products');
  }

  async function openProduct(product) {
    const fallbackRelated = products.filter((item) => item.id !== product.id).slice(0, 3);
    setSelectedProduct(product);
    setRelatedProducts(fallbackRelated);
    setProductStatus('loading');
    navigate('product');

    try {
      const [detailData, recommendationData] = await Promise.all([
        apiRequest(`/products/${product.id}/`),
        apiRequest(`/products/${product.id}/recommendations/`),
      ]);
      setSelectedProduct(enrichProduct(detailData));
      const recommendations = listFromApi(recommendationData).map(enrichProduct);
      setRelatedProducts(recommendations.length ? recommendations : fallbackRelated);
      setProductStatus('ready');
    } catch {
      setRelatedProducts(fallbackRelated);
      setProductStatus('fallback');
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
    setAuthStatus('loading');
    setAuthMessage('Signing in...');
    try {
      const data = await apiRequest('/auth/login/', { method: 'POST', body: credentials });
      const nextTokens = { access: data.access, refresh: data.refresh };
      storeTokens(nextTokens);
      setTokens(nextTokens);
      setAuthUser(data.user);
      setAuthMessage('Logged in successfully.');
      await loadOrders(nextTokens.access);
      setAuthStatus('idle');
      if (pendingRedirectView) {
        const nextView = pendingRedirectView;
        setPendingRedirectView('');
        setView(nextView);
        setCartOpen(false);
        setMobileMenuOpen(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      setAuthMessage(error.message);
      setAuthStatus('idle');
    }
  }

  async function register(payload) {
    setAuthStatus('loading');
    setAuthMessage('Creating account...');
    try {
      await apiRequest('/auth/register/', { method: 'POST', body: payload });
      await login({ email: payload.email, password: payload.password });
    } catch (error) {
      setAuthMessage(error.message);
      setAuthStatus('idle');
    }
  }

  function logout() {
    clearStoredTokens();
    setTokens(null);
    setAuthUser(null);
    setOrders([]);
    setAuthMessage('');
  }

  async function createOrder(provider) {
    if (!tokens?.access) {
      setCheckoutState({ status: 'error', message: 'Please login before checkout.' });
      navigate('account');
      return;
    }

    setCheckoutState({ status: 'loading', message: 'Creating your order...' });
    setPaymentState({ status: 'idle', message: '', payment: null, redirectUrl: '' });
    try {
      const order = await apiRequest('/orders/', {
        method: 'POST',
        token: tokens.access,
        body: {
          items: cart.map((item) => ({ product_id: item.id, quantity: item.qty })),
        },
      });
      if (provider === 'cod') {
        setCart([]);
        setCheckoutState({
          status: 'success',
          message: `Order #${order.id} created. Cash on delivery selected.`,
        });
        setPaymentState({
          status: 'success',
          message: 'Cash on delivery order created.',
          payment: null,
          redirectUrl: '',
        });
        await loadOrders(tokens.access);
        navigate('account');
        return;
      }
      setCheckoutState({ status: 'loading', message: 'Order created. Starting payment...' });
      const paymentSession = await initiatePayment(order.id, provider);
      setCart([]);
      setCheckoutState({
        status: 'success',
        message: `Order #${order.id} created. ${providerLabel(provider)} payment is ready.`,
      });
      setPaymentState({
        status: 'success',
        message: `${providerLabel(provider)} payment session created.`,
        payment: paymentSession.payment,
        redirectUrl: paymentSession.redirect_url || '',
      });
      await loadOrders(tokens.access);
      navigate('account');
    } catch (error) {
      setCheckoutState({ status: 'error', message: error.message });
      setPaymentState({ status: 'error', message: error.message, payment: null, redirectUrl: '' });
    }
  }

  async function initiatePayment(orderId, provider) {
    return apiRequest('/payments/initiate/', {
      method: 'POST',
      token: tokens.access,
      body: {
        order_id: orderId,
        provider,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      },
    });
  }

  async function queryBkashPayment(transactionId = paymentState.payment?.transaction_id) {
    if (!tokens?.access || !transactionId) return;

    setPaymentState((current) => ({
      ...current,
      status: 'loading',
      message: 'Checking bKash payment status...',
    }));
    try {
      const data = await apiRequest('/payments/bkash/query/', {
        method: 'POST',
        token: tokens.access,
        body: { paymentID: transactionId },
      });
      setPaymentState({
        status: 'success',
        message: `bKash payment is ${data.payment.status}.`,
        payment: data.payment,
        redirectUrl: paymentState.redirectUrl,
      });
      await loadOrders(tokens.access);
    } catch (error) {
      setPaymentState((current) => ({ ...current, status: 'error', message: error.message }));
    }
  }

  async function executeBkashSandbox(transactionId = paymentState.payment?.transaction_id) {
    if (!transactionId) return;

    setPaymentState((current) => ({
      ...current,
      status: 'loading',
      message: 'Executing bKash sandbox payment...',
    }));
    try {
      const data = await apiRequest('/payments/bkash/execute/', {
        method: 'POST',
        body: { paymentID: transactionId },
      });
      setPaymentState({
        status: 'success',
        message: 'bKash sandbox payment succeeded. Stock was reduced by backend transaction.',
        payment: data.payment,
        redirectUrl: paymentState.redirectUrl,
      });
      if (tokens?.access) await loadOrders(tokens.access);
    } catch (error) {
      setPaymentState((current) => ({ ...current, status: 'error', message: error.message }));
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
        onSearch={searchProducts}
        onCategoryBrowse={browseCategory}
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
            onCategoryBrowse={browseCategory}
            onProductOpen={openProduct}
            onAddToCart={addToCart}
          />
        )}
        {view === 'products' && (
          <ProductsPage
            products={filteredProducts}
            allProducts={products}
            categories={categories}
            catalogStatus={catalogStatus}
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
            productStatus={productStatus}
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
            paymentProvider={paymentProvider}
            onPaymentProviderChange={setPaymentProvider}
            user={authUser}
            isAuthenticated={Boolean(authUser)}
            onSubmit={() => createOrder(paymentProvider)}
          />
        )}
        {view === 'account' && (
          <AccountPage
            user={authUser}
            orders={orders}
            authStatus={authStatus}
            ordersStatus={ordersStatus}
            message={authMessage || checkoutState.message}
            paymentState={paymentState}
            onLogin={login}
            onRegister={register}
            onLogout={logout}
            onNavigate={navigate}
            onBkashQuery={queryBkashPayment}
            onBkashExecute={executeBkashSandbox}
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

function providerLabel(provider) {
  if (provider === 'cod') return 'Cash on delivery';
  return provider === 'stripe' ? 'Stripe card' : 'bKash';
}

function statusLabel(status) {
  const labels = {
    pending: 'Pending',
    paid: 'Paid',
    canceled: 'Canceled',
    initiated: 'Initiated',
    succeeded: 'Succeeded',
    failed: 'Failed',
  };
  return labels[status] || status || 'Pending';
}

function statusTone(status) {
  if (['paid', 'succeeded'].includes(status)) return 'success';
  if (['failed', 'canceled', 'cancelled'].includes(status)) return 'danger';
  return 'pending';
}

function stockMessage(product) {
  if (product.stock === 0) return 'Out of stock';
  if (product.stock <= 5) return `Only ${product.stock} left`;
  return `${product.stock} in stock`;
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
  onSearch,
  onCategoryBrowse,
  mobileMenuOpen,
  onMobileToggle,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const navItems = [
    ['home', 'Home'],
    ['products', 'Products'],
    ['account', 'Account'],
  ];

  function submitSearch(event) {
    event.preventDefault();
    onSearch(searchValue);
    setSearchOpen(false);
  }

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
          <button type="button" onClick={() => onCategoryBrowse('All')}>Categories</button>
          <div className="mega-menu">
            {categories.map((category) => (
              <div key={category.slug || category.name}>
                <button
                  type="button"
                  className="mega-root"
                  onClick={() => onCategoryBrowse(category.name)}
                >
                  {category.name}
                </button>
                {(category.children.length ? category.children : ['All products']).map((child) => (
                  <button
                    key={child}
                    type="button"
                    onClick={() => onCategoryBrowse(child === 'All products' ? 'All' : child)}
                  >
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
        <button
          className="icon-button search-button"
          type="button"
          aria-expanded={searchOpen}
          aria-label="Search products"
          onClick={() => setSearchOpen((open) => !open)}
        >
          <span />
        </button>
        {searchOpen && (
          <form className="header-search-panel" onSubmit={submitSearch}>
            <input
              autoFocus
              type="search"
              value={searchValue}
              placeholder="Search products"
              onChange={(event) => setSearchValue(event.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        )}
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

function HomePage({
  categories,
  products,
  catalogStatus,
  onNavigate,
  onCategoryBrowse,
  onProductOpen,
  onAddToCart,
}) {
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

      {catalogStatus === 'loading' && (
        <StatusBanner title="Loading live catalog" message="Products and categories are syncing from the backend API." />
      )}

      {catalogStatus === 'fallback' && (
        <StatusBanner
          tone="warning"
          title="Demo catalog active"
          message="Backend catalog is unavailable, so the storefront is showing local demo products."
        />
      )}

      <BackendCapabilityStrip catalogStatus={catalogStatus} />

      <section className="category-strip">
        {categories.map((category) => (
          <button
            key={category.slug || category.name}
            type="button"
            onClick={() => onCategoryBrowse(category.name)}
          >
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

function BackendCapabilityStrip({ catalogStatus }) {
  const items = [
    ['Email JWT auth', 'Custom user model'],
    ['DFS recommendations', 'Redis category tree'],
    ['Server totals', 'Order item snapshots'],
    ['Payment strategies', 'Stripe + bKash'],
  ];

  return (
    <section className="capability-strip" aria-label="Backend capabilities">
      <div>
        <span className={`live-dot ${catalogStatus === 'ready' ? 'online' : 'standby'}`} />
        <strong>{catalogStatus === 'ready' ? 'Live backend connected' : 'Storefront demo mode'}</strong>
      </div>
      {items.map(([title, detail]) => (
        <div key={title}>
          <strong>{title}</strong>
          <span>{detail}</span>
        </div>
      ))}
    </section>
  );
}

function ProductsPage({
  products,
  allProducts,
  categories,
  catalogStatus,
  filters,
  onFilterChange,
  onProductOpen,
  onAddToCart,
}) {
  const categoryOptions = [
    'All',
    ...new Set(
      categories.flatMap((category) => [category.name, ...category.children]),
    ),
  ];
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
        {catalogStatus === 'loading' && <ProductSkeletonGrid />}
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

function StatusBanner({ title, message, tone = 'info' }) {
  return (
    <div className={`status-banner ${tone}`}>
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}

function ProductSkeletonGrid() {
  return (
    <div className="skeleton-grid" aria-label="Loading product cards">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="skeleton-card">
          <span />
          <strong />
          <small />
        </div>
      ))}
    </div>
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
        <div className={`stock-line ${product.stock <= 5 ? 'low' : ''}`}>
          <span>{stockMessage(product)}</span>
          <small>SKU {product.sku}</small>
        </div>
        <button className="add-button" type="button" disabled={product.stock === 0} onClick={onAdd}>
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

function ProductDetail({ product, relatedProducts, productStatus, onAddToCart, onProductOpen }) {
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
        {productStatus === 'loading' && (
          <StatusBanner title="Finding recommendations" message="Loading DFS-based related products from the backend." />
        )}
        {productStatus === 'fallback' && (
          <StatusBanner
            tone="warning"
            title="Local recommendations"
            message="Recommendation API is unavailable, so nearby catalog products are shown."
          />
        )}
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

function CheckoutPage({
  cart,
  total,
  checkoutState,
  paymentProvider,
  onPaymentProviderChange,
  user,
  isAuthenticated,
  onSubmit,
}) {
  const [deliveryForm, setDeliveryForm] = useState({
    fullName: getCustomerName(user),
    country: 'Bangladesh',
    district: 'Dhaka',
    thana: '',
    address: '',
    phone: '',
    email: user?.email || '',
    notes: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setDeliveryForm((current) => ({
      ...current,
      fullName: current.fullName || getCustomerName(user),
      email: current.email || user?.email || '',
    }));
  }, [user]);

  function updateDeliveryField(field, value) {
    setDeliveryForm((current) => ({ ...current, [field]: value }));
    setFormError('');
  }

  function submitCheckout(event) {
    event.preventDefault();
    const requiredFields = ['fullName', 'country', 'district', 'thana', 'address', 'phone', 'email'];
    const missingField = requiredFields.find((field) => !String(deliveryForm[field] || '').trim());
    if (missingField) {
      setFormError('Complete the billing and shipping fields before placing the order.');
      return;
    }
    onSubmit();
  }

  return (
    <>
      <CheckoutRouteBar />
      <section className="checkout page-pad">
        <div className="checkout-main">
        <p>Secure checkout</p>
        <h1>Delivery and payment</h1>
        <CouponNotice total={total} />
        <CheckoutProgress
          isAuthenticated={isAuthenticated}
          hasCart={cart.length > 0}
          checkoutState={checkoutState}
        />
        <form id="checkout-form" className="checkout-form billing-form" onSubmit={submitCheckout}>
          <h2>Billing & shipping</h2>
          <label>
            Your name <RequiredMark />
            <input
              type="text"
              value={deliveryForm.fullName}
              placeholder="Your name"
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('fullName', event.target.value)}
            />
          </label>
          <label>
            Country / Region <RequiredMark />
            <select
              value={deliveryForm.country}
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('country', event.target.value)}
            >
              <option value="Bangladesh">Bangladesh</option>
            </select>
          </label>
          <label>
            District <RequiredMark />
            <select
              value={deliveryForm.district}
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('district', event.target.value)}
            >
              {['Dhaka', 'Chattogram', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'].map(
                (district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ),
              )}
            </select>
          </label>
          <label>
            Thana / Police Station <RequiredMark />
            <input
              type="text"
              value={deliveryForm.thana}
              placeholder="e.g. Dhanmondi"
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('thana', event.target.value)}
            />
          </label>
          <label>
            Address <RequiredMark />
            <input
              type="text"
              value={deliveryForm.address}
              placeholder="House, road, area, city"
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('address', event.target.value)}
            />
          </label>
          <label>
            Phone <RequiredMark />
            <input
              type="tel"
              value={deliveryForm.phone}
              placeholder="+880"
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('phone', event.target.value)}
            />
          </label>
          <label>
            Email address <RequiredMark />
            <input
              type="email"
              value={deliveryForm.email}
              placeholder="name@email.com"
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('email', event.target.value)}
            />
          </label>
          <label>
            Payment method
            <PaymentMethodSelector
              value={paymentProvider}
              onChange={onPaymentProviderChange}
              disabled={!isAuthenticated}
            />
          </label>
          <h2>Additional information</h2>
          <label>
            Order notes <span className="optional-text">optional</span>
            <textarea
              value={deliveryForm.notes}
              placeholder="Notes about your order, e.g. special notes for delivery."
              disabled={!isAuthenticated}
              onChange={(event) => updateDeliveryField('notes', event.target.value)}
            />
          </label>
          {formError && <p className="form-message error">{formError}</p>}
          {checkoutState.message && <p className="form-message">{checkoutState.message}</p>}
        </form>
      </div>
      <div className="checkout-side">
        <CheckoutOrderPanel
          cart={cart}
          total={total}
          checkoutState={checkoutState}
          paymentProvider={paymentProvider}
        />
      </div>
    </section>
    </>
  );
}

function CheckoutRouteBar() {
  return (
    <div className="checkout-route-bar">
      <span>Shopping cart</span>
      <strong>Checkout</strong>
      <span>Order complete</span>
    </div>
  );
}

function RequiredMark() {
  return <span className="required-mark">*</span>;
}

function CouponNotice({ total }) {
  const remaining = Math.max(0, 2500 - total);
  const percent = Math.min(100, Math.round((total / 2500) * 100));

  return (
    <div className="coupon-notice">
      <small>
        Have a coupon? <button type="button">Click here to enter your code</button>
      </small>
      <div>
        <span>{remaining ? `Add ${formatPrice(remaining)} to cart and get Free delivery!` : 'Free delivery unlocked.'}</span>
        <strong>
          <i style={{ width: `${percent}%` }} />
        </strong>
      </div>
    </div>
  );
}

function CheckoutOrderPanel({ cart, total, checkoutState, paymentProvider }) {
  const delivery = total > 0 && total < 2500 ? 80 : 0;
  const grandTotal = total + delivery;
  const paymentLabel = providerLabel(paymentProvider);
  const paymentCopy = {
    bkash: 'You will continue to the secure bKash payment flow after placing the order.',
    stripe: 'You will continue to the secure card checkout after placing the order.',
    cod: 'Pay with cash when your order is delivered.',
  }[paymentProvider];

  return (
    <aside className="checkout-order-panel">
      <h2>Your order</h2>
      <div className="order-card">
        <div className="order-table-head">
          <span>Product</span>
          <span>Subtotal</span>
        </div>
        <div className="checkout-order-items">
          {cart.map((item) => (
            <div key={item.id}>
              <span>
                {item.name} <strong>x {item.qty}</strong>
              </span>
              <span>{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
        <div className="order-total-row">
          <span>Subtotal</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        <div className="order-total-row">
          <span>Shipment</span>
          <strong>{delivery ? `Flat rate: ${formatPrice(delivery)}` : 'Free'}</strong>
        </div>
        <div className="order-total-row grand">
          <span>Total</span>
          <strong>{formatPrice(grandTotal)}</strong>
        </div>
      </div>
      <div className="order-payment-note">
        <strong>{paymentLabel}</strong>
        <p>{paymentCopy}</p>
      </div>
      <p className="privacy-note">
        Your personal data will be used to process your order, support your experience, and for
        other purposes described in our privacy policy.
      </p>
      <button
        type="submit"
        form="checkout-form"
        className="primary-button wide checkout-place-button"
        disabled={!cart.length || checkoutState.status === 'loading'}
      >
        {checkoutState.status === 'loading' ? 'Creating order...' : 'Place order'}
      </button>
    </aside>
  );
}

function CheckoutProgress({ isAuthenticated, hasCart, checkoutState }) {
  const steps = [
    ['Account', isAuthenticated],
    ['Cart', hasCart],
    ['Payment', checkoutState.status === 'success'],
  ];

  return (
    <div className="checkout-progress" aria-label="Checkout progress">
      {steps.map(([label, done], index) => (
        <div key={label} className={done ? 'done' : ''}>
          <span>{done ? 'OK' : index + 1}</span>
          <strong>{label}</strong>
        </div>
      ))}
    </div>
  );
}

function PaymentMethodSelector({ value, onChange, disabled }) {
  const providers = [
    {
      key: 'bkash',
      name: 'bKash',
      detail: 'Sandbox callback can execute and query from your account dashboard.',
    },
    {
      key: 'stripe',
      name: 'Stripe card',
      detail: 'Creates a checkout session; final success is confirmed by webhook.',
    },
    {
      key: 'cod',
      name: 'Cash on delivery',
      detail: 'Place the order now and pay when the products arrive.',
    },
  ];

  return (
    <div className="payment-methods" role="radiogroup" aria-label="Payment provider">
      {providers.map((provider) => (
        <button
          key={provider.key}
          type="button"
          className={value === provider.key ? 'selected' : ''}
          disabled={disabled}
          onClick={() => onChange(provider.key)}
        >
          <strong>{provider.name}</strong>
          <span>{provider.detail}</span>
        </button>
      ))}
    </div>
  );
}

function getCustomerName(user) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  return user?.full_name || fullName || user?.email?.split('@')[0] || 'Beauty shopper';
}

function getInitials(user) {
  return getCustomerName(user)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getOrderStats(orders) {
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const paidOrders = orders.filter((order) => order.status === 'paid').length;
  const pendingOrders = orders.filter((order) => order.status === 'pending').length;
  return { totalSpent, paidOrders, pendingOrders };
}

function AccountPage({
  user,
  orders,
  authStatus,
  ordersStatus,
  message,
  paymentState,
  onLogin,
  onRegister,
  onLogout,
  onNavigate,
  onBkashQuery,
  onBkashExecute,
}) {
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
    const customerName = getCustomerName(user);
    const orderStats = getOrderStats(orders);

    return (
      <section className="account-dashboard page-pad">
        <div className="account-hero">
          <div className="customer-card">
            <span className="customer-avatar">{getInitials(user)}</span>
            <div>
              <p>My account</p>
              <h1>{customerName}</h1>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="account-actions">
            <button type="button" className="primary-button" onClick={() => onNavigate('products')}>
              Continue shopping
            </button>
            <button type="button" className="secondary-button" onClick={() => onNavigate('checkout')}>
              Checkout
            </button>
            <button type="button" className="secondary-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>

        {message && <p className="form-message dashboard-message">{message}</p>}
        {paymentState?.message && (
          <p className={`form-message dashboard-message ${paymentState.status === 'error' ? 'error' : ''}`}>
            {paymentState.message}
          </p>
        )}
        {authStatus === 'loading' && (
          <StatusBanner title="Checking session" message="Refreshing your account details." />
        )}

        <div className="dashboard-stats">
          <StatCard label="Orders" value={orders.length} note="Created from backend checkout" />
          <StatCard label="Pending" value={orderStats.pendingOrders} note="Waiting for payment success" />
          <StatCard label="Paid" value={orderStats.paidOrders} note="Payment finalized with stock lock" />
          <StatCard label="Value" value={formatPrice(orderStats.totalSpent)} note="Backend order totals" />
          <StatCard label="Role" value={user.role || 'customer'} note="Account permission level" />
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-panel profile-panel">
            <SectionHeading label="Profile" title="Customer details" />
            <dl className="profile-list">
              <div>
                <dt>Name</dt>
                <dd>{customerName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Customer type</dt>
                <dd>{user.role || 'customer'}</dd>
              </div>
            </dl>
          </div>

          <div className="dashboard-panel delivery-panel">
            <PaymentStatusCard
              paymentState={paymentState}
              onBkashQuery={onBkashQuery}
              onBkashExecute={onBkashExecute}
            />
          </div>

          <OrderHistory orders={orders} ordersStatus={ordersStatus} />
        </div>
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
          <button type="submit" className="primary-button wide" disabled={authStatus === 'loading'}>
            {authStatus === 'loading' ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
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
      <OrderHistory orders={[]} ordersStatus="idle" />
    </section>
  );
}

function PaymentStatusCard({ paymentState, onBkashQuery, onBkashExecute }) {
  const payment = paymentState?.payment;
  const isBkash = payment?.provider === 'bkash';

  if (!payment) {
    return (
      <>
        <SectionHeading label="Payments" title="Gateway status" />
        <div className="preference-list">
          <span>Stripe and bKash are connected through backend strategies</span>
          <span>Stock is reduced only after successful payment confirmation</span>
          <span>New payment sessions will appear here after checkout</span>
        </div>
      </>
    );
  }

  return (
    <>
      <SectionHeading label="Payments" title="Latest payment" />
      <div className="payment-status-card">
        <div>
          <span>Provider</span>
          <strong>{providerLabel(payment.provider)}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong className={`status-pill ${statusTone(payment.status)}`}>{statusLabel(payment.status)}</strong>
        </div>
        <div>
          <span>Transaction</span>
          <code>{payment.transaction_id}</code>
        </div>
        <div>
          <span>Amount</span>
          <strong>{formatPrice(payment.amount)}</strong>
        </div>
        {paymentState.redirectUrl && (
          <a className="secondary-button wide payment-link" href={paymentState.redirectUrl} target="_blank" rel="noreferrer">
            Open payment page
          </a>
        )}
        {isBkash && (
          <div className="payment-actions">
            <button type="button" className="secondary-button" onClick={() => onBkashQuery(payment.transaction_id)}>
              Query bKash
            </button>
            <button type="button" className="primary-button" onClick={() => onBkashExecute(payment.transaction_id)}>
              Execute sandbox
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function OrderHistory({ orders, ordersStatus }) {
  return (
    <div className="order-history dashboard-panel">
      <h2>Recent orders</h2>
      {ordersStatus === 'loading' && (
        <article>
          <strong>Loading orders</strong>
          <span>Syncing</span>
          <p>Order history is being fetched from the backend.</p>
        </article>
      )}
      {ordersStatus === 'error' && (
        <article>
          <strong>Order history unavailable</strong>
          <span>Retry later</span>
          <p>The account is active, but the order API did not respond.</p>
        </article>
      )}
      {ordersStatus !== 'loading' && ordersStatus !== 'error' && !orders.length && (
        <article>
          <strong>No orders yet</strong>
          <span>Ready</span>
          <p>Your backend orders will appear here after checkout.</p>
        </article>
      )}
      {orders.map((order) => (
        <article key={order.id}>
          <div className="order-title-row">
            <strong>Order #{order.id}</strong>
            <span className={`status-pill ${statusTone(order.status)}`}>{statusLabel(order.status)}</span>
          </div>
          <p>
            {order.items?.length || 0} items - total {formatPrice(order.total_amount)}
          </p>
          {!!order.items?.length && (
            <div className="order-item-list">
              {order.items.slice(0, 2).map((item) => (
                <small key={item.id || item.product_id}>
                  {item.quantity} x {item.product_name || item.product_sku}
                </small>
              ))}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

function StatCard({ label, value, note }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
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
  const paymentMethods = ['Visa', 'Mastercard', 'AmEx', 'bKash', 'Nagad', 'Rocket', 'COD'];

  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <span className="footer-mark">GB</span>
        <strong>Go Beauty Bangladesh</strong>
        <p>Authentic skincare, makeup, and personal care products for beauty shoppers across Bangladesh.</p>
      </div>

      <div className="footer-links">
        <span>Pages</span>
        <button type="button" onClick={() => onNavigate('home')}>Home</button>
        <button type="button" onClick={() => onNavigate('products')}>All products</button>
        <button type="button" onClick={() => onNavigate('account')}>My account</button>
        <button type="button" onClick={() => onNavigate('cart')}>Cart</button>
      </div>

      <div className="footer-links">
        <span>Help</span>
        <button type="button" onClick={() => onNavigate('account')}>Track order</button>
        <button type="button" onClick={() => onNavigate('checkout')}>Delivery</button>
        <button type="button" onClick={() => onNavigate('checkout')}>Payments</button>
        <button type="button" onClick={() => onNavigate('checkout')}>Return policy</button>
      </div>

      <form className="newsletter-form">
        <span>Subscribe to newsletter</span>
        <input type="email" placeholder="Enter your email" />
        <button type="button" className="primary-button">Subscribe</button>
      </form>

      <div className="payment-strip">
        <span>Pay with</span>
        <div>
          {paymentMethods.map((method) => (
            <strong key={method}>{method}</strong>
          ))}
        </div>
        <small>Verified by SSLCommerz-ready checkout</small>
      </div>
    </footer>
  );
}
