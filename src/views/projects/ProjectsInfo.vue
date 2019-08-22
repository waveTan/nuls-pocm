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
            <li><span class="fl">发行总量</span><font class="fl">{{projectsInfo.tokenTotalSupply}} {{projectsInfo.tokenSymbol}}</font></li>
            <li><span class="fl">初始流通量</span><font class="fl">{{projectsInfo.tokenInitialCirculatingPercent}}% {{projectsInfo.tokenSymbol}} 总量</font></li>
            <li><span class="fl">可挖矿数量</span><font class="fl">{{projectsInfo.tokenMiningPercent}}% {{projectsInfo.tokenSymbol}} 总量</font></li>
            <li><span class="fl">最低抵押NULS数量</span><font class="fl">1000 NULS</font></li>
            <li><span class="fl">已抵押NULS数量</span><font class="fl">55555 NULS</font></li>
            <li><span class="fl">已抵押NULS地址数</span><font class="fl">369 个</font></li>
            <li><span class="fl">奖励发放周期</span><font class="fl">30 个区块</font></li>
            <li><span class="fl">单月可获得Token数/10K NULS</span><font class="fl">36.26 {{projectsInfo.tokenSymbol}}</font></li>
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
              <el-input v-model.number="entrustForm.number" placeholder="请输入委托NULS数量"></el-input>
            </el-form-item>
            <el-form-item class="tc">
              <el-button class="btn" @click="submitForm('entrustForm')">参与委托</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import {POCM_API_URL} from '@/config'

  export default {
    data() {
      let checkNumber = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('数量不能为空'));
        }
        setTimeout(() => {
          if (!Number.isInteger(value)) {
            callback(new Error('请输入数字值'));
          } else {
            callback();
          }
        }, 1000);
      };

      this.chartSettings = {
        dimension: 'allocation',
        metrics: 'percent'
      };
      return {

        accountInfo: JSON.parse(localStorage.getItem('accountInfo')),//账户信息
        releaseId: this.$route.query.releaseId,//合约地址
        projectsInfo:{},//项目信息

        chartData: {
          columns: ['allocation', 'percent'],
          rows: [
            { allocation: '基金会', percent: 10 },
            { allocation: '战略合作', percent: 20 },
            { allocation: '游戏合作', percent: 50 },
            { allocation: '团队', percent: 20 },
          ]
        },

        tokenAllocationList:[
          {allocation: "基金会", percent: "10.00"},
          {allocation: "战略合作", percent: "20.00"},
          {allocation: "游戏合作", percent: "50.00"},
          {allocation: "团队", percent: "20.00"},
        ],

        entrustForm: {
          number: ''
        },
        entrustRules: {
          number: [
            {validator: checkNumber, trigger: 'blur'}
          ]
        }
      };
    },
    created() {
      this.selectDataByStatus(this.releaseId);
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
            console.log(response.data);
            if (response.data.success) {
              this.projectsInfo = response.data.data;
              console.log(this.projectsInfo)
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
            alert('submit!');
          } else {
            console.log('error submit!!');
            return false;
          }
        });
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
