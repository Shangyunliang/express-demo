/**
 * @Author: Shangyunliang <dell>
 * @Date:   2017-10-31T11:33:37+09:00
 * @Email:  1071332303@qq.com
 * @Last modified by:   dell
 * @Last modified time: 2017-11-01T17:57:59+09:00
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {type: String, required: true, unique: true},
  age: {type: Number, max:[90, 'Nobody over 90 could use postman']},
})

// age max error can't be catch with switch
// because it throw an MongDBError
// we can't catch the error.code 

const UserModel = mongoose.model('user', UserSchema);

async function createANewUser (params) {
  const user = new UserModel({name: params.name, age: params.age});
  return await user.save()
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
}

async function getUsers(params = {page: 0, pageSize: 10}) {
  let flow = UserModel.find({});
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

module.exports = {
  model: UserModel,
  createANewUser,
  getUsers,
  getUserById,
  updateUserById,
}
