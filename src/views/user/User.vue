<template>
  <div class="account w1200">
    <div class="address">
      <span class="font16">地址: {{accountInfo.address}}</span>
      <font class="fr font16">余额: {{accountInfo.balance}}<font class="fCN"> NULS</font></font>
    </div>
    <div class="table">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="我的项目" name="myProject">
          <div class="select">
            <el-select v-model="selectValue" placeholder="请选择" @change="selectChange">
              <el-option v-for="item in selectOptions" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <el-table :data="projectList" :stripe="true" class="tables">
            <el-table-column prop="name" label="项目名称" width="180" align="center">
              <template slot-scope="scope">
                <span class="click" @click="toUrl('projectsInfo',scope.row.releaseId)">{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" width="180" align="center">
            </el-table-column>
            <el-table-column prop="depositAmount" label="已抵押(NULS)" width="200" align="center">
            </el-table-column>
            <el-table-column prop="receivedMiningAmount" label="已获得收益" width="200" align="center">
              <template slot-scope="scope">
                {{scope.row.receivedMiningAmount}} {{scope.row.tokenSymbol}}
              </template>
            </el-table-column>
            <el-table-column prop="unreceivedMiningAmount" label="未领取收益" width="200" align="center">
              <template slot-scope="scope">
                {{scope.row.unreceivedMiningAmount}} {{scope.row.tokenSymbol}}
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="180" align="center">
              <template slot-scope="scope">
                <span class="click" @click="reward(scope.row)">领取奖励</span>
                <font style="padding: 0 10px">|</font>
                <span class="click" @click="append(scope.row)">追加</span>
                <font style="padding: 0 10px">|</font>
                <span class="click" @click="quit(scope.row)">退出</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="我的通证" name="myPassport">
          <el-table :data="passportList" :stripe="true" class="tables">
            <el-table-column prop="tokenType" label="通证类型" width="150" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.tokenType === 1">NRC20</span>
                <span v-else-if="scope.row.tokenType === 2">NRC721</span>
                <span v-else>非token</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180" align="center">
            </el-table-column>
            <el-table-column prop="tokenName" label="通证名称" width="150" align="center">
            </el-table-column>
            <el-table-column prop="contractAddress" label="合约地址" min-width="330" align="center">
            </el-table-column>
            <el-table-column prop="status" label="状态" width="150" align="center">
              <template slot-scope="scope">
                <span v-if="scope.row.status === 0 ">未认证</span>
                <span v-else>已经认证</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="100" align="center">
              <template slot-scope="scope">
                <span class="click" @click="handleClick(scope.row)">详情</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
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
    divisionDecimals,
    Times,
    Plus,
    validateContractCall,
    getLocalTime,
    passwordVerification
  } from '@/api/util'
  import {
    inputsOrOutputs,
    countFee,
    validateAndBroadcast,
    getBalanceOrNonceByAddress,
    getAddressInfoByAddress
  } from '@/api/requestData'

  export default {
    data() {
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        balanceInfo: {},//账户余额信息
        activeName: 'myProject',//tab默认选中
        selectOptions: [],//下拉框列表
        selectValue: -1,//下拉框选中
        projectList: [],//我的项目列表
        contractCallData: [], //调用合约data
        pageIndex: 1, //页码
        pageSize: 10, //每页条数
        pageTotal: 0,//总页数
        passportList: [],//我的通证列表
        userSetInterval: null,//定时器
      }
    },
    created() {
      this.addressInfoByAddress(this.accountInfo.address);
      this.selectDataByStatus();
      this.getProjectList(this.selectValue, this.accountInfo.address);
    },
    mounted() {
      this.userSetInterval = setInterval(() => {
        this.selectDataByStatus();
        this.getProjectList(this.selectValue, this.accountInfo.address);
      }, 10000)
    },
    destroyed() {
      clearInterval(this.userSetInterval);
    },
    components: {
      Password,
    },
    methods: {

      /**
       * @disc:tab 切换
       * @param tab
       * @param event
       * @date: 2019-08-20 16:57
       * @author: Wave
       */
      handleClick(tab) {
        if (tab.name === 'myPassport') {
          this.getMyTokenListByAddress(this.accountInfo.address);
        } else {
          this.selectDataByStatus();
          this.getProjectList(this.selectValue, this.accountInfo.address);
        }
      },

      /**
       * @disc: 下拉框改变
       * @params: val
       * @date: 2019-08-23 15:45
       * @author: Wave
       */
      selectChange(val) {
        this.selectValue = val;
        this.getProjectList(this.selectValue, this.accountInfo.address);
      },

      /**
       * @disc:获取地址信息
       * @param address
       * @date: 2019-08-20 16:58
       * @author: Wave
       */
      async addressInfoByAddress(address) {
        let newData = {aesPri: this.accountInfo.aesPri, pub: this.accountInfo.pub};
        let newAddressInfo = await getAddressInfoByAddress(address);
        if (newAddressInfo.success) {
          this.accountInfo = {};
          newAddressInfo.data.balance = divisionDecimals(newAddressInfo.data.balance);
          this.accountInfo = {...newData, ...newAddressInfo.data};
        } else {
          this.accountInfo.balance = 0
        }
      },

      /**
       * @disc: 获取下拉框信息
       * @params:
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      selectDataByStatus() {
        const url = POCM_API_URL + '/pocm/release/list';
        const data = {status: 1};
        axios.post(url, data)
          .then((response) => {
            //console.log(response.data);
            if (response.data.success) {
              let newArr = [{id: -1, name: '所有'}];
              this.selectOptions = [...newArr, ...response.data.data];
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },

      /**
       * @disc: 我的项目列表根据项目ID和地址
       * @params:Id,address
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      getProjectList(Id, address) {
        const url = POCM_API_URL + '/pocm/mining/list';
        const data = {releaseId: Id, depositAddress: address};
        axios.post(url, data)
          .then((response) => {
            //console.log(response.data);
            if (response.data.success) {
              if (response.data.data) {
                for (let item of response.data.data) {
                  item.depositAmount = divisionDecimals(item.depositAmount);
                  item.receivedMiningAmount = divisionDecimals(item.receivedMiningAmount, item.tokenDecimals);
                  item.unreceivedMiningAmount = divisionDecimals(item.unreceivedMiningAmount, item.tokenDecimals);
                  item.createTime = moment(getLocalTime(item.createTime)).format('YYYY-MM-DD HH:mm:ss');
                }
                this.projectList = [];
                this.projectList = [...response.data.data];
              }
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },

      /**
       * @disc: 获取我的通证列表
       * @params: address
       * @date: 2019-08-22 14:07
       * @author: Wave
       */
      async getMyTokenListByAddress(address) {
        await this.$post('/', 'getAccountContractList', [this.pageIndex, this.pageSize, address, -1, false])
          .then((response) => {
            //console.log(response);
            if (response.hasOwnProperty("result")) {
              for (let item of response.result.list) {
                item.createTime = moment(getLocalTime(item.createTime * 1000)).format('YYYY-MM-DD HH:mm:ss');
              }
              this.passportList = [...response.result.list];
            } else {
              this.$message({message: "获取我的通证列表错误：" + JSON.stringify(response.error), type: 'error', duration: 3000});
            }
          })
          .catch((error) => {
            this.$message({message: "获取我的通证列表异常：" + JSON.stringify(error), type: 'error', duration: 3000});
          });
      },

      /**
       * @disc: 领取奖励
       * @params: rowInfo
       * @date: 2019-08-23 15:17
       * @author: Wave
       */
      reward(rowInfo) {
        /*console.log(rowInfo);
        console.log("领取奖励 方法名:receiveAwards 参数：无");*/
        this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
        this.validateContractCall(this.accountInfo.address, 0, 10000000, 25, rowInfo.contractAddress, 'receiveAwards', '', [rowInfo.depositNumber]);
      },

      /**
       * @disc: 追加
       * @params: rowInfo
       * @date: 2019-08-23 15:17
       * @author: Wave
       */
      append(rowInfo) {
        //console.log(rowInfo);
        this.$router.push({
          name: 'projectsInfo',
          query: {releaseId: rowInfo.releaseId}
        });
      },

      /**
       * @disc: 退出
       * @params: rowInfo
       * @date: 2019-08-23 15:17
       * @author: Wave
       */
      quit(rowInfo) {
        /*console.log(rowInfo);
        console.log("退出 方法名:quit 参数：number(抵押编号)");*/
        this.getBalanceByAddress(API_CHAIN_ID, 1, this.accountInfo.address);
        this.validateContractCall(this.accountInfo.address, 0, 10000000, 25, rowInfo.contractAddress, 'quit', '', [rowInfo.depositNumber]);
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
       * @params: name
       * @params: params
       * @date: 2019-08-20 18:01
       * @author: Wave
       */
      toUrl(name, params) {
        this.$router.push({
          name: name,
          query: {releaseId: params}
        });
      }

    },
  }
</script>

<style lang="less">
  @import "./../../assets/css/style";

  .account {
    margin: 30px auto 0;
    .address {
      span {
        color: #17202e;
      }
    }
    .select {
      margin: 0 0 20px 0;
    }
    .table {
      margin: 50px 0 0 0;
      .tables {
        border: @BD1;
        margin-bottom: 100px;
      }
    }
  }


</style>
