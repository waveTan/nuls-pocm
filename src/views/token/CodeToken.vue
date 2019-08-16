<template>
  <div class="code_token">
    <div class="token_bg">
      <div class="bg-white shadow w1200 token_form">
        <h3 class="tc">请根据实际业务配置Token分发机制并发布合约</h3>

        <el-form :model="launchForm" status-icon :rules="launchRules" ref="launchForm" class="launch_form w630">
          <div class="font14 mb_20 ">唯一识别码: D8ES</div>
          <el-form-item label="Token合约地址" prop="name">
            <el-input v-model="launchForm.name">
            </el-input>
          </el-form-item>
          <el-form-item label="POCM分配数量" prop="mail">
            <el-input v-model="launchForm.mail">
            </el-input>
          </el-form-item>
          <el-form-item label="奖励发放周期" prop="tokenName">
            <el-input v-model="launchForm.tokenName">
            </el-input>
          </el-form-item>
          <el-form-item label="单周期奖励Token数量" prop="tokenSymbol">
            <el-input v-model="launchForm.tokenSymbol">
            </el-input>
          </el-form-item>
          <el-form-item label="锁定区块数" prop="tokenNumber">
            <el-input v-model="launchForm.tokenNumber">
            </el-input>
          </el-form-item>
          <el-form-item label="最低抵押NULS数量" prop="officialAddress">
            <el-input v-model="launchForm.officialAddress">
            </el-input>
          </el-form-item>
         <div class="yellow font12">注意: 抵押NULS的10%将会被锁定，无法参与共识</div>
          <el-form-item class="tc">
            <el-button class="btn" @click="submitForm('launchForm')">发布</el-button>
          </el-form-item>
        </el-form>
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
  .code_token {
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
      .token_form {
        margin: 80px auto 80px;
        z-index: 1;
        position: relative;
        h3 {
          height: 100px;
          padding: 60px 0 0 0;
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
