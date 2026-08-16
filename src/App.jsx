import { useEffect, useState } from 'react';
import './App.css';

import Header from './component/header';
import Footer from './component/footer';

import { categories, initialProducts } from './Data/product';

import AuthPage from './Pages/AuthPage';
import HomePage from './Pages/homepage';
import BrowsePage from './Pages/browse';
import ProductDetailPage from './Pages/productdetail';
import AddProductPage from './Pages/Addproductpage';
import EditProductPage from './Pages/editproduct';
import DashboardPage from './Pages/Dashboard';
import ProfilePage from './Pages/profile';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [postAuthRedirect, setPostAuthRedirect] = useState('home');

  const [products, setProducts] = useState(initialProducts);
  const [userProducts, setUserProducts] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  const generateId = () => Date.now() + Math.random();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/browse.php');

        if (!response.ok) {
          throw new Error('PHP backend not ready yet');
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const mappedProducts = data.map((product, index) => ({
            id: Number(product.product_id ?? index + 1),
            title: product.title ?? 'Untitled product',
            seller: product.full_name ?? 'Student seller',
            category: product.category_name ?? 'Other',
            price: Number(product.price ?? 0),
            condition: product.condition ?? 'Good',
            image: product.image ? `http://localhost:8000/uploads/${product.image}` : '📚',
            posted: product.created_at ? new Date(product.created_at).toLocaleDateString() : 'Recently',
            contact: product.email ?? 'seller@campusmart.local',
            ownerId: Number(product.user_id ?? 0),
            isSold: product.status === 'sold',
          }));

          setProducts(mappedProducts);
          setFilteredProducts(mappedProducts);
        }
      } catch (error) {
        console.warn('Using local demo data because PHP backend is not running yet:', error.message);
      }
    };

    loadProducts();
  }, []);

  const openAuth = (mode = 'login', redirectPage = 'home') => {
    setPostAuthRedirect(redirectPage);
    setCurrentPage(mode === 'register' ? 'register' : 'auth');
  };

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.seller.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const handleLogin = (email) => {
    const sanitizedEmail = email.replace(/[<>&"']/g, '').trim();
    setCurrentUser({
      id: generateId(),
      email: sanitizedEmail,
      name: sanitizedEmail.split('@')[0],
      profileImage: '👤',
      joinDate: 'Jan 2024',
    });

    setIsLoggedIn(true);
    setCurrentPage(postAuthRedirect);
    setPostAuthRedirect('home');
  };

  const handleRegister = (name, email) => {
    const sanitizedName = name.replace(/[<>&"']/g, '').trim();
    const sanitizedEmail = email.replace(/[<>&"']/g, '').trim();
    setCurrentUser({
      id: generateId(),
      email: sanitizedEmail,
      name: sanitizedName,
      profileImage: '👤',
      joinDate: 'Today',
    });

    setIsLoggedIn(true);
    setCurrentPage(postAuthRedirect);
    setPostAuthRedirect('home');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setPostAuthRedirect('home');
    setCurrentPage('home');
  };

  const handleAddProduct = (productData) => {
    const newProduct = {
      id: generateId(),
      ...productData,
      seller: currentUser.name,
      posted: 'Just now',
      contact: currentUser.email,
      ownerId: currentUser.id,
    };

    setProducts([newProduct, ...products]);
    setUserProducts([newProduct, ...userProducts]);
    setCurrentPage('dashboard');

    alert('✅ Product posted successfully!');
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product || product.ownerId !== currentUser.id) {
      alert('❌ You can only delete your own items.');
      return;
    }

    setProducts(products.filter((product) => product.id !== productId));
    setUserProducts(userProducts.filter((product) => product.id !== productId));
    alert('✅ Product deleted!');
  };

  const handleBuyProduct = (productId) => {
    if (!isLoggedIn || !currentUser) {
      openAuth('login', `product-${productId}`);
      return;
    }

    const selectedProduct = products.find((item) => item.id === productId);
    if (!selectedProduct) {
      alert('❌ Item not found.');
      return;
    }

    if (selectedProduct.ownerId === currentUser.id) {
      alert('❌ You cannot buy your own listing.');
      return;
    }

    if (selectedProduct.isSold) {
      alert('❌ This item is already sold.');
      return;
    }

    const purchasedProduct = {
      ...selectedProduct,
      isSold: true,
      soldToId: currentUser.id,
      soldToName: currentUser.name,
      soldAt: 'Just now',
    };

    setProducts(products.map((item) => (item.id === productId ? purchasedProduct : item)));
    setUserProducts(userProducts.map((item) => (item.id === productId ? purchasedProduct : item)));
    setPurchasedItems([purchasedProduct, ...purchasedItems.filter((item) => item.id !== productId)]);
    setWishlist(wishlist.filter((id) => id !== productId));
    setCurrentPage('dashboard');

    alert('✅ Purchase successful! You can view this in My Purchases.');
  };

  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      setWishlist(wishlist.filter((id) => id !== productId));
    } else {
      setWishlist([...wishlist, productId]);
    }
  };

  const renderHome = () => (
    <HomePage
      products={filteredProducts}
      wishlist={wishlist}
      onToggleWishlist={toggleWishlist}
      onViewDetails={(id) => setCurrentPage(`product-${id}`)}
      onLoginClick={() => openAuth('login', 'home')}
    />
  );

  const renderBrowse = () => (
    <BrowsePage
      products={filteredProducts}
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      wishlist={wishlist}
      onToggleWishlist={toggleWishlist}
      onViewDetails={(id) => setCurrentPage(`product-${id}`)}
    />
  );

  const renderPage = () => {
    if (!isLoggedIn) {
      if (currentPage === 'auth' || currentPage === 'login' || currentPage === 'register') {
        const initialMode = currentPage === 'register' ? 'register' : 'login';
        return (
          <AuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            initialMode={initialMode}
          />
        );
      }

      if (currentPage === 'browse') {
        return renderBrowse();
      }

      return renderHome();
    }

    switch (currentPage) {
      case 'home':
        return renderHome();

      case 'browse':
        return renderBrowse();

      case 'add-product':
        return (
          <AddProductPage
            onAddProduct={handleAddProduct}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'dashboard':
        return (
          <DashboardPage
            userProducts={userProducts}
            purchasedItems={purchasedItems}
            currentUser={currentUser}
            onDeleteProduct={handleDeleteProduct}
            onEdit={(id) => setCurrentPage(`edit-${id}`)}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onLogout={handleLogout}
            onGoToDashboard={() => setCurrentPage('dashboard')}
            userProductCount={userProducts.length}
          />
        );

      default:
        if (currentPage.startsWith('product-')) {
          const productId = parseFloat(currentPage.split('-')[1]);
          const product = products.find((item) => item.id === productId);

          return product ? (
            <ProductDetailPage
              product={product}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onBuyProduct={handleBuyProduct}
              onLoginToBuy={() => openAuth('login', `product-${product.id}`)}
              currentUser={currentUser}
              isLoggedIn={isLoggedIn}
              setCurrentPage={setCurrentPage}
            />
          ) : null;
        }

        if (currentPage.startsWith('edit-')) {
          const productId = parseFloat(currentPage.split('-')[1]);
          const product = userProducts.find((item) => item.id === productId);

          if (!product || product.ownerId !== currentUser.id) {
            alert('❌ You can only edit your own items.');
            setCurrentPage('dashboard');
            return null;
          }

          return product ? (
            <EditProductPage
              product={product}
              onUpdate={(updated) => {
                setProducts(
                  products.map((item) =>
                    item.id === productId ? updated : item
                  )
                );
                setUserProducts(
                  userProducts.map((item) =>
                    item.id === productId ? updated : item
                  )
                );
                setCurrentPage('dashboard');
              }}
              setCurrentPage={setCurrentPage}
            />
          ) : null;
        }

        return renderHome();
    }
  };

  return (
    <div className="app-shell">
      <Header
        currentUser={currentUser}
        setCurrentPage={setCurrentPage}
        handleLogout={handleLogout}
        onLoginClick={() => openAuth('login', 'home')}
        onBuySellClick={() => {
          if (isLoggedIn) {
            setCurrentPage('dashboard');
            return;
          }

          openAuth('login', 'dashboard');
        }}
        isLoggedIn={isLoggedIn}
      />

      <main className="app-main">{renderPage()}</main>

      {isLoggedIn && <Footer />}
    </div>
  );
}
