const express = require('express');
const publicController = require('../controllers/publicController');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const contactController = require('../controllers/contactController');
const adminController = require('../controllers/adminController');
const { requireAdminAuth, requireCustomerAuth } = require('../middleware/auth');
const { productUpload, categoryUpload } = require('../middleware/upload');

const router = express.Router();

router.get('/health', publicController.getHealth);

router.get('/products/featured', publicController.getFeaturedProducts);
router.get('/products/home/:display', publicController.getHomeProducts);
router.get('/products/:slug/similar', publicController.getSimilarProducts);
router.get('/products/:slug', publicController.getProductBySlug);
router.get('/products', publicController.getProducts);
router.get('/categories', publicController.getCategories);
router.get('/settings/whatsapp', publicController.getPublicSettings);

router.post('/auth/register', authController.register);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

router.post('/contact', contactController.submitContactMessage);

router.get('/profile', requireCustomerAuth, profileController.getProfile);
router.put('/profile', requireCustomerAuth, profileController.updateProfile);

router.get('/cart', requireCustomerAuth, cartController.getCart);
router.post('/cart', requireCustomerAuth, cartController.addCartItem);
router.delete('/cart', requireCustomerAuth, cartController.clearCart);
router.put('/cart/:productId', requireCustomerAuth, cartController.updateCartItem);
router.delete('/cart/:productId', requireCustomerAuth, cartController.deleteCartItem);

router.post('/orders', requireCustomerAuth, orderController.createOrder);
router.get('/orders', requireCustomerAuth, orderController.getOrderHistory);

router.post('/admin/login', adminController.login);
router.get('/admin/dashboard', requireAdminAuth, adminController.getDashboard);
router.get('/admin/products', requireAdminAuth, adminController.getProducts);
router.post('/admin/products', requireAdminAuth, productUpload, adminController.createProduct);
router.put('/admin/products/:id', requireAdminAuth, productUpload, adminController.updateProduct);
router.delete('/admin/products/:id', requireAdminAuth, adminController.deleteProduct);
router.get('/admin/categories', requireAdminAuth, adminController.getCategories);
router.post('/admin/categories', requireAdminAuth, categoryUpload, adminController.createCategory);
router.put('/admin/categories/:id', requireAdminAuth, categoryUpload, adminController.updateCategory);
router.delete('/admin/categories/:id', requireAdminAuth, adminController.deleteCategory);
router.get('/admin/orders', requireAdminAuth, adminController.getOrders);
router.put('/admin/orders/:id', requireAdminAuth, adminController.updateOrderStatus);
router.get('/admin/settings/general', requireAdminAuth, adminController.getGeneralSettings);
router.put('/admin/settings/general', requireAdminAuth, adminController.updateGeneralSettings);
router.put('/admin/settings/whatsapp', requireAdminAuth, adminController.updateWhatsappNumber);
router.get('/admin/settings/smtp', requireAdminAuth, adminController.getSmtpSettings);
router.put('/admin/settings/smtp', requireAdminAuth, adminController.updateSmtpSettings);
router.post('/admin/settings/smtp/test', requireAdminAuth, adminController.testSmtpSettings);

module.exports = router;
