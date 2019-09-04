<template>
  <div class="import-address bg-gray">
    <div class="bg-white"></div>
    <div style="">
      <el-tabs v-model="activeName" @tab-click="handleClick" class="new_import w1200">
        <el-tab-pane label="keystore导入" name="keystoreImport">
          <div class="tc upload_keystore">
            <el-upload drag class="upload" action="localhost" accept='.keystore' v-if="!isfileReader"
                       :before-upload="handleUpload"
                       :multiple="false"
                       :limit="1">
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
            <div v-else>您的浏览器不支持FileReader,请使用最新版谷歌浏览器</div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="私钥导入" name="keyImport">
          <div class="tab bg-white w1200 mt_30">
            <el-form :model="importForm" :rules="importRules" ref="importForm" status-icon class="import-form w630">
              <el-form-item label="明文私钥" prop="keys">
                <el-input type="textarea" v-model.trim="importForm.keys" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="pass">
                <el-input v-model="importForm.pass" type="password" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="checkPass">
                <el-input v-model="importForm.checkPass" type="password" autocomplete="off"></el-input>
              </el-form-item>
              <el-form-item class="form-bnt">
                <el-button type="success" @click="keyImport('importForm')">私钥导入</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        <el-tab-pane label="创建账户" name="newAddress">
          <el-form :model="newAddressForm" status-icon :rules="newAddressRules" ref="newAddressForm"
                   class="new_address w630">
            <el-form-item label="密码" prop="pass">
              <el-input type="password" v-model="newAddressForm.pass" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="checkPass">
              <el-input type="password" v-model="newAddressForm.checkPass" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item class="form-bnt">
              <el-button type="success" @click="newAddressSubmitForm('newAddressForm')">创建账户</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
    <Password ref="password" @passwordSubmit="keystoreImportPassSubmit">
    </Password>
  </div>
</template>

