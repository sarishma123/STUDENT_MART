import { useEffect, useState } from 'react';
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [postAuthRedirect, setPostAuthRedirect] = useState('home');

  const [products, setProducts] = useState([]);
  const [userProducts, setUserProducts] = useState([]);
  const [purchasedItems, setPurchasedItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const generateId = () => Date.now() + Math.random();

  const mapApiProduct = (p) => ({
    id: Number(p.product_id),
    title: p.title || 'Untitled',
    seller: p.full_name || 'Student',
    category: p.category_name || 'Other',
    price: Number(p.price) || 0,
    condition: p.condition || 'Good',
    image: p.image || null,
    posted: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Recently',
    contact: p.email || '',
    ownerId: Number(p.user_id) || 0,
    isSold: p.status === 'sold',
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
      console.warn('Backend not available, using demo data:', error.message);
      const { initialProducts } = await import('./Data/product');
      const mapped = initialProducts.map((p, index) => ({ ...p, id: Number(p.id || index + 1) }));
      setProducts(mapped);
      setFilteredProducts(mapped);
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

  useEffect(() => {
    loadProducts();
    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadUserProducts();
    }
  }, [isLoggedIn, currentUser]);

  const checkAuth = async () => {
    try {
      const data = await api.getCurrentUser();
      if (data.user) {
        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          profileImage: '👤',
          joinDate: 'Member',
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.warn('No active session');
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
    setPostAuthRedirect(redirectPage);
    setCurrentPage(mode === 'register' ? 'register' : 'auth');
  };

  const handleLogin = async (email, password) => {
    try {
      const data = await api.login(email, password);
      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        profileImage: '👤',
        joinDate: 'Member',
      });
      setIsLoggedIn(true);
      setCurrentPage(postAuthRedirect);
      setPostAuthRedirect('home');
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
        profileImage: '👤',
        joinDate: 'Today',
      });
      setIsLoggedIn(true);
      setCurrentPage(postAuthRedirect);
      setPostAuthRedirect('home');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.warn('Logout error:', error.message);
    } finally {
      setIsLoggedIn(false);
      setCurrentUser(null);
      setPostAuthRedirect('home');
      setCurrentPage('home');
      setUserProducts([]);
      setPurchasedItems([]);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      const payload = {
        title: productData.title,
        category_id: 1,
        description: productData.description || '',
        price: Number(productData.price),
        condition: productData.condition || 'Good',
        image: productData.image || null,
      };

      await api.createProduct(payload);
      await loadProducts();
      await loadUserProducts();
      setCurrentPage('dashboard');
      alert('✅ Product posted successfully!');
    } catch (error) {
      alert('❌ Failed to post product: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
      setProducts(products.filter((product) => product.id !== productId));
      setUserProducts(userProducts.filter((product) => product.id !== productId));
      alert('✅ Product deleted!');
    } catch (error) {
      alert('❌ Failed to delete: ' + error.message);
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    try {
      const payload = {
        product_id: updatedProduct.id,
        title: updatedProduct.title,
        category_id: 1,
        description: updatedProduct.description || '',
        price: Number(updatedProduct.price),
        condition: updatedProduct.condition || 'Good',
        image: updatedProduct.image || null,
      };

      await api.updateProduct(payload);
      await loadProducts();
      await loadUserProducts();
      setCurrentPage('dashboard');
      alert('✅ Product updated!');
    } catch (error) {
      alert('❌ Failed to update: ' + error.message);
    }
  };

  const handleBuyProduct = async (productId) => {
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

    try {
      await api.updateProduct({
        product_id: productId,
        title: selectedProduct.title,
        category_id: 1,
        description: selectedProduct.description,
        price: selectedProduct.price,
        condition: selectedProduct.condition,
        status: 'sold',
      });

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
    } catch (error) {
      alert('❌ Purchase failed: ' + error.message);
    }
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
        onBuySellClick={() => {
          if (isLoggedIn) {
            setCurrentPage('dashboard');
            return;
          }

          openAuth('login', 'dashboard');
        }}
        isLoggedIn={isLoggedIn}
      />

      <main className="app-main">
        {loading ? <div className="loading">Loading...</div> : renderPage()}
      </main>

      {isLoggedIn && <Footer />}
    </div>
  );
}
