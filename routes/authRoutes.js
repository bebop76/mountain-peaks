const router = require('express').Router()
const authController = require('../controllers/authController')
const { requireAuth, checkUser, /*userIsActive*/ } = require('../middleware/authMiddleware')

//GET routes
router.get('/login', authController.login_get)
router.get('/signup', authController.signup_get)
router.get('/forgot', authController.forgot_get)
router.get('/noactive', requireAuth, authController.noactive_get)
router.get('/account', requireAuth, authController.account_get)
router.get('/changepsw', requireAuth, /* userIsActive, */ authController.changepsw_get)
router.get('/setpsw', authController.setpsw_get)
router.get('/activation', authController.activation_get)
router.get('/logout', authController.logout_get)

//POST routes
router.post('/login', authController.login_post)
router.post('/signup', authController.signup_post)
router.post('/forgot', authController.forgot_post)
router.post('/noactive',requireAuth, checkUser,  authController.noactive_post)
router.post('/changepsw', requireAuth,/* userIsActive,*/ checkUser, authController.changepsw_post)


router.get('*', authController._404_get)

module.exports = router