<script>
  import nuls from 'nuls-sdk-js'
  import {API_CHAIN_ID, API_PREFIX} from '@/config'
  import {getAddressInfoByAddress} from '@/api/requestData'
  import {passwordVerification, connect} from '@/api/util'
  import Password from '@/components/PasswordBar'

  export default {
    data() {
      let validateKeys = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入私钥'));
        } else {
          callback();
        }
      };
      let validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.importForm.checkPass !== '') {
            this.$refs.importForm.validateField('checkPass');
          }
          callback();
        }
      };
      let validateCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.importForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };

      let validateNewPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          if (this.newAddressForm.checkPass !== '') {
            this.$refs.newAddressForm.validateField('checkPass');
          }
          callback();
        }
      };
      let validateNewCheckPass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.newAddressForm.pass) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };
      return {
        activeName: 'keystoreImport',//tab选中

        isfileReader: typeof FileReader === "undefined",//浏览器是否支持FileReader
        keystoreInfo: {},//keystore导入文本信息

        importForm: {
          keys: '',
          pass: '',
          checkPass: ''
        },
        importRules: {
          keys:
            [
              {validator: validateKeys, trigger: 'blur'}
            ],
          pass: [
            {validator: validatePass, trigger: 'blur'}
          ],
          checkPass: [
            {validator: validateCheckPass, trigger: 'blur'}
          ]
        },
        importAddressInfo: {},//私钥导入地址信息

        newAddressForm: {
          pass: '',
          checkPass: '',
        },
        newAddressRules: {
          pass: [
            {validator: validateNewPass, trigger: 'blur'}
          ],
          checkPass: [
            {validator: validateNewCheckPass, trigger: 'blur'}
          ]
        },
        newAddressInfo: {},//创建地址信息
      };
    },
    components: {
      Password
    },
    created() {
    },
    methods: {

      /**
       * @disc: tab选择
       * @params: tab
       * @date: 2019-08-31 16:18
       * @author: Wave
       */
      handleClick(tab) {
        if (tab.name === 'keystoreImport') {
          this.importAddressInfo = {};
          this.newAddressInfo = {};
          this.$refs['importForm'].resetFields();
          this.$refs['newAddressForm'].resetFields();
        } else if (tab.name === 'keyImport') {
          this.keystoreInfo = {};
          this.newAddressInfo = {};
          this.$refs['newAddressForm'].resetFields();
        } else {
          this.keystoreInfo = {};
          this.importAddressInfo = {};
          this.$refs['importForm'].resetFields();
        }
      },

      /**
       * @disc: 获取kestore信息
       * @params: file
       * @date: 2019-08-31 16:01
       * @author: Wave
       */
      handleUpload(file) {
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          //console.log(JSON.parse(reader.result));
          this.keystoreInfo = JSON.parse(reader.result);
          this.$refs.password.showPassword(true);
        });
        reader.readAsText(file, "utf-8");
      },

      /**
       * @disc: keystore 导入密码框提交
       * @params: password
       * @date: 2019-09-02 10:49
       * @author: Wave
       */
      async keystoreImportPassSubmit(password) {
        this.keystoreInfo.aesPri = this.keystoreInfo.encryptedPrivateKey;
        this.keystoreInfo.pub = this.keystoreInfo.pubKey;
        let isPassword = passwordVerification(this.keystoreInfo, password);
        if (isPassword.success) {
          this.keystoreInfo.address = isPassword.address;
          let addressInfo = await getAddressInfoByAddress(this.keystoreInfo.address);
          if (addressInfo.success) {
            let newAddressInfo = {...this.keystoreInfo, ...addressInfo.data};
            localStorage.setItem('accountInfo', JSON.stringify(newAddressInfo));
            this.toUrl('backupsAddress');
          } else {
            this.$message({message: "导入地址错误: " + addressInfo.data.error.message, type: 'error', duration: 2000});
          }
        } else {
          this.$message({message: "密码错误，请输入正确的密码!", type: 'error', duration: 2000});
        }
      },

      /**
       * @disc: 私钥导入账户提交
       * @params: formName
       * @date: 2019-08-31 16:01
       * @author: Wave
       */
      keyImport(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            const keyAddressInfo = nuls.importByKey(API_CHAIN_ID, this.importForm.keys, this.importForm.pass, API_PREFIX);
            let addressInfo = await getAddressInfoByAddress(keyAddressInfo.address);
            if (addressInfo.success) {
              let newAddressInfo = {...keyAddressInfo, ...addressInfo.data};
              localStorage.setItem('accountInfo', JSON.stringify(newAddressInfo));
              this.toUrl('backupsAddress');
            } else {
              this.$message({message: "导入地址错误: " + addressInfo.data.error.message, type: 'error', duration: 2000});
            }
            this.toUrl('backupsAddress');
          } else {
            return false;
          }
        });
      },

      /**
       * @disc: 创建账户提交
       * @params: formName
       * @date: 2019-08-31 16:01
       * @author: Wave
       */
      newAddressSubmitForm(formName) {
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            this.newAddressInfo = nuls.importByKey(API_CHAIN_ID, this.importForm.keys, this.importForm.pass);
            let addressInfo = await getAddressInfoByAddress(this.newAddressInfo.address);
            if (addressInfo.success) {
              let newAdressInfo = {...this.newAddressInfo, ...addressInfo.data};
              localStorage.setItem('accountInfo', JSON.stringify(newAdressInfo));
              this.toUrl('backupsAddress');
            } else {
              this.$message({message: "创建地址错误: " + addressInfo.data.error.message, type: 'error', duration: 2000});
            }

          } else {
            return false;
          }
        });
      },

      /**
       * @disc: 连接跳转
       * @params: name, parameter, type
       * @date: 2019-09-02 11:12
       * @author: Wave
       */
      toUrl(name, parameter = '', type = 0) {
        let newConnect = connect(name, parameter, type);
        if (newConnect.success) {
          this.$router.push(newConnect.data)
        }
      },
    }
  }
</script>

<style lang="less">
  .import-address {
    .bg-white {
      height: 130px;
    }
    .new_import {
      margin: -90px auto 100px;
      .el-tabs__header {
        margin: 0;
        .el-tabs__nav-wrap {
          text-align: center;
          &:after {
            height: 1px;
          }
        }
        .el-tabs__nav-scroll {
          .el-tabs__nav {
            float: none;
            .el-tabs__active-bar {
              height: 0;
            }
            .el-tabs__item {
              text-align: center;
              padding: 0 25px;
              margin: 10px 20px 20px;
              border-radius: 4px;
              &:hover {
                background: linear-gradient(to right, #4ef16a, #0ede94);
                color: #FFFFFF;
              }
            }
            .is-active {
              background: linear-gradient(to right, #4ef16a, #0ede94);
              color: #FFFFFF;
            }
          }
        }
      }
      .el-tabs__content {
        background-color: #FFFFFF;
        .upload_keystore {
          padding: 100px 0 100px 0;
          border: 1px solid #E4E7ED;
        }
        .import-form {
          margin: 60px auto 0;
        }
        .new_address {
          margin: 60px auto 100px;
        }
      }
    }
  }
</style>
