<template>
  <div class="code_token">
    <div class="token_bg"></div>
    <div class="code_bottom w1200">
      <div class="left fl">
        <div class="div_info">
          <h3 class="title">项目信息</h3>
          <ul class="tonken_info">
            <li><span class="fl">发行总量</span><font class="fl">{{projectsInfo.tokenTotalSupply}}
              {{projectsInfo.tokenSymbol}}</font></li>
            <li><span class="fl">初始流通量</span><font class="fl">{{projectsInfo.tokenInitialCirculatingPercent}}%
              {{projectsInfo.tokenSymbol}} 总量</font></li>
            <li><span class="fl">POCM数量</span><font class="fl">{{projectsInfo.tokenMiningPercent}}%
              {{projectsInfo.tokenSymbol}} 总量</font></li>
            <li><span class="fl">最低抵押NULS数量</span><font class="fl">{{projectsInfo.minimumDeposit}} NULS</font></li>
            <li><span class="fl">已抵押NULS数量</span><font class="fl">{{projectsInfo.totalDeposit}} NULS</font></li>
            <li><span class="fl">已抵押NULS地址数</span><font class="fl">{{projectsInfo.depositCount}} 个</font></li>
            <li><span class="fl">奖励发放周期</span><font class="fl">{{projectsInfo.awardingCycle}} 个区块</font></li>
            <li><span class="fl">单日可获得Token数/100NULS</span><font class="fl">{{projectsInfo.tokenPer100NULSPerDay}}
              {{projectsInfo.tokenSymbol}}</font>
            </li>
            <li>
              <span class="fl">奖励减半周期</span>
              <font class="fl">{{projectsInfo.rewardHalvingCycle ? '减半' : '不减半' }}</font>
            </li>
            <li><span class="fl">预计完成POCM时间</span><font class="fl">{{projectsInfo.completeMiningTime}}</font></li>
          </ul>
        </div>
        <div class="div_info">
          <h3 class="title">Token信息</h3>
          <ul class="tonken_info">
            <li><span class="fl">创建地址</span><font class="fl">{{contractInfo.creater}} </font></li>
            <li><span class="fl">发行总量</span><font class="fl">{{contractInfo.totalSupply}} </font></li>
            <li><span class="fl">Token名称</span><font class="fl">{{contractInfo.tokenName}} </font></li>
            <li><span class="fl">Token符号</span><font class="fl">{{contractInfo.symbol}} </font></li>
            <li><span class="fl">进度系数</span><font class="fl">{{contractInfo.decimals}} </font></li>
          </ul>
        </div>
      </div>
      <div class="right fr">
        <h3 class="tc">请根据实际业务配置Token分发机制并发布合约</h3>
        <div class="entrust shadow">
          <el-form :model="pocmForm" status-icon :rules="pocmRules" ref="pocmForm" class="launch_form">
            <div class="font14" style="margin-bottom: 10px">唯一识别码: {{authorizationCode}}</div>
            <el-form-item label="Token合约地址" prop="tokenAddress">
              <el-input v-model="pocmForm.tokenAddress">
              </el-input>
            </el-form-item>
            <el-form-item label="奖励发放周期" prop="awardingCycle">
              <el-input v-model="pocmForm.awardingCycle">
              </el-input>
            </el-form-item>
            <el-form-item label="单周期奖励Token数量" prop="cycleRewardTokenAmount">
              <el-input v-model="pocmForm.cycleRewardTokenAmount">
              </el-input>
            </el-form-item>
            <el-form-item label="锁定区块数" prop="minimumLocked" v-show="false">
              <el-input v-model="pocmForm.minimumLocked">
              </el-input>
            </el-form-item>
            <el-form-item label="最低抵押NULS数量" prop="minimumDepositNULS">
              <el-input v-model="pocmForm.minimumDepositNULS">
              </el-input>
            </el-form-item>
            <div class="yellow font12">注意: 抵押NULS的10%将会被锁定，无法参与共识</div>
            <el-form-item class="tc">
              <el-button class="btn" @click="submitPocmForm('pocmForm')">发 布</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import nuls from 'nuls-sdk-js'
  import sdk from 'nuls-sdk-js/lib/api/sdk'
  import utils from 'nuls-sdk-js/lib/utils/utils'
  import Password from '@/components/PasswordBar'
  import {divisionDecimals, connect, getLocalTime,} from '@/api/util'
  import {inputsOrOutputs, countFee, validateAndBroadcast, getBalanceOrNonceByAddress,getContractConstructor} from '@/api/requestData'
  import {POCM_API_URL, API_CHAIN_ID, API_PREFIX, POCM} from '@/config'

  export default {
    data() {
      let checkTokenAddress = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入Token合约地址'));
        } else {
          let isNrc20Contract = await this.getContractInfoByContractAddress(value);
          if (!isNrc20Contract) {
            callback(new Error('请输入NRC-20合约地址'));
          } else {
            callback();
          }
        }
      };
      let checkAwardingCycle = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入奖励发放周期'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确奖励发放周期'));
        } else {
          callback();
        }
      };
      let checkCycleRewardTokenAmount = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入单周期奖励Token数量'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确单周期奖励Token数量'));
        } else {
          callback();
        }
      };
      let checkMinimumLocked = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入锁定区块数'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确锁定区块数'));
        } else {
          callback();
        }
      };
      let checkMinimumDepositNULS = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入最低抵押NULS数量'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确最低抵押NULS数量'));
        } else {
          callback();
        }
      };
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        balanceInfo: {},//账户余额信息
        authorizationCode: this.$route.query.authorizationCode,//项目ID
        releaseId: Number(this.$route.query.releaseId),//项目ID
        projectsInfo: {},//项目信息
        contractInfo: {},//合约信息
        pocmName: '',//创建pocm合约名称 symbol_pocm
        pocmForm: {
          tokenAddress: '',
          awardingCycle: '',
          cycleRewardTokenAmount: '',
          minimumLocked: 10,
          minimumDepositNULS: '',
        },
        pocmRules: {
          tokenAddress: [{validator: checkTokenAddress, trigger: 'blur'}],
          awardingCycle: [{validator: checkAwardingCycle, trigger: 'blur'}],
          cycleRewardTokenAmount: [{validator: checkCycleRewardTokenAmount, trigger: 'blur'}],
          minimumLocked: [{validator: checkMinimumLocked, trigger: 'blur'}],
          minimumDepositNULS: [{validator: checkMinimumDepositNULS, trigger: 'blur'}],
        },
        gas: 1,
        price: 25,
        contractCreateTxData: {},//组装创建合约交易
      }
    },
    created() {
      this.selectDataByStatus(this.releaseId);
    },
    components: {
      Password,
    },
    methods: {

      /**
       * @disc: 获取项目详细信息根据Id
       * @params: releaseId
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      async selectDataByStatus(releaseId) {
        const url = POCM_API_URL + '/pocm/release/' + releaseId;
        await axios.get(url)
          .then((response) => {
            console.log(response.data);
            if (response.data.success) {
              response.data.data.mainFunctionPoints = response.data.data.mainFunctionPoints.replace(/↵/g, "\n");
              response.data.data.totalDeposit = divisionDecimals(response.data.data.totalDeposit);
              response.data.data.completeMiningTime = moment(getLocalTime(response.data.data.completeMiningTime)).format('YYYY-MM-DD HH:mm:ss');
              this.projectsInfo = response.data.data;
              this.chartData.rows = [...response.data.data.tokenAllocationList]
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },

      /**
       * @disc: 根据合约地址验证是否为nrc20合约
       * @params: contractAddress
       * @date: 2019-08-26 16:44
       * @author: Wave
       */
      async getContractInfoByContractAddress(contractAddress) {
        return await this.$post('/', 'getContract', [contractAddress])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result") && response.result.nrc20) {
              response.result.totalSupply = divisionDecimals(response.result.totalSupply,response.result.decimals);
              this.contractInfo = response.result;
              this.pocmName = response.result.symbol.toLowerCase() + '_pocm';
              return true
            } else {
              this.contractInfo = {};
              this.pocmName = '';
              //this.$message({message: "验证合约地址错误", type: 'error', duration: 1000});
              return false;
            }
          })
          .catch((error) => {
            this.contractInfo = {};
            this.pocmName = '';
            console.log(error);
            //this.$message({message: "验证合约地址异常: "+JSON.stringify(error), type: 'error', duration: 1000});
            return false;
          });
      },

      /**
       * @disc: 提交发布
       * @params: formName
       * @date: 2019-08-26 16:03
       * @author: Wave
       */
      submitPocmForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
            let newArr = [this.pocmForm.tokenAddress, this.pocmForm.cycleRewardTokenAmount, this.pocmForm.awardingCycle, this.pocmForm.minimumDepositNULS, this.pocmForm.minimumLocked, true, this.authorizationCode, null, null];
            this.validateContractCreate(this.accountInfo.address, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, POCM, newArr);
            this.$refs.password.showPassword(true);
          } else {
            return false;
          }
        });
      },

      /**
       * 获取账户余额
       * @param chainId
       * @param assetId
       * @param address
       **/
      getBalanceByAddress(chainId, assetId, address) {
        getBalanceOrNonceByAddress(chainId, assetId, address).then((response) => {
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
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15, false);
          //console.log(inOrOutputs);
          if (!inOrOutputs.success) {
            this.$message({message: inOrOutputs.data, type: 'error', duration: 1000});
          }
          //console.log(this.contractCreateTxData);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
          let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15, false);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          //console.log(transferInfo);
          //console.log(txhex);
          await validateAndBroadcast(txhex).then((response) => {
            console.log(response);
            if (response.success) {
              this.$message({message: "合约已经发送成功，区块确认需要一定时间", type: 'success', duration: 1000});
              this.validateCode(this.contractCreateTxData.contractAddress, 99);
              this.contractCreateTxData = {};
            } else {
              this.$message({message: "合约验证并广播失败", type: 'error', duration: 3000});
            }
          }).catch((error) => {
            console.log(error);
            this.$message({message: "合约验证并广播异常", type: 'error', duration: 3000});
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
      async validateContractCreate(createAddress, gasLimit, price, contractCode, args) {
        return await this.$post('/', 'validateContractCreate', [createAddress, gasLimit, price, contractCode, args])
          .then((response) => {
            console.log(response);
            if (response.result.success) {
              this.imputedContractCreateGas(createAddress, contractCode, args);
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
      async imputedContractCreateGas(createAddress, contractCode, args) {
        return await this.$post('/', 'imputedContractCreateGas', [createAddress, contractCode, args])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result")) {
              this.gas = response.result.gasLimit;
              this.makeCreateData(response.result.gasLimit, createAddress, contractCode, args, this.pocmName);
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
            //console.log(response.data);
            if (!response.data.success) {
              console.log("认证代码失败");
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },

      /**
       * @disc: url 连接
       * @params: name, parameter, type
       * @date: 2019-08-22 14:26
       * @author: Wave
       */
      toUrl(name, parameter, type) {
        let newPush = connect(name, parameter, type);
        if (newPush.success) {
          this.$router.push(newPush.data);
        }
      },
    }
  }
</script>

<style lang="less">
  .code_token {
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
    }
    .code_bottom {
      z-index: 1;
      position: relative;
      min-height: 700px;
      .left {
        width: 700px;
        margin: 0 0 100px 0;
        .div_info {
          .info {
            padding: 10px 0 0 0;
            line-height: 20px;
          }
        }
        .tonken_info {
          margin: 20px 0 0 0;
          li {
            font-size: 14px;
            width: 650px;
            height: 32px;
            line-height: 32px;
            background-color: #f5f6f9;
            &:nth-child(2n) {
              background-color: #ffffff;
            }
            span {
              color: #9c9c9d;
              width: 250px;
              text-align: right;
              padding-right: 20px;
              border-right: 1px solid #FFFFFF;
            }
            font {
              color: #333333;
              padding-left: 20px;
            }
          }
        }
      }

      .right {
        h3 {
          margin-top: 40px;
          font-size: 16px;
        }
        .entrust {
          width: 500px;
          height: 600px;
          padding: 50px;
          margin: 10px 0 0 0;
          h3 {
            font-size: 16px;
            color: #17202e;
            margin: 0 0 40px 0;
          }
          .launch_form {
            .el-form-item {
              margin-bottom: 15px;
              .el-form-item__label {
                line-height: 20px !important;
              }
              .el-form-item__content {
                line-height: 32px;
                .el-input {
                  .el-input__inner {
                    line-height: 32px;
                    height: 32px;
                  }
                }
                .el-form-item__error {
                  padding-top: 1px;
                  font-size: 10px;
                }
              }
            }
            .btn {
              margin: 10px 0 0 0 !important;
            }
          }
        }
        .i_bt, .n_bt {
          width: 250px;
          float: none;
        }
        .i_bt {
          background: linear-gradient(to right, #4ef16a, #0ede94) !important;
          color: #FFFFFF;
        }
        .n_bt {
          margin: 20px 0 0 0;
        }
      }
    }

  }

</style>


<!--
<template>
  <div class="code_token">
    <div class="token_bg">
      <div class="bg-white shadow w1200 token_form">
        <h3 class="tc">请根据实际业务配置Token分发机制并发布合约</h3>
        <el-form :model="pocmForm" status-icon :rules="pocmRules" ref="pocmForm" class="launch_form w630">
          <div class="font14 mb_20 ">唯一识别码: {{authorizationCode}}</div>
          <el-form-item label="Token合约地址" prop="tokenAddress">
            <el-input v-model="pocmForm.tokenAddress">
            </el-input>
          </el-form-item>
          <el-form-item label="奖励发放周期" prop="awardingCycle">
            <el-input v-model="pocmForm.awardingCycle">
            </el-input>
          </el-form-item>
          <el-form-item label="单周期奖励Token数量" prop="cycleRewardTokenAmount">
            <el-input v-model="pocmForm.cycleRewardTokenAmount">
            </el-input>
          </el-form-item>
          <el-form-item label="锁定区块数" prop="minimumLocked">
            <el-input v-model="pocmForm.minimumLocked">
            </el-input>
          </el-form-item>
          <el-form-item label="最低抵押NULS数量" prop="minimumDepositNULS">
            <el-input v-model="pocmForm.minimumDepositNULS">
            </el-input>
          </el-form-item>
          <div class="yellow font12">注意: 抵押NULS的10%将会被锁定，无法参与共识</div>
          <el-form-item class="tc">
            <el-button class="btn" @click="submitPocmForm('pocmForm')">发 布</el-button>
          </el-form-item>
        </el-form>
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
  import {POCM_API_URL, API_CHAIN_ID, API_PREFIX, POCM} from '@/config'
  import {
    getBalanceOrNonceByAddress,
    countFee,
    inputsOrOutputs,
    validateAndBroadcast,
    getContractConstructor
  } from '@/api/requestData'

  export default {
    data() {
      let checkTokenAddress = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入Token合约地址'));
        } else {
          let isNrc20Contract = await this.getContractInfoByContractAddress(value);
          if (!isNrc20Contract) {
            callback(new Error('请输入NRC-20合约地址'));
          } else {
            callback();
          }
        }
      };
      let checkAwardingCycle = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入奖励发放周期'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确奖励发放周期'));
        } else {
          callback();
        }
      };
      let checkCycleRewardTokenAmount = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入单周期奖励Token数量'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确单周期奖励Token数量'));
        } else {
          callback();
        }
      };
      let checkMinimumLocked = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入锁定区块数'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确锁定区块数'));
        } else {
          callback();
        }
      };
      let checkMinimumDepositNULS = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入最低抵押NULS数量'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确最低抵押NULS数量'));
        } else {
          callback();
        }
      };
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        balanceInfo: {},//账户余额信息
        authorizationCode: this.$route.query.authorizationCode,//项目ID
        pocmName: '',//创建pocm合约名称 symbol_pocm
        pocmForm: {
          tokenAddress: '',
          awardingCycle: '',
          cycleRewardTokenAmount: '',
          minimumLocked: '',
          minimumDepositNULS: '',
        },
        pocmRules: {
          tokenAddress: [{validator: checkTokenAddress, trigger: 'blur'}],
          awardingCycle: [{validator: checkAwardingCycle, trigger: 'blur'}],
          cycleRewardTokenAmount: [{validator: checkCycleRewardTokenAmount, trigger: 'blur'}],
          minimumLocked: [{validator: checkMinimumLocked, trigger: 'blur'}],
          minimumDepositNULS: [{validator: checkMinimumDepositNULS, trigger: 'blur'}],
        },
        gas: 1,
        price: 25,
        contractCreateTxData: {},//组装创建合约交易
      };
    },
    created() {

    },
    components: {
      Password,
    },
    methods: {

      /**
       * @disc: 根据合约地址验证是否为nrc20合约
       * @params: contractAddress
       * @date: 2019-08-26 16:44
       * @author: Wave
       */
      async getContractInfoByContractAddress(contractAddress) {
        return await this.$post('/', 'getContract', [contractAddress])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result") && response.result.nrc20) {
              this.pocmName = response.result.symbol.toLowerCase() + '_pocm';
              return true
            } else {
              this.pocmName = '';
              //this.$message({message: "验证合约地址错误", type: 'error', duration: 1000});
              return false;
            }
          })
          .catch((error) => {
            this.pocmName = '';
            console.log(error);
            //this.$message({message: "验证合约地址异常: "+JSON.stringify(error), type: 'error', duration: 1000});
            return false;
          });
      },

      /**
       * @disc: 提交发布
       * @params: formName
       * @date: 2019-08-26 16:03
       * @author: Wave
       */
      submitPocmForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
            let newArr = [this.pocmForm.tokenAddress, this.pocmForm.cycleRewardTokenAmount, this.pocmForm.awardingCycle, this.pocmForm.minimumDepositNULS, this.pocmForm.minimumLocked, true, this.authorizationCode, null, null];
            this.validateContractCreate(this.accountInfo.address, sdk.CONTRACT_MAX_GASLIMIT, sdk.CONTRACT_MINIMUM_PRICE, POCM, newArr);
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
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15, false);
          //console.log(inOrOutputs);
          if (!inOrOutputs.success) {
            this.$message({message: inOrOutputs.data, type: 'error', duration: 1000});
          }
          //console.log(this.contractCreateTxData);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
          let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 15, false);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 15, this.contractCreateTxData);
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          //console.log(transferInfo);
          //console.log(txhex);
          await validateAndBroadcast(txhex).then((response) => {
            console.log(response);
            if (response.success) {
              this.$message({message: "合约已经发送成功，区块确认需要一定时间", type: 'success', duration: 1000});
              this.validateCode(this.contractCreateTxData.contractAddress, 99);
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
      async validateContractCreate(createAddress, gasLimit, price, contractCode, args) {
        return await this.$post('/', 'validateContractCreate', [createAddress, gasLimit, price, contractCode, args])
          .then((response) => {
            console.log(response);
            if (response.result.success) {
              this.imputedContractCreateGas(createAddress, contractCode, args);
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
      async imputedContractCreateGas(createAddress, contractCode, args) {
        return await this.$post('/', 'imputedContractCreateGas', [createAddress, contractCode, args])
          .then((response) => {
            console.log(response);
            if (response.hasOwnProperty("result")) {
              this.gas = response.result.gasLimit;
              this.makeCreateData(response.result.gasLimit, createAddress, contractCode, args, this.pocmName);
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
        await getBalanceOrNonceByAddress(chainId, assetId, address).then((response) => {
          console.log(response);
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
            //console.log(response.data);
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
  .code_token {
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
      .token_form {
        margin: 80px auto 80px;
        z-index: 1;
        position: relative;
        h3 {
          height: 100px;
          padding: 60px 0 0 0;
        }
        .launch_form {
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
                  padding-top: 2px;
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
-->
