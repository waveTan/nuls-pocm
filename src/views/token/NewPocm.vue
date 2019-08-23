<template>
  <div class="code_token">
    <div class="token_bg">
      <div class="bg-white shadow w1200 token_form">
        <h3 class="tc">请根据实际业务配置Token分发机制并发布合约</h3>

        <el-form :model="pocmForm" status-icon :rules="pocmRules" ref="pocmForm" class="launch_form w630">
          <div class="font14 mb_20 ">唯一识别码: D8ES</div>
          <el-form-item label="Token合约地址" prop="tokenAddress">
            <el-input v-model="pocmForm.tokenAddress">
            </el-input>
          </el-form-item>
          <el-form-item label="奖励发放周期" prop="awardingCycle">
            <el-input v-model="pocmForm.awardingCycle">
            </el-input>
          </el-form-item>
          <el-form-item label="单周期奖励Token数量" prop="cycleRewardTokenAmount">
            <el-input v-model="pocmForm.cycleRewardTokenAmount">
            </el-input>
          </el-form-item>
          <el-form-item label="锁定区块数" prop="minimumLocked">
            <el-input v-model="pocmForm.minimumLocked">
            </el-input>
          </el-form-item>
          <el-form-item label="最低抵押NULS数量" prop="minimumDepositNULS">
            <el-input v-model="pocmForm.minimumDepositNULS">
            </el-input>
          </el-form-item>
          <div class="yellow font12">注意: 抵押NULS的10%将会被锁定，无法参与共识</div>
          <el-form-item class="tc">
            <el-button class="btn" @click="submitPocmForm('pocmForm')">发  布</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      let checkTokenAddress = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入Token合约地址'));
        } else {
          callback();
        }
      };
      let checkAwardingCycle = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入奖励发放周期'));
        } else {
          callback();
        }
      };
      let checkCycleRewardTokenAmount = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入单周期奖励Token数量'));
        } else {
          callback();
        }
      };
      let checkMinimumLocked = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入锁定区块数'));
        } else {
          callback();
        }
      };
      let checkMinimumDepositNULS = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入最低抵押NULS数量'));
        } else {
          callback();
        }
      };
      return {
        pocmForm: {
          tokenAddress: '',
          awardingCycle:'',
          cycleRewardTokenAmount: '',
          minimumLocked: '',
          minimumDepositNULS: '',
        },
        pocmRules: {
          tokenAddress: [{validator: checkTokenAddress, trigger: 'blur'}],
          awardingCycle: [{validator: checkAwardingCycle, trigger: 'blur'}],
          cycleRewardTokenAmount: [{validator: checkCycleRewardTokenAmount, trigger: 'blur'}],
          minimumLocked: [{validator: checkMinimumLocked, trigger: 'blur'}],
          minimumDepositNULS: [{validator: checkMinimumDepositNULS, trigger: 'blur'}],
        }
      };
    },
    methods: {
      submitPocmForm(formName) {
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
            margin-bottom: 20px;
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
                  padding-top: 2px;
                }
                .el-input__icon {
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
