import { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

import Header from './component/header';
import Footer from './component/footer';

import { categories } from './Data/product';
import { api } from './api';

import AuthPage from './Pages/AuthPage';
import HomePage from './Pages/homepage';
import BrowsePage from './Pages/browse';
import ProductDetailPage from './Pages/productdetail';
import AddProductPage from './Pages/Addproductpage';
import EditProductPage from './Pages/editproduct';
import DashboardPage from './Pages/Dashboard';
import ProfilePage from './Pages/profile';
import ChangePasswordPage from './Pages/ChangePasswordPage';
import StartupCheckPage from './Pages/StartupCheck';
import AdminPage from './Pages/AdminPage';
import Toast from './component/Toast';

const categoryIds = {
  Textbooks: 1,
  Notes: 2,
  Calculators: 3,
  'Lab Equipment': 4,
  Stationery: 5,
  Electronics: 6,
  'Hostel Essentials': 7,
  Other: 9,
};

function normalizeCategory(categoryName) {
  const value = String(categoryName || '').toLowerCase();

  if (value.includes('book')) return 'Textbooks';
  if (value.includes('note') || value.includes('study')) return 'Notes';
  if (value.includes('calculator')) return 'Calculators';
  if (value.includes('lab')) return 'Lab Equipment';
  if (value.includes('station')) return 'Stationery';
  if (value.includes('electronic')) return 'Electronics';
  if (value.includes('hostel')) return 'Hostel Essentials';
  return 'Other';
}

function normalizeImage(image) {
  if (typeof image !== 'string') return null;
  return image.startsWith('/api/upload.php?file=') || /^https?:\/\//i.test(image)
    ? image
    : null;
}

function pageToPath(page) {
  if (page === 'home') return '/';
  if (page === 'browse') return '/browse';
  if (page === 'auth' || page === 'login') return '/login';
  if (page === 'register') return '/register';
  if (page === 'add-product') return '/products/new';
  if (page === 'dashboard') return '/dashboard';
  if (page === 'profile') return '/profile';
  if (page === 'change-password') return '/profile/password';
  if (page === 'startup-check') return '/system-check';
  if (page === 'admin') return '/admin';
  if (page.startsWith('product-')) return `/products/${page.slice('product-'.length)}`;
  if (page.startsWith('edit-')) return `/products/${page.slice('edit-'.length)}/edit`;
  return '/';
}

function pathToPage(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/browse') return 'browse';
  if (pathname === '/login') return 'login';
  if (pathname === '/register') return 'register';
  if (pathname === '/products/new') return 'add-product';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/profile') return 'profile';
  if (pathname === '/profile/password') return 'change-password';
  if (pathname === '/system-check') return 'startup-check';
  if (pathname === '/admin') return 'admin';

  const editMatch = pathname.match(/^\/products\/(\d+)\/edit$/);
  if (editMatch) return `edit-${editMatch[1]}`;

  const productMatch = pathname.match(/^\/products\/(\d+)$/);
  if (productMatch) return `product-${productMatch[1]}`;

  return 'not-found';
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [postAuthRedirect, setPostAuthRedirect] = useState('/');

  const [products, setProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const currentPage = pathToPage(location.pathname);
  const setCurrentPage = (page) => navigate(pageToPath(page));
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 4500);
  };

  const mapApiProduct = (p) => ({
    id: Number(p.product_id),
    title: p.title || 'Untitled',
    seller: p.full_name || 'Student',
    category: normalizeCategory(p.category_name),
    price: Number(p.price) || 0,
    condition: p.condition || 'Good',
    image: normalizeImage(p.image),
    posted: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently',
    ownerId: Number(p.user_id) || 0,
    isSold: p.status === 'sold',
    buyerId: Number(p.buyer_id) || 0,
    soldAt: p.sold_at ? new Date(p.sold_at).toLocaleDateString() : null,
    description: p.description || '',
  });

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      const apiProducts = data.products || data;
      const mapped = Array.isArray(apiProducts) ? apiProducts.map(mapApiProduct) : [];
      setProducts(mapped);
      setFilteredProducts(mapped);
    } catch (error) {
      console.warn('Could not load products:', error.message);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProducts = async () => {
    if (!currentUser?.id) return;
    try {
      const data = await api.getUserProducts(currentUser.id);
      const apiProducts = data.products || data;
      const mapped = Array.isArray(apiProducts) ? apiProducts.map(mapApiProduct) : [];
      setUserProducts(mapped);
    } catch (error) {
      console.warn('Could not load user products:', error.message);
    }
  };

  const loadPurchasedItems = async () => {
    if (!currentUser?.id) return;
    try {
      const data = await api.getPurchasedProducts();
      const apiProducts = data.products || data;
      const mapped = Array.isArray(apiProducts) ? apiProducts.map(mapApiProduct) : [];
      setPurchasedItems(mapped);
    } catch (error) {
      console.warn('Could not load purchased products:', error.message);
    }
  };

  const loadWishlist = async () => {
    if (!currentUser?.id) return;
    try {
      const data = await api.getWishlist();
      setWishlist(Array.isArray(data.product_ids) ? data.product_ids : []);
    } catch (error) {
      console.warn('Could not load wishlist:', error.message);
    }
  };

  useEffect(() => {
    loadProducts();
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadUserProducts();
      loadPurchasedItems();
      loadWishlist();
    }
  }, [isLoggedIn, currentUser]);

  const checkAuth = async () => {
 try {
  const data = await api.getCurrentUser();

  // Check that data exists before reading data.user
  if (data && data.user) {
    setCurrentUser({
      id: data.user.id,
      email: data.user.email,
      name: data.user.name,
      role: data.user.role,
      profileImage: "👤",
      joinDate: "Member",
    });

    setIsLoggedIn(true);
  } else {
    setCurrentUser(null);
    setIsLoggedIn(false);
    console.warn("No active user session.");
  }

} catch (error) {
  setCurrentUser(null);
  setIsLoggedIn(false);
  console.warn("No active session:", error);
}
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

  const openAuth = (mode = 'login', redirectPage = 'home') => {
    setPostAuthRedirect(pageToPath(redirectPage));
    navigate(mode === 'register' ? '/register' : '/login');
  };

  const handleLogin = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        profileImage: '👤',
        joinDate: 'Member',
      });
      setIsLoggedIn(true);
      navigate(location.state?.from || postAuthRedirect, { replace: true });
      setPostAuthRedirect('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const data = await api.register(name, email, password);
      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        profileImage: '👤',
        joinDate: 'Today',
      });
      setIsLoggedIn(true);
      navigate(location.state?.from || postAuthRedirect, { replace: true });
      setPostAuthRedirect('/');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      const data = await api.forgotPassword(email);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleResetPassword = async (email, otp, password) => {
    try {
      const data = await api.resetPassword(email, otp, password);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleChangePassword = async (currentPassword, newPassword) => {
    try {
      const data = await api.changePassword(currentPassword, newPassword);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLoadAdminDashboard = useCallback(() => api.getAdminDashboard(), []);

  const handleDeleteAdminProduct = useCallback(async (productId) => {
    await api.deleteAdminProduct(productId);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setPostAuthRedirect('/');
      navigate('/', { replace: true });
      setUserProducts([]);
      setPurchasedItems([]);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const image = productData.imageFile
        ? (await api.uploadProductImage(productData.imageFile)).image
        : productData.image || null;
      const payload = {
        title: productData.title,
        category_id: categoryIds[productData.category] || categoryIds.Other,
        description: productData.description || '',
        price: Number(productData.price),
        condition: productData.condition || 'Good',
        image,
      };

      await api.createProduct(payload);
      await loadProducts();
      await loadUserProducts();
      setCurrentPage('dashboard');
      showToast('Product posted successfully.');
    } catch (error) {
      showToast(`Could not post product: ${error.message}`, 'error');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      setProducts(products.filter((product) => product.id !== productId));
      setUserProducts(userProducts.filter((product) => product.id !== productId));
      showToast('Product deleted.');
    } catch (error) {
      showToast(`Could not delete product: ${error.message}`, 'error');
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const image = updatedProduct.imageFile
        ? (await api.uploadProductImage(updatedProduct.imageFile)).image
        : updatedProduct.image || null;
      const payload = {
        product_id: updatedProduct.id,
        title: updatedProduct.title,
        category_id: categoryIds[updatedProduct.category] || categoryIds.Other,
        description: updatedProduct.description || '',
        price: Number(updatedProduct.price),
        condition: updatedProduct.condition || 'Good',
        image,
      };

      await api.updateProduct(payload);
      await loadProducts();
      await loadUserProducts();
      setCurrentPage('dashboard');
      showToast('Product updated.');
    } catch (error) {
      showToast(`Could not update product: ${error.message}`, 'error');
    }
  };

  const handleBuyProduct = async (productId) => {
    if (!isLoggedIn || !currentUser) {
      openAuth('login', `product-${productId}`);
      return;
    }

    const selectedProduct = products.find((item) => item.id === productId);
    if (!selectedProduct) {
      showToast('Item not found.', 'error');
      return;
    }

    if (selectedProduct.ownerId === currentUser.id) {
      showToast('You cannot buy your own listing.', 'error');
      return;
    }

    if (selectedProduct.isSold) {
      showToast('This item is already sold.', 'error');
      return;
    }

    try {
      await api.purchaseProduct(productId);

      const purchasedProduct = {
        ...selectedProduct,
        isSold: true,
        buyerId: currentUser.id,
        soldAt: 'Just now',
      };

      setProducts(products.map((item) => (item.id === productId ? purchasedProduct : item)));
      setUserProducts(userProducts.map((item) => (item.id === productId ? purchasedProduct : item)));
      setPurchasedItems([purchasedProduct, ...purchasedItems.filter((item) => item.id !== productId)]);
      setWishlist(wishlist.filter((id) => id !== productId));
      setCurrentPage('dashboard');

      showToast('Purchase successful. You can view it in My Purchases.');
    } catch (error) {
      showToast(`Purchase failed: ${error.message}`, 'error');
    }
  };

  const toggleWishlist = async (productId) => {
    if (!isLoggedIn) {
      openAuth('login', currentPage);
      return;
    }

    try {
      if (wishlist.includes(productId)) {
        await api.removeFromWishlist(productId);
        setWishlist((items) => items.filter((id) => id !== productId));
      } else {
        await api.addToWishlist(productId);
        setWishlist((items) => [...items, productId]);
      }
    } catch (error) {
      showToast(`Could not update saved items: ${error.message}`, 'error');
    }
  };

  const handleReportProduct = async (productId, reason) => {
    if (!isLoggedIn) {
      openAuth('login', currentPage);
      return { success: false };
    }

    try {
      const data = await api.reportProduct(productId, reason);
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleSellerContact = async (productId) => {
    const data = await api.getSellerContact(productId);
    return data.seller;
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
            onForgotPassword={handleForgotPassword}
            onResetPassword={handleResetPassword}
            initialMode={initialMode}
          />
        );
      }

      if (currentPage === 'browse') {
        return renderBrowse();
      }

      if (
        ['add-product', 'dashboard', 'profile', 'change-password', 'admin'].includes(currentPage)
        || currentPage.startsWith('edit-')
      ) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
      }

      return currentPage === 'not-found' ? <Navigate to="/" replace /> : renderHome();
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
            onGetSellerContact={handleSellerContact}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onChangePasswordPage={() => setCurrentPage('change-password')}
            onLogout={handleLogout}
            onGoToDashboard={() => setCurrentPage('dashboard')}
            userProductCount={userProducts.length}
          />
        );

      case 'admin':
        return currentUser?.role === 'admin' ? (
          <AdminPage
            onLoad={handleLoadAdminDashboard}
            onDeleteProduct={handleDeleteAdminProduct}
            onBack={() => setCurrentPage('home')}
          />
        ) : <Navigate to="/" replace />;

      case 'change-password':
        return (
          <ChangePasswordPage
            onChangePassword={handleChangePassword}
            onBack={() => setCurrentPage('profile')}
          />
        );

      case 'startup-check':
        return <StartupCheckPage />;

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
              onReportProduct={handleReportProduct}
              currentUser={currentUser}
              isLoggedIn={isLoggedIn}
              setCurrentPage={setCurrentPage}
            />
          ) : (
            <div className="page page--narrow empty-state">
              <p className="muted">This listing is unavailable or no longer active.</p>
              <button type="button" className="btn btn-primary" onClick={() => setCurrentPage('browse')}>
                Browse available items
              </button>
            </div>
          );
        }

        if (currentPage.startsWith('edit-')) {
          const productId = parseFloat(currentPage.split('-')[1]);
          const product = userProducts.find((item) => item.id === productId);

          if (!product || product.ownerId !== currentUser.id) {
            showToast('You can only edit your own items.', 'error');
            setCurrentPage('dashboard');
            return null;
          }

          return product ? (
            <EditProductPage
              product={product}
              onUpdate={handleUpdateProduct}
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
        onBuySellClick={() => setCurrentPage('browse')}
        isLoggedIn={isLoggedIn}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="app-main">
        {loading ? <div className="loading">Loading...</div> : renderPage()}
      </main>

      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {isLoggedIn && <Footer />}
    </div>
  );
}
