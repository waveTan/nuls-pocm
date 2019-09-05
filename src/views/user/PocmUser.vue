<template>
  <div class="pocm_user" v-loading="pocomUserLoading">
    <div class="pocm_user_top">
      <div class="w1200">
        <div class="left fl">
          <div class="fl">
            <img class="clicks" @click="toUrl('projectsInfo',data.releaseId,0)" src="./../../assets/img/list_bg.png"/>
          </div>
          <div class="fl">
            <h3 class="font16">{{data.name}}
              <span class="clicks" @click="toUrl('projectsInfo',data.releaseId,0)">查看项目详情</span>
            </h3>
            <p>合约地址</p>
            <h6>{{data.contractAddress}}</h6>
          </div>
        </div>
        <div class="right fl">
          <h4>
            <span>总收益</span>
            <span>{{data.projectConsensusRewards/100000000}}<font class="fCN"> NULS</font></span>
          </h4>
          <h4>
            <span>获得抵押</span>
            <span>{{data.totalDeposit/100000000}}<font class="fCN"> NULS</font></span>
          </h4>
        </div>
      </div>
    </div>
    <div class="pocm_user_bottom  w1200">
      <ul class="list">
        <li class="shadow fl clicks"
            v-for="(item,index) in myNodeList" :key="index"
            @click="toUrl('consensusInfo',item.txHash,1)">
          <h5>{{item.agentId}}<span class="fr"><i class="el-icon-apple"></i>{{item.status === 0 ? '待共识':'共识中'}}</span>
          </h5>
          <p>总收益: {{item.totalReward}} <span class="fr">保证金: {{item.deposit}}</span></p>
          <p>佣金比例: {{item.commissionRate}}% <span class="fr">委托量: {{item.totalDeposit}}</span></p>
          <p>创建时间: {{item.createTime}}<span class="fr">信用值: {{item.creditValue}}</span></p>
        </li>
        <li class="shadow fl tc clicks" @click="addNode">
          <i class="el-icon-plus font24"></i><br/>
          <span class="font14">添加节点</span>
        </li>
      </ul>
    </div>
    <Password ref="password" @passwordSubmit="passSubmit">
    </Password>
    <el-dialog title="新增节点" width="30rem" center class="add_node"
               :visible.sync="addNodeDialog"
               :close-on-click-modal="false"
               :close-on-press-escape="false">
      <el-form :model="addForm" status-icon :rules="addRules" ref="addForm" class="add_form">
        <el-form-item label="节点ID" prop="values">
          <el-input v-model="addForm.values" placeholder="请输入节点ID"></el-input>
        </el-form-item>
        <el-form-item class="tc">
          <el-button class="btn" @click="addSubmitForm('addForm')">确定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import nuls from 'nuls-sdk-js'
  import Password from '@/components/PasswordBar'
  import {API_CHAIN_ID, POCM_API_URL} from '@/config'
  import {
    divisionDecimals,
    Times,
    Plus,
    validateContractCall,
    connect,
    passwordVerification,
    getLocalTime
  } from '@/api/util'
  import {inputsOrOutputs, countFee, validateAndBroadcast, getBalanceOrNonceByAddress} from '@/api/requestData'

  export default {
    data() {
      let checkValues = async (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入正确的节点ID'));
        } else {
          let isAllNodeList = await this.verificationID(value);
          if (!isAllNodeList.success) {
            if (isAllNodeList.code === 100) {
              callback(new Error('节点ID已经存在'));
            } else if (isAllNodeList.code === 200) {
              callback(new Error('请输入正确的节点ID'));
            } else {
              callback();
            }
          } else {
            this.addNodeInfo = isAllNodeList.data;
            callback();
          }
        }

      };
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        balanceInfo: {},//账户余额信息
        projectsInfo: {},//项目信息
        data: JSON.parse(sessionStorage.getItem("data")),//项目数据
        myNodeList: [],//我的节点列表
        allNodeList: [],//所有合约列表

        addNodeDialog: false, //添加节点弹框
        addForm: {
          values: ''
        },
        addRules: {
          values: [
            {validator: checkValues, trigger: 'blur'}
          ]
        },
        addNodeInfo: {},//添加的节点信息
        gas: 1,
        price: 25,
        contractCallData: [], //调用合约data
        pocomUserLoading: true, //加载动画
        pocmUserSetInterval: null,//定时器
      };
    },
    created() {
      this.getConsensusNodes(1, 500, 0);
      console.log(this.data);
    },
    mounted() {
      let address = '';
      setTimeout(() => {
        address = this.accountInfo.address;
        if (this.data.agentHashList) {
          for (let ks of this.data.agentHashList) {
            let newList = this.allNodeList.filter(item => item.txHash === ks);
            this.myNodeList.push(newList[0]);
            this.pocomUserLoading = false;
          }
        } else {
          this.pocomUserLoading = false;
        }
      }, 2000);

      this.pocmUserSetInterval = setInterval(() => {
        this.getAuthorization(address);
      }, 5000)
    },
    components: {
      Password,
    },
    destroyed() {
      clearInterval(this.pocmUserSetInterval);
    },
    methods: {

      /**
       * @disc: 判断地址是否为创建项目者
       * @params: address
       * @date: 2019-08-26 16:58
       * @author: Wave
       */
      async getAuthorization(address) {
        const url = POCM_API_URL + '/pocm/authorization/list';
        const data = {address: address};
        await axios.post(url, data)
          .then((response) => {
            //console.log(response.data);
            if (response.data.success) {
              if (response.data.data.length !== 0 && response.data.data[0].status === 1) {
                let newAgentHashList = response.data.data[0].agentHashList;
                if (newAgentHashList) {
                  let newList = [];
                  for (let ks of newAgentHashList) {
                    newList.push(this.allNodeList.filter(item => item.txHash === ks)[0]);
                  }
                  if (this.myNodeList.length !== newList.length) {
                    this.myNodeList = [];
                    this.myNodeList = [...newList];
                    sessionStorage.setItem("data", JSON.stringify(response.data.data[0]));
                  }
                }
              }
            }
          })
          .catch((error) => {
            console.log(error);
          })
      },

      /**
       * @disc: 所有共识列表信息
       * @param pageIndex
       * @param pageSize,
       * @param type
       * @date: 2019-08-28 14:17
       * @author: Wave
       */
      getConsensusNodes(pageIndex, pageSize, type) {
        this.$post('/', 'getConsensusNodes', [pageIndex, pageSize, type])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let itme of response.result.list) {
                itme.deposit = divisionDecimals(itme.deposit);
                itme.createTime = moment(getLocalTime(itme.createTime * 1000)).format('YYYY-MM-DD HH:mm:ss');
                itme.agentReward = divisionDecimals(itme.agentReward);
                itme.totalDeposit = divisionDecimals(itme.totalDeposit);
                itme.totalReward = divisionDecimals(itme.totalReward);
              }
              this.allNodeList = [...response.result.list]
            }
          })
          .catch((error) => {
            console.log("getConsensusNodes:" + error);
          });

      },

      /**
       * @disc: 新增节点弹框显示
       * @params:
       * @date: 2019-08-28 14:08
       * @author: Wave
       */
      addNode() {
        this.addNodeDialog = true;
      },

      /**
       * @disc: 验证节点ID
       * @params: agentId
       * @date: 2019-08-28 14:50
       * @author: Wave
       */
      verificationID(agentId) {
        let newMyList = this.myNodeList.filter(item => item.agentId === agentId.toLowerCase());
        if (newMyList.length === 0) {
          let newAllList = this.allNodeList.filter(item => item.agentId === agentId.toLowerCase());
          if (newAllList.length !== 0) {
            return {success: true, data: newAllList[0]};
          } else {
            return {success: false, code: 200};
          }
        } else {
          return {success: false, code: 100};
        }
      },

      /**
       * @disc: 新增节点提交
       * @params: formName
       * @date: 2019-08-28 14:15
       * @author: Wave
       */
      addSubmitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
            this.validateContractCall(this.accountInfo.address, 0, 10000000, 25, this.data.contractAddress, 'addOtherAgent', '', [this.addNodeInfo.txHash]);
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
              this.$message({message: "交易已经发出，区块确定需要一定的时间，你可以在浏览器上查询交易是否已确定", type: 'success', duration: 2000});
              this.$refs['addForm'].resetFields();
              this.addNodeDialog = false;
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
        let newPath = connect(name, parameter, type);
        if (newPath.success) {
          this.$router.push(newPath.data);
        }
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
        img {
          width: 80%;
          margin-top: 20px;
        }
        h3 {
          font-size: 24px;
          color: #FFFFFF;
          margin: 30px 0 30px 0;
          span {
            font-size: 14px;
            border-bottom: 1px solid #FFFFFF;
          }
        }
        p {
          font-size: 14px;
          color: #FFFFFF;
        }
        h6 {
          font-size: 16px;
          color: #FFFFFF;
        }
      }
      .right {
        width: 30%;
        h4 {
          float: left;
          color: #FFFFFF;
          font-size: 14px;
          margin: 30px 0 0 50px;
          span {
            display: block;
          }
        }
      }
    }
    .pocm_user_bottom {
      min-height: 550px;
      background-color: #FFFFFF;
      .list {
        li {
          width: 360px;
          height: 170px;
          margin: 50px 25px 0;
          padding: 0 20px;
          line-height: 28px;
          &:first-child {
            margin-left: 0;
          }
          &:nth-child(3n) {
            margin-right: 0;
          }
          &:nth-child(4n) {
            margin-left: 0;
          }
          h5 {
            border-bottom: 1px solid #0ede94;
            font-size: 14px;
            margin: 20px 0 15px 0;
          }
          p {
            font-size: 12px;
            span {
              width: 130px;
            }
          }
          .el-icon-plus {
            margin-top: 55px;
          }
        }
      }
    }
    .add_node {
      .el-dialog__body {
        .add_form {
          .el-form-item {
            .el-form-item__content {
              .btn {
                span {
                  color: #FFFFFF;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
