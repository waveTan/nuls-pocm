import {BigNumber} from 'bignumber.js'
import nuls from 'nuls-sdk-js'
import utils from 'nuls-sdk-js/lib/utils/utils'
import {API_CHAIN_ID, API_PREFIX} from '@/config'
import {post} from './https'

/**
 * 10的N 次方
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Power(arg) {
  let newPower = new BigNumber(10);
  return newPower.pow(arg);
}

/**
 * 减法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Minus(nu, arg) {
  let newMinus = new BigNumber(nu);
  return newMinus.minus(arg);
}

/**
 * 乘法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Times(nu, arg) {
  let newTimes = new BigNumber(nu);
  return newTimes.times(arg);
}

/**
 * 加法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Plus(nu, arg) {
  let newPlus = new BigNumber(nu);
  return newPlus.plus(arg);
}

/**
 * 除法
 * @param nu
 * @param arg
 * @returns {BigNumber}
 * @constructor
 */
export function Division(nu, arg) {
  let newDiv = new BigNumber(nu);
  return newDiv.div(arg);
}

/**
 * 数字除以精度系数
 */
export function divisionDecimals(nu, decimals = 8) {
  let newNu = new BigNumber(Division(nu, Power(decimals)).toString());
  return newNu.toFormat().replace(/[,]/g, '');
}

/**
 * 数字乘以精度系数
 */
export function timesDecimals(nu, decimals = 8) {
  let newNu = new BigNumber(Times(nu, Power(decimals)).toString());
  return Number(newNu);
}

/**
 * @disc: 验证密码
 * @params:  accountInfo
 * @params:  password
 * @date: 2019-08-22 12:05
 * @author: Wave
 */
export function passwordVerification(accountInfo, password) {
  let aesPri = accountInfo.aesPri ? accountInfo.aesPri : accountInfo.encryptedPrivateKey;
  const pri = nuls.decrypteOfAES(aesPri, password);
  const newAddressInfo = nuls.importByKey(API_CHAIN_ID, pri, password, API_PREFIX);
  if (newAddressInfo.address === accountInfo.address) {
    return {success: true, pri: pri, pub: accountInfo.pub};
  } else {
    return {success: false};
  }
}

/**
 * 根据不同时区显示时间
 * @param time
 * @returns {*}
 */
export function getLocalTime(time) {
  if (typeof time !== 'number') return;
  let d = new Date();
  let offset = d.getTimezoneOffset() * 60000;
  let localUtc = new Date().getTimezoneOffset() / 60;
  let utcTime;
  if (localUtc > 0) {
    utcTime = time - offset;
  } else {
    utcTime = time + offset;
  }
  let localTime = utcTime + 3600000 * Math.abs(localUtc);
  return new Date(localTime);
}

/**
 * @disc: 获取utf-8中英文混合长度
 * @params: string
 * @date: 2019-08-21 15:35
 * @author: Wave
 * @returns Number
 */
export function stringLength(string) {
  let enc = new TextEncoder("utf-8");
  return enc.encode(string).length;
}

/**
 * 验证调用合约交易
 * @param sender
 * @param value
 * @param gasLimit
 * @param price
 * @param contractAddress
 * @param methodName
 * @param methodDesc
 * @param args
 */
export async function validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
  let newData = await post('/', 'validateContractCall', [sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args]);
  //console.log(newData);
  if (newData.result.success) {
    return imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args)
  } else {
    return {success: false, code: 1000, msg: newData.result.msg};
  }
}

/**
 * 预估调用合约交易的gas
 * @param sender
 * @param value
 * @param contractAddress
 * @param methodName
 * @param methodDesc
 * @param args
 */
export async function imputedContractCallGas(sender, value, contractAddress, methodName, methodDesc, args) {
  let newData = await post('/', 'imputedContractCallGas', [sender, value, contractAddress, methodName, methodDesc, args]);
  if (newData.hasOwnProperty("result")) {
    let contractConstructorArgsTypes = await getContractMethodArgsTypes(contractAddress, methodName);
    if (contractConstructorArgsTypes.success) {
      let newArgs = utils.twoDimensionalArray(args, contractConstructorArgsTypes);
      let contractCallData = {
        chainId: API_CHAIN_ID,
        sender: sender,
        contractAddress: contractAddress,
        value: value,
        gasLimit: newData.result.gasLimit,
        price: 25,
        methodName: methodName,
        methodDesc: methodDesc,
        args: newArgs
      };
      //console.log(contractCallData);
      return {success: true, data: contractCallData};
    } else {
      return {success: false, code: 1001};
    }
  }
}

/**
 * 获取合约指定函数的参数类型
 * @param contractAddress
 * @param  methodName
 */
export async function getContractMethodArgsTypes(contractAddress, methodName) {
  let data = await post('/', 'getContractMethodArgsTypes', [contractAddress, methodName]);
  if (data.hasOwnProperty("result")) {
    return {success: true, data: data.result};
  } else {
    return {success: false, msg: data.result.msg, code: 1002};
  }
}

/**
 * 连接跳转
 * @param name
 * @param parameter
 * @param type 0:路由跳转 1：连接跳转（浏览器、其他地址）
 */
export function connect(name, parameter, type) {
  if (type === 0) {
    let newQuery = {};
    let newPush = {name: name,query:{}};
    console.log(name);
    console.log(parameter);
    console.log(!parameter);
    if (parameter) {
      if (name === 'projectsInfo') {
        newQuery = {releaseId: parameter}
      }
      newPush.query = newQuery;
    }
    return {success: true, data: newPush};
  } else {
    window.open(name,'_blank');
    return {success: false};
  }
}
