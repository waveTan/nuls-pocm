<template>
  <div class="account w1200">
    <div class="address">
      <span class="font16">地址: {{accountInfo.address}}</span>
      <font class="fr font16">余额: {{accountInfo.balance}}<font class="fCN"> NULS</font></font>
    </div>
    <el-divider></el-divider>
    <div class="select">
      <el-select v-model="value" placeholder="请选择">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </div>
    <div class="table">
      <el-table :data="tableData" style="width: 100%" :stripe="true">
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
    </div>
  </div>
</template>

<script>
  import {timesDecimals} from '@/api/util'
  import {getAddressInfoByAddress} from '@/api/requestData'

  export default {
    data() {
      return {
        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息

        options: [
          {value: 'Aleph', label: 'Aleph'},
          {value: 'Aleph1', label: 'Aleph2'}
        ],
        value: 'Aleph',

        tableData: [
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
          {
            name: 'Aleph',
            time: '2018-09-08 15:05:58',
            mortgaged: 3654.565,
            acquired: 45645.12345,
            locking: 456.45645,
            notReceived: 5468.123456
          },
        ]
      }
    },
    created() {
      this.addressInfoByAddress(this.accountInfo.address);
    },
    methods: {

      /**
       * 获取地址信息
       * @param address
       */
      async addressInfoByAddress(address) {
        let newData = {aesPri: this.accountInfo.aesPri, pub: this.accountInfo.pub};
        await getAddressInfoByAddress(address)
          .then((response) => {
            //console.log(response);
            if (response.success) {
              this.accountInfo = {};
              response.data.balance = timesDecimals(response.data.balance);
              this.accountInfo = {...newData, ...response.data};
            } else {
              this.accountInfo.balance = 0
            }
          }).catch((error) => {
            this.accountInfo.balance = 0;
            console.log(error);
          })
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
      border: @BD1;
      .el-table {

      }
    }
  }


</style>
