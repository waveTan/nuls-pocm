<template>
  <div class="pocm_user">
    <div class="pocm_user_top">
      <div class="w1200">
        <div class="left fl">
          <h3>Aleph <span class="clicks">查看项目详情</span></h3>
          <p>合约地址</p>
          <h6>tNULSeBaMvH8TmMZUPQKvc19qeLrD7oN643aBL</h6>
        </div>
        <div class="right fl">
          <h4>
            <span>总收益</span>
            <span>22222.2222<font class="fCN"> NULS</font></span>
          </h4>
          <h4>
            <span>获得抵押</span>
            <span>22222.2222<font class="fCN"> NULS</font></span>
          </h4>
        </div>
      </div>
    </div>
    <div class="pocm_user_bottom  w1200">
      <div class="tr">
        <el-button class="btn" @click="submitForm('launchForm')">增加节点</el-button>
      </div>
      <ul class="list">
        <li class="shadow fl">
          <h5>Alelph <span class="fr"><i class="el-icon-apple"></i>运行中</span></h5>
          <p>总收益: 1895.32356 <span  class="fr">保证金: 300000.00222</span></p>
          <p>佣金比例: 50% <span  class="fr">委托量: 300000.00222</span></p>
          <p><span  class="fr">信用值: 0.98</span></p>
        </li>
        <li class="shadow fl">
          <h5>Alelph <span class="fr"><i class="el-icon-apple"></i>运行中</span></h5>
          <p>总收益: 1895.32356 <span  class="fr">保证金: 300000.00222</span></p>
          <p>佣金比例: 50% <span  class="fr">委托量: 300000.00222</span></p>
          <p><span  class="fr">信用值: 0.98</span></p>
        </li>
        <li class="shadow fl">
          <h5>Alelph <span class="fr"><i class="el-icon-apple"></i>运行中</span></h5>
          <p>总收益: 1895.32356 <span  class="fr">保证金: 300000.00222</span></p>
          <p>佣金比例: 50% <span  class="fr">委托量: 300000.00222</span></p>
          <p><span  class="fr">信用值: 0.98</span></p>
        </li>
        <li class="shadow fl">
          <h5>Alelph <span class="fr"><i class="el-icon-apple"></i>运行中</span></h5>
          <p>总收益: 1895.32356 <span  class="fr">保证金: 300000.00222</span></p>
          <p>佣金比例: 50% <span  class="fr">委托量: 300000.00222</span></p>
          <p><span  class="fr">信用值: 0.98</span></p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import {POCM_API_URL, API_CHAIN_ID, API_PREFIX} from '@/config'
  import {
    timesDecimals,
    divisionDecimals,
    Times,
    Plus,
    validateContractCall,
    connect,
    getLocalTime,
    passwordVerification
  } from '@/api/util'
  import {
    inputsOrOutputs,
    countFee,
    validateAndBroadcast,
    getBalanceOrNonceByAddress
  } from '@/api/requestData'

  export default {
    data() {
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        balanceInfo: {},//账户余额信息
        releaseId: this.$route.query.releaseId,//项目ID
        projectsInfo: {},//项目信息
      };
    },
    created() {
      //this.selectDataByStatus(this.releaseId);
    },
    methods: {

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
       * @disc: url 连接
       * @params: name, parameter, type
       * @date: 2019-08-22 14:26
       * @author: Wave
       */
      toUrl(name, parameter, type) {
        connect(name, parameter, type)
      },
    }
  }
</script>

<style lang="less">
  .pocm_user {
    margin: 0 auto 100px auto;
    .pocm_user_top {
      background-color: #17202e;
      height: 180px;
      .left {
        width: 60%;
        h3{
          font-size: 28px;
          color:#FFFFFF;
          margin: 30px 0 30px 0;
          span{
            font-size: 14px;
            border-bottom: 1px solid #FFFFFF;
          }
        }
        p{
          font-size: 14px;
          color: #FFFFFF;
        }
        h6{
          font-size: 16px;
          color: #FFFFFF;
        }
      }
      .right {
        width: 30%;
        h4{
          float: left;
          color: #FFFFFF;
          font-size: 14px;
          margin: 30px 0 0 50px;
          span{
            display: block;
          }
        }
      }
    }
    .pocm_user_bottom {
      min-height: 550px;
      background-color: #FFFFFF;
      .list{
        li{
          width: 360px;
          height: 170px;
          margin: 50px 25px 0;
          padding: 0 20px;
          line-height: 28px;
          &:first-child{
            margin-left: 0;
          }
          &:nth-child(3n){
            margin-right: 0;
          }
          &:nth-child(4n){
            margin-left: 0;
          }
          h5{
            border-bottom: 1px solid #0ede94;
            font-size: 14px;
            margin: 20px 0 15px 0;
          }
          p{
            font-size: 12px;
            span{
              width: 150px;
            }
          }
        }
      }
    }
  }
</style>
