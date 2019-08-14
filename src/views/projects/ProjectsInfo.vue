<template>
  <div class="projects_info">

    <div class="projects_top">
      <div class="w1200">
        <div class="left fl"><img src="./../../assets/img/list_bg.png"/></div>
        <div class="right fl">
          <h4 class="fCN">Aleph</h4>
          <p>Aleph is AlephAlephAlephAlephAlephAlephAlephAlephAleph</p>
          <h5>
            <span class="clicks"><i class="el-icon-s-help"></i> 官网</span>
            <span class="clicks"><i class="el-icon-receiving"></i> Github</span>
          </h5>
        </div>
      </div>
    </div>

    <div class="projects_bottom  w1200">
      <div class="left fl">
        <div class="div_info">
          <h3 class="title">项目介绍</h3>
          <p class="info">这是项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍</p>
        </div>
        <div class="div_info">
          <h3 class="title">主要功能</h3>
          <p class="info">&centerdot; 这是项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍</p>
          <p class="info">&centerdot; 这是项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍</p>
          <p class="info">&centerdot; 这是项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍</p>
          <p class="info">&centerdot; 这是项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍项目介绍</p>
        </div>
        <div class="div_info">
          <h3 class="title">挖矿信息</h3>
          <ul class="tonken_info">
            <li><span class="fl">发行总量</span><font class="fl">100000 Aleph</font></li>
            <li><span class="fl">初始流通量</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">可挖矿数量</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">已抵押NULS数量</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">已抵押NULS地址数</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">奖励发放周期</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">单月可获得Token数/10K NULS</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">奖励减半周期</span><font class="fl">30% Token 总量</font></li>
            <li><span class="fl">预计完成挖矿时间</span><font class="fl">30% Token 总量</font></li>
          </ul>
        </div>
        <div class="div_info cb">
          <h3 class="title">Token分配</h3>
          <div>
            图标工具
          </div>
        </div>
      </div>
      <div class="right fr">
        <div class="entrust shadow">
          <h3>预计挖矿结束时间: 2019-08-11 15:08:18</h3>
          <el-form :model="entrustForm" status-icon :rules="entrustRules" ref="entrustForm" class="entrust_form">
            <div class="tr font12 balance">余额: 999.0025 <span class="fCN">NULS</span></div>
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
      return {
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
    methods: {
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
      resetForm(formName) {
        this.$refs[formName].resetFields();
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
        .tonken_info{
          margin: 20px 0 0 0;
          li{
            font-size: 14px;
            width: 680px;
            height: 40px;
            line-height: 40px;
            background-color: #f5f6f9;
            &:nth-child(2n){
              background-color: #ffffff;
            }
            span{
              color: #9c9c9d;
              width: 340px;
              text-align: right;
              padding-right: 50px;
              border-right: 1px solid #FFFFFF;
            }
            font{
              color: #333333;
              padding-left: 50px;
            }
          }
        }
      }

      .right {
        .entrust{
          width: 400px;
          height: 285px;
          padding: 50px;
          margin: 50px 0 0 0;
          h3{
            font-size: 16px;
            color: #17202e;
            margin: 0 0 40px 0;
          }
          .entrust_form{
            .btn{
              margin: 10px 0 0 0 !important;
            }
          }
        }
      }
    }

  }

</style>
