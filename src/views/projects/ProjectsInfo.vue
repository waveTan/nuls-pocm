<template>
  <div class="projects_info">

    <div class="projects_top">
      <div class="w1200">
        <div class="left fl"><img src="./../../assets/img/list_bg.png"/></div>
        <div class="right fl">
          <h4 class="fCN">{{projectsInfo.name}}</h4>
          <p>{{projectsInfo.projectCard}}</p>
          <h5>
            <span class="clicks"><i class="el-icon-s-help"></i> 官网</span>
            <!--<span class="clicks"><i class="el-icon-receiving"></i> Github</span>-->
          </h5>
        </div>
      </div>
    </div>

    <div class="projects_bottom  w1200">
      <div class="left fl">
        <div class="div_info">
          <h3 class="title">项目介绍</h3>
          <p class="info">{{projectsInfo.introduction}}</p>
        </div>
        <div class="div_info">
          <h3 class="title">主要功能</h3>
          <p class="info">{{projectsInfo.mainFunctionPoints}}</p>
        </div>
        <div class="div_info">
          <h3 class="title">挖矿信息</h3>
          <ul class="tonken_info">
            <li><span class="fl">发行总量</span><font class="fl">{{projectsInfo.tokenTotalSupply}}
              {{projectsInfo.tokenSymbol}}</font></li>
            <li><span class="fl">初始流通量</span><font class="fl">{{projectsInfo.tokenInitialCirculatingPercent}}%
              {{projectsInfo.tokenSymbol}} 总量</font></li>
            <li><span class="fl">可挖矿数量</span><font class="fl">{{projectsInfo.tokenMiningPercent}}%
              {{projectsInfo.tokenSymbol}} 总量</font></li>
            <li><span class="fl">最低抵押NULS数量</span><font class="fl">1000 NULS</font></li>
            <li><span class="fl">已抵押NULS数量</span><font class="fl">55555 NULS</font></li>
            <li><span class="fl">已抵押NULS地址数</span><font class="fl">369 个</font></li>
            <li><span class="fl">奖励发放周期</span><font class="fl">30 个区块</font></li>
            <li><span class="fl">单月可获得Token数/10K NULS</span><font class="fl">36.26 {{projectsInfo.tokenSymbol}}</font>
            </li>
            <li><span class="fl">奖励减半周期</span><font class="fl">不减半</font></li>
            <li><span class="fl">预计完成挖矿时间</span><font class="fl">2019-09-11 15:15:52</font></li>
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
          <h3>预计挖矿结束时间: 2019-08-11 15:08:18</h3>
          <el-form :model="entrustForm" status-icon :rules="entrustRules" ref="entrustForm" class="entrust_form">
            <div class="tr font12 balance">余额: {{accountInfo.balance/100000000}} <span class="fCN">NULS</span></div>
            <el-form-item label="" prop="number">
              <el-input v-model="entrustForm.number" placeholder="请输入委托NULS数量"></el-input>
            </el-form-item>
            <el-form-item class="tc">
              <el-button class="btn" @click="submitForm('entrustForm')">参与委托</el-button>
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
  import nuls from 'nuls-sdk-js'
  import {POCM_API_URL, API_CHAIN_ID, API_PREFIX} from '@/config'
  import Password from '@/components/PasswordBar'
  import {timesDecimals, Times, Plus, validateContractCall} from '@/api/util'
  import {inputsOrOutputs, countFee, validateAndBroadcast, passwordVerification} from '@/api/requestData'

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
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        releaseId: this.$route.query.releaseId,//合约地址
        projectsInfo: {},//项目信息
        chartData: {
          columns: ['allocation', 'percent'],
          rows: [
            {allocation: '基金会', percent: 10},
            {allocation: '战略合作', percent: 20},
            {allocation: '游戏合作', percent: 50},
            {allocation: '团队', percent: 20},
          ]
        },

        entrustForm: {
          number: ''
        },
        entrustRules: {
          number: [
            {validator: checkNumber, trigger: 'blur'}
          ]
        },
        contractCallData: [],
      };
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
      selectDataByStatus(releaseId) {
        const url = POCM_API_URL + '/pocm/release/' + releaseId;
        axios.get(url)
          .then((response) => {
            //console.log(response.data);
            if (response.data.success) {
              this.projectsInfo = response.data.data;
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
            console.log(timesDecimals(this.entrustForm.number));
            this.validateContractCall(this.accountInfo.address, timesDecimals(this.entrustForm.number), 1, 25, contractAddress, 'depositForOwn', '', []);
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
        if (contractCall.success) {
          this.$refs.password.showPassword(true);
        }
      },

      /**
       *  获取密码框的密码
       * @param password
       **/
      async passSubmit(password) {
        let isPassword = await passwordVerification(this.accountInfo, password);
        if (isPassword.success) {
          let pub = this.accountInfo.pub;
          let amount = Number(Times(this.contractCallData.gas, this.contractCallData.price));
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
            transferInfo.value = Number(Times(this.contractCallData.value, 100000000));
            transferInfo.amount = Number(Plus(transferInfo.value, amount))
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
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          } else {
            txhex = await nuls.transactionSerialize(pri, pub, tAssemble);
          }
          //console.log(txhex);
          //验证并广播交易
          await validateAndBroadcast(txhex).then((response) => {
            //console.log(response);
            if (response.success) {
              console.log(response);
              //this.callResult = response
            } else {
              if (response.data.code === 'err_0014') {
                this.$message({message: response.data.message, type: 'error', duration: 3000});
              } else {

                this.$message({message: this.$t('error.' + response.data.code), type: 'error', duration: 3000});
              }
            }
          }).catch((err) => {
            this.$message({message: this.$t('public.err1') + err, type: 'error', duration: 1000});
          });
        } else {
          this.$message({message: this.$t('address.address13'), type: 'error', duration: 1000});
        }
      }
    }
  }
</script>

<style lang="less">
  .projects_info {

    .projects_top {
      background-color: #17202e;
      height: 300px;
      .left {
        margin: 80px 0 0 0;
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
              width: 340px;
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
            font-size: 16px;
            color: #17202e;
            margin: 0 0 40px 0;
          }
          .entrust_form {
            .btn {
              margin: 10px 0 0 0 !important;
            }
          }
        }
      }
    }

  }

</style>
