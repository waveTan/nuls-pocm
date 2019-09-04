<template>
  <div class="projects_info">

    <div class="projects_top">
      <div class="w1200">
        <div class="left fl"><img :src=projectsInfo.logoUrl width="320" height="180"></div>
        <div class="right fl">
          <h4 class="fCN">{{projectsInfo.name}}</h4>
          <p>{{projectsInfo.projectCard}}</p>
          <h5>
            <span class="clicks" @click="toUrl(projectsInfo.website,'',1)"><i class="el-icon-s-help"></i> 官网</span>
            <!--<span class="clicks"><i class="el-icon-receiving"></i> Github</span>-->
          </h5>
        </div>
      </div>
    </div>

    <div class="projects_bottom  w1200">
      <div class="left fl">
        <div class="div_info">
          <h3 class="title">项目简介</h3>
          <p class="info">{{projectsInfo.projectCard}}</p>
        </div>
        <div class="div_info">
          <h3 class="title">主要功能</h3>
          <pre class="info">{{projectsInfo.mainFunctionPoints}}</pre>
        </div>
        <div class="div_info">
          <h3 class="title">POCM信息</h3>
          <ul class="tonken_info">
            <li><span class="fl">发行总量</span><font class="fl">{{projectsInfo.tokenTotalSupply}}
              {{projectsInfo.tokenSymbol}}</font></li>
            <li><span class="fl">初始流通量</span><font class="fl">{{projectsInfo.tokenInitialCirculatingPercent}}%</font></li>
            <li><span class="fl">POCM数量</span><font class="fl">{{projectsInfo.tokenMiningPercent}}%</font></li>
            <li><span class="fl">剩余Token数量</span><font class="fl">{{projectsInfo.unAllocationTokenAmount}}</font></li>
            <li><span class="fl">POCM合约地址</span><font class="fl">{{projectsInfo.contractAddress}}</font></li>
            <li><span class="fl">最低抵押NULS数量</span><font class="fl">{{projectsInfo.minimumDeposit}} NULS</font></li>
            <li><span class="fl">已抵押NULS数量</span><font class="fl">{{projectsInfo.totalDeposit}} NULS</font></li>
            <li><span class="fl">已抵押NULS地址数</span><font class="fl">{{projectsInfo.depositCount}} 个</font></li>
            <li><span class="fl">单周期奖励Token数量</span><font class="fl">{{projectsInfo.tokenPer100NULSPerDay}}
              {{projectsInfo.tokenSymbol}}</font>
            </li>
            <li>
              <span class="fl">奖励减半周期</span>
              <font class="fl">{{projectsInfo.rewardHalvingCycle ? '减半' : '不减半' }}</font>
            </li>
          </ul>
        </div>
        <div class="div_info cb">
          <h3 class="title">Token分配</h3>
          <div>
            <ve-ring :data="chartData" :settings="chartSettings"></ve-ring>
          </div>
        </div>
      </div>
      <div class="right fr">
        <div class="entrust shadow">
          <h3>预计完成POCM日期: {{projectsInfo.completeMiningTime}}</h3>
          <el-form :model="entrustForm" status-icon :rules="entrustRules" ref="entrustForm" class="entrust_form"
                   v-show="accountInfo.address">
            <div class="tr font12 balance">可用余额: {{accountInfo.balance/100000000}} <span class="fCN">NULS</span></div>
            <el-form-item label="" prop="number">
              <el-input v-model="entrustForm.number" placeholder="请输入委托NULS数量"></el-input>
            </el-form-item>
            <el-form-item class="tc">
              <el-button class="btn" @click="submitForm('entrustForm')">参与POCM</el-button>
            </el-form-item>
          </el-form>
          <div class="tc" v-show="!accountInfo.address">
            <el-button class="i_bt" @click="toUrl('newAddress','',0)">导入账户</el-button>
            <el-button class="n_bt" @click="toUrl('newAddress','',0)">创建账户</el-button>
          </div>
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
  import {POCM_API_URL, API_CHAIN_ID} from '@/config'
  import Password from '@/components/PasswordBar'
  import {
    timesDecimals,
    divisionDecimals,
    Times,
    Plus,
    validateContractCall,
    connect,
    getLocalTime,
    passwordVerification,
  } from '@/api/util'
  import {
    inputsOrOutputs,
    countFee,
    validateAndBroadcast,
    getBalanceOrNonceByAddress
  } from '@/api/requestData'

  export default {
    data() {
      let checkNumber = (rule, value, callback) => {
        let regular = /^([1-9]\d{0,7}|0)(\.\d{1,8})?$/;
        if (!value) {
          return callback(new Error('委托数量不能为空'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确委托数量小数点前后最多八位'));
        } else {
          callback();
        }
      };

      this.chartSettings = {
        dimension: 'allocation',
        metrics: 'percent'
      };
      return {
        accountInfo: localStorage.hasOwnProperty('accountInfo') ? JSON.parse(localStorage.getItem('accountInfo')) : {balance: 0},//账户信息
        balanceInfo: {},//账户余额信息
        releaseId: Number(this.$route.query.releaseId),//项目ID
        projectsInfo: {},//项目信息
        chartData: {
          columns: ['allocation', 'percent'],
          rows: []
        },
        contractCallData: [],
        entrustForm: {
          number: ''
        },
        entrustRules: {
          number: [
            {validator: checkNumber, trigger: 'blur'}
          ]
        },
      };
    },
    created() {
      this.selectDataByStatus(this.releaseId);
      console.log(this.accountInfo)
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
            //console.log(response.data);
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
       * @disc: 委托提交
       * @params: formName
       * @date: 2019-08-20 18:05
       * @author: Wave
       */
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
            this.accountInfo = JSON.parse(localStorage.getItem('accountInfo'));
            this.validateContractCall(this.accountInfo.address, timesDecimals(this.entrustForm.number), 10000000, 25, this.projectsInfo.contractAddress, 'depositForOwn', '', []);
          } else {
            return false;
          }
        });
      },

      /**
       * @disc: 调用验证合约交易
       * @params sender
       * @param value
       * @param gasLimit
       * @param price
       * @param contractAddress
       * @param methodName
       * @param methodDesc
       * @param args
       * @date: 2019-08-22 11:10
       * @author: Wave
       */
      async validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args) {
        let contractCall = await validateContractCall(sender, value, gasLimit, price, contractAddress, methodName, methodDesc, args);
        //console.log(contractCall);
        if (contractCall.success) {
          this.contractCallData = contractCall.data;
          this.$refs.password.showPassword(true);
        } else {
          this.$message({message: "合约调用验证交易错误：" + contractCall.msg, type: 'error', duration: 3000});
        }
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        let isPassword = await passwordVerification(this.accountInfo, password);
        if (isPassword.success) {
          let amount = Number(Times(this.contractCallData.gasLimit, this.contractCallData.price));
          amount = Number(Plus(this.contractCallData.value, amount));
          let transferInfo = {
            fromAddress: this.accountInfo.address,
            assetsChainId: API_CHAIN_ID,
            assetsId: 1,
            amount: amount,
            fee: 100000
          };
          if (this.contractCallData.value > 0) {
            transferInfo.toAddress = this.contractCallData.contractAddress;
            transferInfo.value = this.contractCallData.value;
            transferInfo.amount = amount
          }
          let remark = '';
          let inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
          let tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
          let txhex = '';
          //获取手续费
          let newFee = countFee(tAssemble, 1);
          //console.log(this.balanceInfo);
          //手续费大于0.001的时候重新组装交易及签名
          if (transferInfo.fee !== newFee) {
            transferInfo.fee = newFee;
            inOrOutputs = await inputsOrOutputs(transferInfo, this.balanceInfo, 16);
            tAssemble = await nuls.transactionAssemble(inOrOutputs.data.inputs, inOrOutputs.data.outputs, remark, 16, this.contractCallData);
            txhex = await nuls.transactionSerialize(isPassword.pri, isPassword.pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(isPassword.pri, isPassword.pub, tAssemble);
          }
          //console.log(txhex);
          //验证并广播交易
          await validateAndBroadcast(txhex).then((response) => {
            //console.log(response);
            if (response.success) {
              this.entrustForm.number = '';
              this.$message({message: "委托交易已经发出，区块确定需要一定的时间，你可以在浏览器上查询交易是否已确定", type: 'success', duration: 2000});
            } else {
              this.$message({message: "广播交易失败", type: 'error', duration: 3000});
            }
          }).catch((err) => {
            this.$message({message: "广播交易异常：" + JSON.stringify(err), type: 'error', duration: 1000});
          });
        } else {
          this.$message({message: "对不起，密码错误！", type: 'error', duration: 1000});
        }
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
  .projects_info {
    .projects_top {
      background-color: #17202e;
      height: 300px;
      .left {
        margin: 60px 0 0 0;
      }
      .right {
        margin: 80px 0 0 50px;
        h4 {
          font-size: 24px;
          font-weight: bold;
          line-height: 30px;
        }
        p {
          font-size: 14px;
          color: white;
          line-height: 30px;
        }
        h5 {
          margin: 80px 0 0 0;
          font-size: 14px;
          color: #FFFFFF;
          span {
            margin: 0 50px 0 0;
          }
        }
      }
    }
    .projects_bottom {
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
            width: 680px;
            height: 40px;
            line-height: 40px;
            background-color: #f5f6f9;
            &:nth-child(2n) {
              background-color: #ffffff;
            }
            span {
              color: #9c9c9d;
              width: 250px;
              text-align: right;
              padding-right: 50px;
              border-right: 1px solid #FFFFFF;
            }
            font {
              color: #333333;
              padding-left: 50px;
            }
          }
        }
      }

      .right {
        .entrust {
          width: 400px;
          height: 285px;
          padding: 50px;
          margin: 50px 0 0 0;
          h3 {
            font-size: 14px;
            color: #17202e;
            margin: 0 0 40px 0;
          }
          .entrust_form {
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
