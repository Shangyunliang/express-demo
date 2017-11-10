/**
 * @Author: Shangyunliang <dell>
 * @Date:   2017-10-31T12:04:11+09:00
 * @Email:  1071332303@qq.com
 * @Last modified by:   dell
 * @Last modified time: 2017-10-31T15:15:12+09:00
 */
const uri = 'mongodb://localhost:27017/one_punch'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

mongoose.connect(uri, {useMongoClient: true})
const db = mongoose.connection

db.on('error', () => {
  // eslint-disable-next-line
  console.error('error');
})
db.on('open', () => {
  // eslint-disable-next-line
  console.log('connected!');
})
