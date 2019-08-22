import axios from 'axios'
import {API_CHAIN_ID, API_TIME, API_URL} from '@/config'

axios.defaults.timeout = API_TIME;
axios.defaults.baseURL = API_URL;
axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * 封装post请求
 * Encapsulation post method
 * @param url
 * @param methodName
 * @param data
 * @returns {Promise}
 */
export function post(url, methodName, data = []) {
  return new Promise((resolve, reject) => {
    data.unshift(API_CHAIN_ID);
    const params = {"jsonrpc": "2.0", "method": methodName, "params": data, "id": 5898};
    /* console.log(url);
     console.log(params);*/
    axios.post(url, params)
      .then(response => {
        resolve(response.data)
      }, err => {
        reject(err)
      })
  })
}
