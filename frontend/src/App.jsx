import { useMemo, useState } from 'react';

const categories = [
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

const products = [
  {
    id: 1,
    slug: 'glow-guard-spf50',
    name: 'Glow Guard SPF 50 PA++++',
    brand: 'Go Beauty Lab',
    category: 'Skincare',
    skinType: ['Oily', 'Combination'],
    price: 1450,
    compareAt: 1750,
    rating: 4.8,
    reviews: 128,
    stock: 34,
    badge: 'Best seller',
    image:
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'A lightweight daily sunscreen made for humid Bangladesh weather with a soft, no-white-cast finish.',
  },
  {
    id: 2,
    slug: 'rice-ceramide-barrier-cream',
    name: 'Rice Ceramide Barrier Cream',
    brand: 'Beauty of Joseon',
    category: 'Skincare',
    skinType: ['Dry', 'Sensitive'],
    price: 1890,
    compareAt: 2150,
    rating: 4.7,
    reviews: 94,
    stock: 21,
    badge: 'Imported',
    image:
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1570194065650-d99fb4d8a609?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'A rich moisturizer for dry and sensitive skin that helps support the skin barrier without heaviness.',
  },
  {
    id: 3,
    slug: 'niacinamide-10-serum',
    name: 'Niacinamide 10% Clarity Serum',
    brand: 'The Ordinary',
    category: 'Skincare',
    skinType: ['Oily', 'Acne Prone'],
    price: 1320,
    compareAt: 1500,
    rating: 4.6,
    reviews: 211,
    stock: 48,
    badge: 'Trending',
    image:
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1629198735660-e39ea93f5c18?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'A simple everyday serum for visible pores, oil balance, and uneven tone.',
  },
  {
    id: 4,
    slug: 'fresh-rose-cleansing-gel',
    name: 'Fresh Rose Cleansing Gel',
    brand: 'Go Beauty Lab',
    category: 'Skincare',
    skinType: ['Normal', 'Combination'],
    price: 890,
    compareAt: 1050,
    rating: 4.5,
    reviews: 63,
    stock: 0,
    badge: 'Restocking',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'A gentle gel cleanser that removes sweat, sunscreen, and daily buildup without stripping the skin.',
  },
  {
    id: 5,
    slug: 'velvet-matte-lip-tint',
    name: 'Velvet Matte Lip Tint',
    brand: 'Rom&nd',
    category: 'Makeup',
    skinType: ['All'],
    price: 980,
    compareAt: 1200,
    rating: 4.9,
    reviews: 156,
    stock: 39,
    badge: 'New shades',
    image:
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1631214540553-ff044a3ff5d4?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'Soft blur lip color with long wear, comfortable pigment, and shades that flatter South Asian skin tones.',
  },
  {
    id: 6,
    slug: 'repair-hair-mask',
    name: 'Keratin Repair Hair Mask',
    brand: 'Lador',
    category: 'Hair & Body',
    skinType: ['All'],
    price: 1680,
    compareAt: 1900,
    rating: 4.4,
    reviews: 77,
    stock: 18,
    badge: 'Salon care',
    image:
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=900&q=80',
    ],
    description:
      'A weekly treatment for dry, heat-styled, or colored hair that needs softness and shine.',
  },
];

const filtersInitial = {
  category: 'All',
  brand: 'All',
  skinType: 'All',
  availability: 'All',
  sort: 'featured',
};

function formatPrice(value) {
  return `Tk ${value.toLocaleString('en-BD')}`;
}

