<template>
  <div class="projects_launch">
    <div class="projects_bg">
      <div class="bg-white shadow w1200 projects_form">
        <h3 class="tc">请仔细填写表单信息，我们尽快联系您！</h3>
        <el-form :model="launchForm" status-icon :rules="launchRules" ref="launchForm" class="launch_form w630">
          <el-form-item label="项目名称" prop="name">
            <el-input v-model="launchForm.name" placeholder="您的项目名称">
            </el-input>
          </el-form-item>
          <el-form-item label="电子邮件" prop="email">
            <el-input v-model="launchForm.email" placeholder="您的电子邮件">
            </el-input>
          </el-form-item>
          <el-form-item label="总发行量" prop="tokenTotalSupply">
            <el-input v-model="launchForm.tokenTotalSupply" placeholder="请填写总发行量">
            </el-input>
          </el-form-item>
          <el-form-item label="流通比例%" prop="tokenInitialCirculatingPercent">
            <el-input v-model="launchForm.tokenInitialCirculatingPercent" placeholder="请填写初始流通比例">
            </el-input>
          </el-form-item>
          <el-form-item label="POCM发行比例%" prop="tokenMiningPercent">
            <el-input v-model="launchForm.tokenMiningPercent" placeholder="请填写通过POCM发行比例">
            </el-input>
          </el-form-item>
          <el-form-item label="Token全名" prop="tokenName">
            <el-input v-model="launchForm.tokenName" placeholder="请填写Token全名">
            </el-input>
          </el-form-item>
          <el-form-item label="Token符号" prop="tokenSymbol">
            <el-input v-model="launchForm.tokenSymbol" placeholder="请填写Token缩写">
            </el-input>
          </el-form-item>
          <el-form-item label="官网地址" prop="website">
            <el-input v-model="launchForm.website" placeholder="请填写官网地址">
            </el-input>
          </el-form-item>
          <el-form-item label="项目简介" prop="projectCard">
            <el-input type="textarea" maxlength="200" show-word-limit v-model="launchForm.projectCard"
                      placeholder="请填写项目说明">
            </el-input>
          </el-form-item>
          <el-form-item label="主要功能" prop="mainFunctionPoints">
            <el-input type="textarea" maxlength="200" show-word-limit v-model="launchForm.mainFunctionPoints"
                      placeholder="请填写项目主要功能点">
            </el-input>
          </el-form-item>
          <div class="channel_proportion">
            <p>Token分配</p>
            <el-form-item v-for="(domain, index) in launchForm.tokenAllocationList" label="" :key="index">
              <el-input v-model="domain.allocation" placeholder="分配渠道" class="channel fl">
              </el-input>
              <el-input v-model="domain.percent" placeholder="比例" class="proportion fl">
              </el-input>
              <i class="el-icon-circle-plus-outline" @click="addDomain"></i>
              <i class="el-icon-remove-outline" v-show="index > 0" @click.prevent="removeDomain(domain)"></i>
            </el-form-item>
            <span class="el-form-item__error" v-show="tokenNum !==100">Token分配比例错误</span>
          </div>
          <el-form-item class="tc">
            <el-button class="btn" @click="submitForm('launchForm')">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import {stringLength} from '@/api/util'
  import {POCM_API_URL} from '@/config'

  export default {
    data() {
      let checkName = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入您的项目名称'));
        } else if (2 > stringLength(value) || 50 < stringLength(value)) {
          return callback(new Error('项目名称长度为2-16'));
        } else {
          callback();
        }
      };
      let checkEmail = (rule, value, callback) => {
        let regular = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
        if (!value) {
          return callback(new Error('请输入您的电子邮件'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确的电子邮件'));
        } else {
          callback();
        }
      };
      let checkTokenTotalSupply = (rule, value, callback) => {
        let regular = /^[1-9]\d*$/;
        if (!value) {
          return callback(new Error('请输入总发行量'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确总发行量'));
        } else {
          callback();
        }
      };
      let checkTokenInitialCirculatingPercent = (rule, value, callback) => {
        let regular = /^(([1-9][0-9]|[1-9])(\.\d{1,2})?|0\.\d{1,2}|100)$/;
        if (!value) {
          return callback(new Error('请输入初始流通比例'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确初始流通比例0-100两位有效数值'));
        } else {
          callback();
        }
      };
      let checkTokenMiningPercent = (rule, value, callback) => {
        let regular = /^(([1-9][0-9]|[1-9])(\.\d{1,2})?|0\.\d{1,2}|100)$/;
        if (!value) {
          return callback(new Error('请输入POCM发行比例'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确POCM发行比例0-100两位有效数值'));
        } else {
          callback();
        }
      };
      let checkTokenName = (rule, value, callback) => {
        let regular = /[a-zA-Z]$/;
        if (!value) {
          return callback(new Error('请输入Token全名'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确Token全名只允许英文'));
        } else if (2 > stringLength(value) || 16 < stringLength(value)) {
          return callback(new Error('请输入正确Token全名长度为2-16'));
        } else {
          callback();
        }
      };
      let checkTokenSymbol = (rule, value, callback) => {
        let regular = /^(?!_)(?!.*?_$)[A-Za-z0-9_]+$/;
        if (!value) {
          return callback(new Error('通证缩写不能为空!'));
        } else if (!regular.exec(value)) {
          return callback(new Error('只允许使用大、小写字母、数字、下划线（下划线不能在两端）1~20字节'));
        } else if (1 > stringLength(value) || 20 < stringLength(value)) {
          return callback(new Error('只允许使用大、小写字母、数字、下划线（下划线不能在两端）1~20字节'));
        } else {
          callback();
        }
      };
      let checkWebsite = (rule, value, callback) => {
        let regular = /(http|https):\/\/([\w.]+\/?)\S*/;
        if (!value) {
          return callback(new Error('请输入官网地址'));
        } else if (!regular.exec(value)) {
          return callback(new Error('请输入正确的官网地址'));
        } else {
          callback();
        }
      };
      let checkProjectCard = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入项目介绍'));
        } else if (2 > stringLength(value) || 150 < stringLength(value)) {
          return callback(new Error('请输入正确项目介绍长度为2-50'));
        } else {
          callback();
        }
      };
      let checkMainFunctionPoints = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入项目主要功能点'));
        } else if (8 > stringLength(value) || 600 < stringLength(value)) {
          return callback(new Error('请输入正确项目主要功能点长度为8-200'));
        } else {
          callback();
        }
      };

      return {
        launchForm: {
          name: 'wave',
          email: 'wave@qq.com',
          tokenTotalSupply: '987654321',
          tokenInitialCirculatingPercent: '10',
          tokenMiningPercent: '20',
          tokenName: 'wave',
          tokenSymbol: 'wave',
          website: 'http://wave.com',
          projectCard: 'wave wave',
          mainFunctionPoints: 'wave wave wave',
          tokenAllocationList: [
            {allocation: '你的', percent: '20', key: Date.now()},
            {allocation: '你的', percent: '20', key: Date.now()},
            {allocation: '你的', percent: '20', key: Date.now()},
          ]
        },
        launchRules: {
          name: [{validator: checkName, trigger: 'blur'}],
          email: [{validator: checkEmail, trigger: 'blur'}],
          tokenTotalSupply: [{validator: checkTokenTotalSupply, trigger: 'blur'}],
          tokenInitialCirculatingPercent: [{validator: checkTokenInitialCirculatingPercent, trigger: 'blur'}],
          tokenMiningPercent: [{validator: checkTokenMiningPercent, trigger: 'blur'}],
          tokenName: [{validator: checkTokenName, trigger: 'blur'}],
          tokenSymbol: [{validator: checkTokenSymbol, trigger: 'blur'}],
          website: [{validator: checkWebsite, trigger: 'blur'}],
          projectCard: [{validator: checkProjectCard, trigger: 'blur'}],
          mainFunctionPoints: [{validator: checkMainFunctionPoints, trigger: 'blur'}],
        },
        tokenNum: 0,//token分配比例总和
        tokenNumSetInterval: null,
      };
    },
    created() {
    },
    mounted() {
      this.tokenNumSetInterval = setInterval(() => {
        this.verifyAllocationRatio();
      }, 200)
    },
    destroyed() {
      clearInterval(this.tokenNumSetInterval);
      this.$refs['launchForm'].resetFields();
    },
    methods: {

      /**
       * 添加分配渠道
       */
      addDomain() {
        this.launchForm.tokenAllocationList.push({
          allocation: '',
          percent: '',
          key: Date.now()
        });
      },

      /**
       * 移除分配渠道
       * @param item
       */
      removeDomain(item) {
        let index = this.launchForm.tokenAllocationList.indexOf(item);
        if (index !== -1) {
          this.launchForm.tokenAllocationList.splice(index, 1)
        }
      },

      /**
       * @disc: 验证Token分配比例是否为100%
       * @params:
       * @date: 2019-09-03 9:50
       * @author: Wave
       */
      verifyAllocationRatio() {
        this.tokenNum = 0;
        for (let item of this.launchForm.tokenAllocationList) {
          this.tokenNum = this.tokenNum + Number(item.percent)
        }
      },

      /**
       * 表单提交
       * @param formName
       */
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            if (this.tokenNum === 100) {
              this.launch(this.launchForm);
            }
          } else {
            return false;
          }
        });
      },

      /**
       * 提交项目
       * @param data
       **/
      launch(data) {
        const url = POCM_API_URL + '/pocm/release';
        axios.post(url, data)
          .then((response) => {
            //console.log(response.data);
            if (response.data.success) {
              this.$message({message: "您的信息我们已经收到，我们会稍后联系您！", type: 'success', duration: 3000});
            } else {
              this.$message({message: "对不起，提交信息错误，请刷新重试！", type: 'success', duration: 3000});
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message({message: "对不起，提交信息异常，请刷新重试！", type: 'success', duration: 3000});
            this.$refs['launchForm'].resetFields();
          })
      },
    }
  }
</script>

<style lang="less">
  .projects_launch {
    .projects_bg {
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
      .projects_form {
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
                }
                .el-input__icon {
                  line-height: 30px;
                }
              }
              .el-form-item__error {
                padding-top: 2px;
              }
            }
          }
          .channel_proportion {
            p {
              font-size: 14px;
              line-height: 24px;
            }
            .channel {
              width: 59%;
            }
            .proportion {
              width: 30%;
              margin: 0 0 0 10px;
            }
            .el-icon-remove-outline, .el-icon-circle-plus-outline {
              font-size: 24px;
              line-height: 30px;
              cursor: pointer;
              color: #0ede94;
            }
            .el-icon-circle-plus-outline {
              margin: 0 5px;
            }
            .el-form-item__error {
              position: relative;
            }
          }
        }
      }
    }

  }

</style>
