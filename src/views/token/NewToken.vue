<template>
  <div class="new_token">
    <div class="token_bg">
      <div class="bg-white shadow w1200 token_inf">
        <el-tabs v-model="activeName" class="token_tab">
          <el-tab-pane label="发行NRC-20通证" name="nrc20">
            <div class="div_tip">
              NRC-20 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXX
            </div>
            <el-form :model="nrc20Form" status-icon :rules="nrc20Rules" ref="nrc20Form" class="new_form w630">
              <el-form-item label="合约名称" prop="contractName20" v-show="false">
                <el-input v-model="nrc20Form.contractName20">
                </el-input>
              </el-form-item>
              <el-form-item label="通证名称" prop="name20">
                <el-input v-model="nrc20Form.name20">
                </el-input>
              </el-form-item>
              <el-form-item label="通证缩写" prop="symbol20">
                <el-input v-model="nrc20Form.symbol20">
                </el-input>
              </el-form-item>
              <el-form-item label="发行量" prop="circulation">
                <el-input v-model="nrc20Form.circulation">
                </el-input>
              </el-form-item>
              <el-form-item label="通证精度" prop="accuracy">
                <el-input v-model="nrc20Form.accuracy">
                </el-input>
              </el-form-item>
              <div class="font12">
                通证发行手续费和代码认证费用：10 <span class="fCN">NULS</span>&nbsp;
                <el-tooltip content="这里是提示信息" placement="top">
                  <i class="el-icon-warning-outline font14"></i>
                </el-tooltip>
              </div>
              <el-form-item class="tc">
                <el-button class="btn" @click="submitNrc20Form('nrc20Form')">提交</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="发行NRC-721通证" name="nrc721">
            <div class="div_tip">
              NRC-721 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXX
            </div>
            <el-form :model="nrc721Form" status-icon :rules="nrc721Rules" ref="nrc721Form" class="new_form w630">
              <el-form-item label="合约名称" prop="contractName20" v-show="false">
                <el-input v-model="nrc721Form.contractName721">
                </el-input>
              </el-form-item>
              <el-form-item label="通证名称" prop="name721">
                <el-input v-model="nrc721Form.name721">
                </el-input>
              </el-form-item>
              <el-form-item label="通证缩写" prop="symbol721">
                <el-input v-model="nrc721Form.symbol721">
                </el-input>
              </el-form-item>
              <div class="font12">
                通证发行手续费和代码认证费用：10 <span class="fCN">NULS</span>&nbsp;
                <el-tooltip content="这里是提示信息" placement="top">
                  <i class="el-icon-warning-outline font14"></i>
                </el-tooltip>
              </div>
              <el-form-item class="tc">
                <el-button class="btn" @click="submitNrc721Form('nrc721Form')">提交</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
  </div>

</template>