export default function App() {
  const [view, setView] = useState('home');
  const [filters, setFilters] = useState(filtersInitial);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  }, [filters]);

  function navigate(nextView) {
    setView(nextView);
    setCartOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openProduct(product) {
    setSelectedProduct(product);
    navigate('product');
  }

  function addToCart(product) {
    if (product.stock === 0) return;
    setCart((items) => {
      const found = items.find((item) => item.id === product.id);
      if (found) {
        return items.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...items, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  }

  function updateQty(id, delta) {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0),
    );
  }

  return (
    <div className="site-shell">
      <TopNotice />
      <Header
        cartCount={cartCount}
        currentView={view}
        onNavigate={navigate}
        onCartOpen={() => setCartOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen((open) => !open)}
      />

      <main>
        {view === 'home' && (
          <HomePage onNavigate={navigate} onProductOpen={openProduct} onAddToCart={addToCart} />
        )}
        {view === 'products' && (
          <ProductsPage
            products={filteredProducts}
            filters={filters}
            onFilterChange={setFilters}
            onProductOpen={openProduct}
            onAddToCart={addToCart}
          />
        )}
        {view === 'product' && (
          <ProductDetail
            product={selectedProduct}
            onAddToCart={addToCart}
            onProductOpen={openProduct}
          />
        )}
        {view === 'cart' && (
          <CartPage cart={cart} total={cartTotal} onQty={updateQty} onCheckout={() => navigate('checkout')} />
        )}
        {view === 'checkout' && <CheckoutPage cart={cart} total={cartTotal} />}
        {view === 'account' && <AccountPage />}
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
      <span>bKash, Nagad, card, and Cash on Delivery</span>
    </div>
  );
}

function Header({
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
              <div key={category.slug}>
                <strong>{category.name}</strong>
                {category.children.map((child) => (
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

function HomePage({ onNavigate, onProductOpen, onAddToCart }) {
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

      <section className="category-strip">
        {categories.map((category) => (
          <button key={category.slug} type="button" onClick={() => onNavigate('products')}>
            <span>{category.name}</span>
            <small>{category.children.slice(0, 3).join(' / ')}</small>
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
          <strong>Easy payments</strong>
          <span>SSLCommerz-ready checkout for bKash, Nagad, Rocket, and cards.</span>
        </div>
      </section>
    </>
  );
}

function ProductsPage({ products, filters, onFilterChange, onProductOpen, onAddToCart }) {
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
          options={['All', ...new Set(products.concat(windowProductsFallback()).map((p) => p.category))]}
          onChange={(category) => onFilterChange({ ...filters, category })}
        />
        <FilterSelect
          label="Brand"
          value={filters.brand}
          options={['All', ...new Set(windowProductsFallback().map((p) => p.brand))]}
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

function windowProductsFallback() {
  return products;
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
        <button
          className="add-button"
          type="button"
          disabled={product.stock === 0}
          onClick={onAdd}
        >
          {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}

function ProductDetail({ product, onAddToCart, onProductOpen }) {
  const related = products.filter((item) => item.id !== product.id).slice(0, 3);

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
        <ProductGrid products={related} onProductOpen={onProductOpen} onAddToCart={onAddToCart} />
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

function CheckoutPage({ cart, total }) {
  return (
    <section className="checkout page-pad">
      <div>
        <p>Secure checkout</p>
        <h1>Delivery and payment</h1>
        <form className="checkout-form">
          <label>
            Full name
            <input type="text" placeholder="Your name" />
          </label>
          <label>
            Phone number
            <input type="tel" placeholder="+880" />
          </label>
          <label>
            Delivery address
            <textarea placeholder="House, road, area, city" />
          </label>
          <label>
            Payment method
            <select defaultValue="cod">
              <option value="cod">Cash on Delivery</option>
              <option value="bkash">bKash via SSLCommerz</option>
              <option value="nagad">Nagad via SSLCommerz</option>
              <option value="card">Card payment</option>
            </select>
          </label>
          <button type="button" className="primary-button wide" disabled={!cart.length}>
            Place order
          </button>
        </form>
      </div>
      <OrderSummary total={total} readonly />
    </section>
  );
}

function AccountPage() {
  return (
    <section className="account page-pad">
      <div>
        <p>Customer account</p>
        <h1>Login or create an account</h1>
        <form className="checkout-form">
          <label>
            Email or phone
            <input type="text" placeholder="name@email.com" />
          </label>
          <label>
            Password
            <input type="password" placeholder="Password" />
          </label>
          <button type="button" className="primary-button wide">
            Login
          </button>
          <button type="button" className="secondary-button wide">
            Create account
          </button>
        </form>
      </div>
      <div className="order-history">
        <h2>Recent orders</h2>
        <article>
          <strong>#GBD-1024</strong>
          <span>Processing</span>
          <p>2 items - estimated delivery tomorrow in Dhaka.</p>
        </article>
        <article>
          <strong>#GBD-1018</strong>
          <span>Delivered</span>
          <p>Glow Guard SPF 50 and Velvet Matte Lip Tint.</p>
        </article>
      </div>
    </section>
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
