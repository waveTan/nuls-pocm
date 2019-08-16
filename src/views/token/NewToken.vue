<template>
  <div class="new_token">
    <div class="token_bg">
      <div class="bg-white shadow w1200 token_inf">
        <el-tabs v-model="activeName" @tab-click="handleClick" class="token_tab">
          <el-tab-pane label="发行NRC-20通证" name="first">
            <div class="div_tip">
              NRC-20 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXX
            </div>
            <el-form :model="launchForm" status-icon :rules="launchRules" ref="launchForm" class="launch_form w630">
              <el-form-item label="通证名称" prop="name">
                <el-input v-model="launchForm.name">
                </el-input>
              </el-form-item>
              <el-form-item label="通证缩写" prop="mail">
                <el-input v-model="launchForm.mail">
                </el-input>
              </el-form-item>
              <el-form-item label="发行量" prop="tokenName">
                <el-input v-model="launchForm.tokenName">
                </el-input>
              </el-form-item>
              <el-form-item label="通证精度" prop="tokenSymbol">
                <el-input v-model="launchForm.tokenSymbol">
                </el-input>
              </el-form-item>
              <div class="font12">
                通证发行手续费和代码认证费用：10 <span class="fCN">NULS</span>&nbsp;
                <el-tooltip content="这里是提示信息" placement="top">
                  <i class="el-icon-warning-outline font14"></i>
                </el-tooltip>
              </div>
              <el-form-item class="tc">
                <el-button class="btn" @click="submitForm('launchForm')">提交</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="发行NRC-721通证" name="second">
            <div class="div_tip">
              NRC-721 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXXNRC-20 是NULS上的一种通证标准，可用于XXXXXXX
            </div>
            <el-form :model="launchForm" status-icon :rules="launchRules" ref="launchForm" class="launch_form w630">
              <el-form-item label="通证名称" prop="name">
                <el-input v-model="launchForm.name">
                </el-input>
              </el-form-item>
              <el-form-item label="通证缩写" prop="mail">
                <el-input v-model="launchForm.mail">
                </el-input>
              </el-form-item>
              <div class="font12">
                通证发行手续费和代码认证费用：10 <span class="fCN">NULS</span>&nbsp;
                <el-tooltip content="这里是提示信息" placement="top">
                  <i class="el-icon-warning-outline font14"></i>
                </el-tooltip>
              </div>
              <el-form-item class="tc">
                <el-button class="btn" @click="submitForm('launchForm')">提交</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
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
        } else {
          callback();
        }
      };
      return {
        activeName: 'second',

        launchForm: {
          name: ''
        },
        launchRules: {
          name: [
            {validator: checkNumber, trigger: 'blur'}
          ]
        }
      };
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      },
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
  .new_token {
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
      .token_inf {
        margin: 80px auto 80px;
        z-index: 1;
        position: relative;
        .token_tab{
          margin: 0 150px 0 150px;
          padding-top: 30px;
          .el-tabs__header{
            .el-tabs__nav-wrap{
              .el-tabs__active-bar{
                background-color: #0ede94;
              }
              .el-tabs__item{
                color: #17202e;
                font-size: 16px;
              }
            }
          }
          .el-tabs__content{
            width: 630px;
            margin: 40px auto 0;
            .div_tip{
              background-color: #F5F6F9;
              padding: 20px;
              line-height: 22px;
              font-size: 14px;
              margin: 0 0 40px 0;
            }
          }
        }
        .launch_form {
          padding-bottom: 50px;
          .el-form-item {
            margin-bottom: 15px;
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
                }
                .el-input__icon{
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
