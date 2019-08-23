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
            <el-select v-model="selectValue" placeholder="请选择">
              <el-option v-for="item in selectOptions" :key="item.id" :label="item.name" :value="item.id">
              </el-option>
            </el-select>
          </div>
          <el-table :data="projectList" :stripe="true" class="tables">
            <el-table-column prop="name" label="项目名称" width="150">
            </el-table-column>
            <el-table-column prop="time" label="时间" width="180">
            </el-table-column>
            <el-table-column prop="mortgaged" label="已抵押NULS" width="150">
            </el-table-column>
            <el-table-column prop="acquired" label="已获得收益" width="150">
            </el-table-column>
            <el-table-column prop="locking" label="锁定收益" width="150">
            </el-table-column>
            <el-table-column prop="notReceived" label="未领取收益" width="150">
            </el-table-column>
            <el-table-column label="操作" min-width="180">
              <template slot-scope="scope">
                <span class="click" @click="handleClick(scope.row)">领取奖励</span>
                <font style="padding: 0 10px">|</font>
                <span class="click">追加</span>
                <font style="padding: 0 10px">|</font>
                <span class="click">退出</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="我的通证" name="myPassport">
          <el-table :data="passportList" :stripe="true" class="tables">
            <el-table-column prop="tokenType" label="通证类型" width="150">
              <template slot-scope="scope">
                <span v-if="scope.row.tokenType === 0 ">非token</span>
                <span v-else-if="scope.row.tokenType === 1">NRC20</span>
                <span v-else="scope.row.tokenType === 2">NRC721</span>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
            </el-table-column>
            <el-table-column prop="tokenName" label="通证名称" width="150">
            </el-table-column>
            <el-table-column prop="contractAddress" label="合约地址" min-width="330">
            </el-table-column>
            <el-table-column prop="status" label="状态" width="150">
              <template slot-scope="scope">
                <span v-if="scope.row.status === 0 ">未认证</span>
                <span v-else="scope.row.status === 1">已经认证</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="100">
              <template slot-scope="scope">
                <span class="click" @click="handleClick(scope.row)">详情</span>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import moment from 'moment'
  import {divisionDecimals, getLocalTime} from '@/api/util'
  import {getAddressInfoByAddress} from '@/api/requestData'
  import {POCM_API_URL} from '@/config'

  export default {
    data() {
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        activeName: 'myProject',

        selectOptions: [],
        selectValue: '',

        projectList: [],//我的项目列表
        pageIndex: 1, //页码
        pageSize: 10, //每页条数
        pageTotal: 0,//总页数
        passportList: [],//我的通证列表
      }
    },
    created() {
      this.addressInfoByAddress(this.accountInfo.address);
      this.selectDataByStatus();
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
        }
      },

      /**
       * @disc:获取地址信息
       * @param address
       * @date: 2019-08-20 16:58
       * @author: Wave
       */
      async addressInfoByAddress(address) {
        let newData = {aesPri: this.accountInfo.aesPri, pub: this.accountInfo.pub};
        await getAddressInfoByAddress(address)
          .then((response) => {
            //console.log(response);
            if (response.success) {
              this.accountInfo = {};
              response.data.balance = divisionDecimals(response.data.balance);
              this.accountInfo = {...newData, ...response.data};
            } else {
              this.accountInfo.balance = 0
            }
          }).catch((error) => {
            this.accountInfo.balance = 0;
            console.log(error);
          })
      },

      /**
       * @disc: 获取下拉框信息
       * @params:
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      selectDataByStatus() {
        const url = POCM_API_URL + '/pocm/release/list';
        const data = {status: 0};
        axios.post(url, data)
          .then((response) => {
            //console.log(response);
            if (response.data.success) {
              this.selectOptions = [...response.data.data];
              this.selectValue = response.data.data[0].id;
              this.projectListById(this.selectValue);
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },

      /**
       * @disc: 获取挖矿信息列表根据项目ID
       * @params:Id
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      projectListById(Id) {
        const url = POCM_API_URL + '/pocm/mining/list';
        const data = {releaseId: Id};
        axios.post(url, data)
          .then((response) => {
            //console.log(response);
            if (response.data.success) {
              if (response.data.data) {
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
            console.log(response);
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
      }
    }
  }


</style>
