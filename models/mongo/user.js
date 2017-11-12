/**
 * @Author: Shangyunliang <dell>
 * @Date:   2017-10-31T11:33:37+09:00
 * @Email:  1071332303@qq.com
 * @Last modified by:   dell
 * @Last modified time: 2017-11-01T17:57:59+09:00
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');
const bluebird = require('bluebird');
const pbkdf2Async = bluebird.promisify(crypto.pbkdf2);
const SALT = require('../../cipher').PASSWORD_SALT;

const UserSchema = new Schema({
  name: {type: String, required: true, unique: true},
  age: {type: Number, max:[90, 'Nobody over 90 could use postman']},
  phoneNumber: String,
  password: String,
})

const DEFAULT_PROJECTION = {password: 0, phoneNumber: 0, __v: 0}

// age max error can't be catch with switch
// because it throw an MongDBError
// we can't catch the error.code 

const UserModel = mongoose.model('user', UserSchema);

async function createANewUser (params) {
  const user = new UserModel({name: params.name, age: params.age, phoneNumber: params.phoneNumber});

  user.password = await pbkdf2Async(params.password, SALT, 512, 128, 'sha1')
    .then(r => r.toString())
    .catch(e => {
      console.log(e);
      throw new Error('something goes wrong inside the server')
    });

  let created = await user.save()
    .catch( e => {
      // eslint-disable-next-line
      switch (e.code) {
        case 11000:
          throw Error('Someone has picked that name, choose an other!')
          break
        default:
          throw Error(`error creating user ${ JSON.stringify(params) }`)
          break
      }
    })

  return {
    _id: created._id,
    name: created.name,
    age: created.age,
  }
}

async function getUsers(params = {page: 0, pageSize: 10}) {
  let flow = UserModel.find({});
  flow.select(DEFAULT_PROJECTION)
  flow.skip(params.page * params.pageSize)
  flow.limit(params.pageSize)
  return await flow
    .catch(e => {
      // eslint-disable-next-line
      console.log(e)
      throw new Error('error getting users from db')
    })
}


async function getUserById (userId) {
  return await UserModel.findOne({_id: userId})
    .select(DEFAULT_PROJECTION)
    .catch(e => {
      // eslint-disable-next-line
      console.log(e)
      throw new Error(`error getting useur by id: ${userId}`)
    })
}

async function updateUserById (userId, update) {
  return await UserModel.findOneAndUpdate({_id: userId}, update, {new: true})
    .catch(e=> {
      // eslint-disable-next-line
      console.log(e)
      throw new Error(`error updating user by id: ${userId}`)
    })
}

async function login (phoneNumber, password) {
  password = await pbkdf2Async(password, SALT, 512, 128, 'sha1')
    .then(r => r.toString())
    .catch(e => {
      console.log(e);
      throw new Error('something goes wrong inside the server')
    });

  const user = await UserModel.findOne({phoneNumber: phoneNumber, password: password})
    .select(DEFAULT_PROJECTION)
    .catch(e => {
      console.log(`error logging in, phoneNumber ${phoneNumber}`, {err: e.stack || e })
      throw new Error('something wrong with the server')
    })

  if(!user) throw Error('No such user !');
  return user;
}

module.exports = {
  model: UserModel,
  createANewUser,
  getUsers,
  getUserById,
  updateUserById,
  login,
}
