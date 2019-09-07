<template>
  <div class="header bg-white">
    <div class="w1200">
      <div class="logo fl">
        <img class="clicks" @click="toUrl('home')" src="../assets/logo.png">
      </div>
      <div class="nav fl">
        <el-menu :default-active="activeIndex" class="fl" mode="horizontal" @select="handleSelect">
          <el-menu-item index="projects">选择项目</el-menu-item>
          <el-menu-item index="token">发行通证</el-menu-item>
          <div class="user fr tc">
            <div class="height">
              <i class="el-icon-s-grid fCN"></i>
              <span> {{height}} </span>
            </div>
            <div class="user_info" v-if="accountAddress">
              <el-submenu index="user">
                <template slot="title"><i class="el-icon-s-custom click "></i>&nbsp;
                </template>
                <el-menu-item index="userInfo">用户中心</el-menu-item>
                <el-menu-item index="backupsAddress">备份账户</el-menu-item>
                <el-menu-item index="signOut">退出</el-menu-item>
              </el-submenu>
            </div>
          </div>
        </el-menu>
        <div v-if="!accountAddress" class="click font14 fr landing" @click="toUrl('newAddress')">登陆</div>
      </div>
    </div>
    <div class="cb"></div>
  </div>
</template>

<script>
  import axios from 'axios'
  import {POCM_API_URL} from '@/config'

  export default {
    data() {
      return {
        activeIndex: '1',//导航选中
        accountInfo: {},//账户信息
        accountAddress: '',//账户地址
        height: 0,//最新高度
      };
    },
    created() {
      this.getBestBlockHeader();
    },
    mounted() {
      setInterval(() => {
        if (localStorage.hasOwnProperty('accountInfo')) {
          this.accountInfo = JSON.parse(localStorage.getItem('accountInfo'));
          this.accountAddress = this.accountInfo.address;
        }
      }, 500);

      setInterval(() => {
        this.getBestBlockHeader()
      }, 10000)
    },
    methods: {

      /**
       * 导航切换
       * @param key
       */
      handleSelect(key) {
        if (key === 'projects') {
          this.toUrl('projectsList')
        } else if (key === 'token') {
          this.toUrl('newToken')
        } else if (key === 'userInfo') {
          this.getAuthorization(this.accountInfo.address);
        }else if(key ==='backupsAddress'){
          this.toUrl('backupsAddress');
        }else if (key === 'signOut') {
          this.signOut();
        }
      },

      /**
       * 退出
       */
      signOut() {
        localStorage.removeItem('accountInfo');
        this.accountInfo = {};
        this.accountAddress = '';
        this.toUrl('newAddress')
      },

      /**
       * @disc: 判断地址是否为创建项目者
       * @params: address
       * @date: 2019-08-26 16:58
       * @author: Wave
       */
      async getAuthorization(address) {
        const url = POCM_API_URL + '/pocm/authorization/list';
        const data = {address: address};
        await axios.post(url, data)
          .then((response) => {
            //console.log(response.data);
            if (response.data.success) {
              if (response.data.data.length === 0) {
                this.toUrl('user')
              } else {
                if (response.data.data[0].status === 0) {
                  this.$router.push({
                    name: 'newPocm',
                    query: {
                      authorizationCode: response.data.data[0].authorizationCode,
                      releaseId: response.data.data[0].releaseId
                    }
                  })
                } else {
                  this.$router.push({
                    name: 'pocmUser',
                  });
                  sessionStorage.setItem("data", JSON.stringify(response.data.data[0]))
                }
              }
            } else {
              this.toUrl('user');
              this.$message({message: "对不起，获取项目发布者错误！", type: 'error', duration: 3000});
            }
          })
          .catch((error) => {
            console.log(error);
            this.$message({message: "对不起，获取项目发布者异常！", type: 'error', duration: 3000});
          })
      },

      /**
       * 获取最新高度
       */
      getBestBlockHeader() {
        this.$post('/', 'getBestBlockHeader', [])
          .then((response) => {
            //console.log(response)
            if (response.hasOwnProperty("result")) {
              this.height = response.result.height;
            } else {
              this.height = 0;
            }
          }).catch((error) => {
          this.height = 0;
          console.log(error);
        })
      },

      /**
       * url 连接
       * @param name
       */
      toUrl(name) {
        this.$router.push({
          name: name,
        })
      }
    }
  }
</script>

<style lang="less">
  @import "./../assets/css/style";

  .header {
    border-bottom: 1px solid #bebebe;
    height: 100px;
    line-height: 100px;
    .logo {
      width: 104px;
      margin: 18px 0 0 0;
      height: 42px;
    }
    .nav {
      width: 1095px;
      height: 98px;
      .el-menu.el-menu--horizontal {
        border-bottom: 0;
        width: 1095px;
        height: 98px;
        .el-menu-item {
          height: 98px;
          line-height: 100px;
          padding: 0;
          margin: 0 25px;
          font-size: 18px;
          color: #333;
          &:hover {
            color: @Ncolour;
          }
          &:first-child {
            margin-left: 75px;
          }
        }
        .is-active {
          color: @Ncolour;
          border-bottom: 0 solid transparent;
        }
      }
      .user {
        margin-right: 20px;
        .height {
          width: 120px;
          float: left;
        }
        .user_info {
          float: right;
          width: 50px;
          .el-submenu {
            &:hover {
              background-color: transparent;
            }
            .el-submenu__title {
              line-height: 20px;
              height: 20px;
              margin: 40px auto 0;
              padding: 0;
              width: 25px;
              &:hover {
                background-color: transparent;
              }
              .el-icon-arrow-down {
                font-size: 0;
              }
            }
          }
        }
      }
      .landing {
        width: 30px;
        margin: -55px 0 0 0;
        text-align: center;
        z-index: 99;
        position: relative;
      }
    }
  }
</style>
