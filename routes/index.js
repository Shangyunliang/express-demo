const express = require('express');
const router = express.Router();
const User = require('../models/mongo/user');

/* GET home page. */
// eslint-disable-next-line
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', (req, res, next) => {
  (async () => {
    const user = await User.login(req.body.phoneNumber, req.body.password)
    return {
      code: 0,
      data: {
        user: user,
      }
    }
  })()
      .then(r => {
        res.json(r)
      })
      .catch(e => {
        next(e)
      })
})

module.exports = router;