<script>
  import axios from 'axios'
  import nuls from 'nuls-sdk-js'
  import sdk from 'nuls-sdk-js/lib/api/sdk'
  import utils from 'nuls-sdk-js/lib/utils/utils'
  import Password from '@/components/PasswordBar'
  import {POCM_API_URL, API_CHAIN_ID, API_PREFIX, NRC20_HEX, NRC_721} from '@/config'
  import {
    getBalanceOrNonceByAddress,
    countFee,
    inputsOrOutputs,
    validateAndBroadcast,
    getContractConstructor
  } from '@/api/requestData'

  export default {
    data() {
      let checkName20 = (rule, value, callback) => {
        if (!this.accountInfo) {
          return callback(new Error('请先登录！'));
        } else if (!value) {
          return callback(new Error('通证名称不能为空!'));
        } else {
          callback();
        }
      };
      let checkSymbol20 = (rule, value, callback) => {
        if (!this.accountInfo) {
          return callback(new Error('请先登录！'));
        } else if (!value) {
          return callback(new Error('通证缩写不能为空!'));
        } else {
          callback();
        }
      };
      let checkCirculation = (rule, value, callback) => {
        if (!this.accountInfo) {
          return callback(new Error('请先登录！'));
        } else if (!value) {
          return callback(new Error('发行总量不能为空!'));
        } else {
          callback();
        }
      };
      let checkAccuracy = (rule, value, callback) => {
        if (!this.accountInfo) {
          return callback(new Error('请先登录！'));
        } else if (!value) {
          return callback(new Error('通证精度不能为空!'));
        } else {
          callback();
        }
      };

      let checkName721 = (rule, value, callback) => {
        if (!this.accountInfo) {
          return callback(new Error('请先登录！'));
        } else if (!value) {
          return callback(new Error('通证名称不能为空!'));
        } else {
          callback();
        }
      };
      let checkSymbol721 = (rule, value, callback) => {
        if (!this.accountInfo) {
          return callback(new Error('请先登录！'));
        } else if (!value) {
          return callback(new Error('通证缩写不能为空!'));
        } else {
          callback();
        }
      };

      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        balanceInfo: {},//账户余额信息
        activeName: 'nrc20', //tab 默认选中
        nrc20Form: {
          contractName: '',
          name20: '',
          symbol20: '',
          circulation: '',
          accuracy: '',
        },
        nrc20Rules: {
          name20: [{validator: checkName20, trigger: 'blur'}],
          symbol20: [{validator: checkSymbol20, trigger: 'blur'}],
          circulation: [{validator: checkCirculation, trigger: 'blur'}],
          accuracy: [{validator: checkAccuracy, trigger: 'blur'}]
        },

        gas: 1,
        price: 25,
        contractCreateTxData: {},//组装创建合约交易

        nrc721Form: {
          contractName: '',
          name721: '',
          symbol721: '',
        },
        nrc721Rules: {
          name721: [{validator: checkName721, trigger: 'blur'}],
          symbol721: [{validator: checkSymbol721, trigger: 'blur'}],
        }
      };
    },
    created() {

    },
    components: {
      Password,
    },
    methods: {

      /**
       * NRC-20合约提交
       * @param formName
       */
      submitNrc20Form(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
            let newArr = Object.values(this.nrc20Form);
            newArr.shift();
            this.validateContractCreate(this.accountInfo.address, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, NRC20_HEX, newArr, this.nrc20Form);
            this.$refs.password.showPassword(true);
          } else {
            return false;
          }
        });
      },

      /**
       * NRC-721合约提交
       * @param formName
       */
      submitNrc721Form(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
            let newArr = Object.values(this.nrc721Form);
            newArr.shift();
            this.validateContractCreate(this.accountInfo.address, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, NRC_721, newArr, this.nrc721Form);
            this.$refs.password.showPassword(true);
          } else {
            return false;
          }
        });
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        const pri = nuls.decrypteOfAES(this.accountInfo.aesPri, password);
        const newAddressInfo = nuls.importByKey(API_CHAIN_ID, pri, password, API_PREFIX);
        let amount = this.contractCreateTxData.gasLimit * this.contractCreateTxData.price;
        if (newAddressInfo.address === this.accountInfo.address) {
          let transferInfo = {
            fromAddress: this.accountInfo.address,
            assetsChainId: API_CHAIN_ID,
            assetsId: 1,
            amount: amount,
            fee: 100000
          };
          let pub = this.accountInfo.pub;
          let remark = '';
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15, true);
          console.log(inOrOutputs);
          if (!inOrOutputs.success) {
            this.$message({message: inOrOutputs.data, type: 'error', duration: 1000});
          }
          console.log(this.contractCreateTxData);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
          let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15, true);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          console.log(transferInfo);
          //console.log(txhex);
          await validateAndBroadcast(txhex).then((response) => {
            console.log(response);
            if (response.success) {
              this.$message({message: "合约已经发送成功，区块确认需要一定时间", type: 'success', duration: 1000});
              this.validateCode(this.contractCreateTxData.contractAddress, this.activeName === 'nrc20' ? 1 : 2);
              this.contractCreateTxData = {};
            } else {
              this.$message({message: "合约验证并广播失败", type: 'error', duration: 1000});
            }
          }).catch((error) => {
            console.log(error);
            this.$message({message: "合约验证并广播异常", type: 'error', duration: 1000});
          });
        } else {
          this.$message({message: "对不起，密码错误", type: 'error', duration: 1000});
        }
      },

      /**
       * 验证创建合约交易
       * @param createAddress
       * @param gasLimit
       * @param price
       * @param contractCode
       * @param args
       */
      async validateContractCreate(createAddress, gasLimit, price, contractCode, args, formData) {
        return await this.$post('/', 'validateContractCreate', [createAddress, gasLimit, price, contractCode, args])
          .then((response) => {
            console.log(response);
            if (response.result.success) {
              this.imputedContractCreateGas(createAddress, contractCode, args, formData);
            } else {
              this.$message({message: "验证创建合约交易错误", type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message({message: "验证创建合约交易异常", type: 'error', duration: 1000});
          });
      },

      /**
       * 预估创建合约交易的gas
       * @param createAddress
       * @param contractCode
       * @param args
       */
      async imputedContractCreateGas(createAddress, contractCode, args, formData) {
        return await this.$post('/', 'imputedContractCreateGas', [createAddress, contractCode, args])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result")) {
              this.gas = response.result.gasLimit;
              this.makeCreateData(response.result.gasLimit, createAddress, contractCode, args, formData.contractName);
            } else {
              this.$message({message: "预估创建合约交易的gas错误", type: 'error', duration: 1000});
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message({message: "预估创建合约交易的gas异常", type: 'error', duration: 1000});
          });
      },

      /**
       * 组装创建合约交易的txData
       * @param createAddress
       * @param gasLimit
       * @param contractCode
       * @param args
       * @param alias
       */
      async makeCreateData(gasLimit, createAddress, contractCode, args, alias) {
        let contractCreate = {};
        contractCreate.chainId = API_CHAIN_ID;
        contractCreate.sender = createAddress;
        contractCreate.gasLimit = gasLimit;
        contractCreate.price = sdk.CONTRACT_MINIMUM_PRICE;
        contractCreate.contractCode = contractCode;
        contractCreate.alias = alias;
        let constructor = await getContractConstructor(contractCode);
        let contractConstructorArgsTypes = this.makeContractConstructorArgsTypes(constructor);
        if (args.length !== 0) {
          contractCreate.args = await utils.twoDimensionalArray(args, contractConstructorArgsTypes);
        } else {
          contractCreate.args = null;
        }
        contractCreate.contractAddress = sdk.getStringContractAddress(API_CHAIN_ID);
        if (!contractCreate.chainId || !contractCreate.contractAddress || !contractCreate.contractCode || !contractCreate.gasLimit || !contractCreate.price || !contractCreate.sender) {
          this.$message({message: '组装创建合约交易的txData错误', type: 'error', duration: 1000});
        } else {
          this.contractCreateTxData = contractCreate;
          console.log(this.contractCreateTxData);
        }
      },

      /**
       * 组装构造函数的参数类型
       * @param constructor
       */
      async makeContractConstructorArgsTypes(constructor) {
        let args = constructor;
        let length = args.length;
        let contractConstructorArgsTypes = new Array(length);
        let arg;
        for (let i = 0; i < length; i++) {
          arg = args[i];
          contractConstructorArgsTypes[i] = arg.type;
        }
        return contractConstructorArgsTypes;
      },

      /**
       * 获取账户余额
       * @param chainId
       * @param assetId
       * @param address
       **/
      async getBalanceByAddress(chainId, assetId, address) {
        await  getBalanceOrNonceByAddress(chainId, assetId, address).then((response) => {
          //console.log(response);
          if (response.success) {
            this.balanceInfo = response.data;
          } else {
            this.$message({message: "获取账户余额错误", type: 'error', duration: 1000});
          }
        }).catch((error) => {
          console.log(error);
          this.$message({message: "获取账户余额异常", type: 'error', duration: 1000});
        });
      },

      /**
       * @disc: 认证代码
       * @params: contratAddress ，type
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      validateCode(contratAddress, type) {
        const url = POCM_API_URL + '/pocm/contract/validate';
        const data = {contratAddress: contratAddress, type: type};
        axios.post(url, data)
          .then((response) => {
            console.log(response.data);
            if (!response.data.success) {
              console.log("认证代码失败");
            }
          })
          .catch((error) => {
            console.log(error)
          })
      }

    }
  }
</script>

<style lang="less">
  .new_token {
    .token_bg {
      width: 140%;
      height: 220px;
      position: absolute;
      left: -20%;
      top: 0;
      z-index: -1;
      content: '';
      border-radius: 0 0 50% 50%;
      background: linear-gradient(to right, #4ef16a, #0ede94);
      padding-top: 50px;
      .token_inf {
        margin: 80px auto 80px;
        z-index: 1;
        position: relative;
        .token_tab {
          margin: 0 150px 0 150px;
          padding-top: 30px;
          .el-tabs__header {
            .el-tabs__nav-wrap {
              .el-tabs__active-bar {
                background-color: #0ede94;
              }
              .el-tabs__item {
                color: #17202e;
                font-size: 16px;
              }
            }
          }
          .el-tabs__content {
            width: 630px;
            margin: 40px auto 0;
            .div_tip {
              background-color: #F5F6F9;
              padding: 20px;
              line-height: 22px;
              font-size: 14px;
              margin: 0 0 40px 0;
            }
          }
        }
        .new_form {
          padding-bottom: 50px;
          .el-form-item {
            margin-bottom: 20px;
            .el-form-item__label {
              padding: 0 5px 5px 0;
              line-height: 18px;
            }
            .el-form-item__content {
              line-height: 20px;
              .el-input {
                .el-input__inner {
                  height: 30px;
                  line-height: 30px;
                  border-radius: 2px;
                }
                .el-input__icon {
                  line-height: 30px;
                }
              }
            }
          }
        }
      }
    }

  }

</style>
