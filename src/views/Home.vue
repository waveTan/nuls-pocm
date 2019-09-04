<template>
  <div class="home">
    <el-row class="pocm">
      <div class="w1200">
        <el-col :span="12">
          <h2 class="title">什么是POCM?</h2>
          <p class="info">POCM是一种Token产生和分发形式，让NULS持币者把NULS当成矿机，在产生这种新的Token时，通过抵押NULS去挖矿。也可以理解为锁定币天获得空投。</p>
        </el-col>
        <el-col :span="12">
          <img src="./../assets/img/pocm_bg.png" class="img_bg">
        </el-col>
      </div>
    </el-row>
    <el-row class="investor">
      <div class="w1200">
        <el-col :span="12">
          <h4 class="title">我是投资者</h4>
          <p class="info">如果你是投资者，你可以将持有的NULS抵押到你看好的项目，以获得对应项目的Token，且不会损失当前持有的NULS</p>
          <el-button round class="btn" @click="toUrl('projectsList','',0)">选择项目</el-button>
        </el-col>
        <el-col :span="12">
          <img src="./../assets/img/investor_bg.png" class="img_bg">
        </el-col>
      </div>
    </el-row>
    <el-row class="originator">
      <div class="w1200">
        <el-col :span="12">
          <img src="./../assets/img/originator_bg.png" class="img_bg">
        </el-col>
        <el-col :span="12">
          <h4 class="title">我是项目发起者</h4>
          <p class="info">可以通过POCM的形式寻找持有NULS的项目合伙人，你可以将合伙人抵押的NULS用来去创建共识节点，以获取NULS奖励来支持项目的发展</p>
          <el-button class="btn" round @click="toUrl('projectsLaunch','',0)">提交申请信息</el-button>
        </el-col>
      </div>
    </el-row>
    <el-row class="hot" v-show="false">
      <div class="hot_title">
        <h2 class="title">热门项目</h2>
        <h6></h6>
      </div>
      <div class="hot_list w1200">
        <div class="p_list shadow fl" v-for="(item,index) in projectsList" :key="index"
             @click="toUrl('projectsInfo',item.id,0)">
          <img src="./../assets/img/list_bg.png"/>
          <h2 class="font18">{{item.name}}</h2>
          <h6>{{item.projectCard}}</h6>
          <p><span>当前运行节点</span><font class="fr">{{item.agentsCount}}</font></p>
          <p><span>抵押NULS总数</span><font class="fr">{{item.totalDeposit}}</font></p>
        </div>
      </div>
    </el-row>
  </div>
</template>

<script>
  import axios from 'axios'
  import {POCM_API_URL} from '@/config'
  import {connect, divisionDecimals} from '@/api/util'

  export default {
    data() {
      return {
        projectsList: [],//项目列表
      };
    },
    created() {
      this.selectDataByStatus();
    },
    methods: {

      /**
       * @disc: 获取下拉框信息
       * @params:
       * @date: 2019-08-20 17:51
       * @author: Wave
       */
      async selectDataByStatus() {
        const url = POCM_API_URL + '/pocm/release/list';
        const data = {status: 1};
        await axios.post(url, data)
          .then((response) => {
            if (response.data.success) {
              for (let itme of response.data.data) {
                itme.totalDeposit = divisionDecimals(itme.totalDeposit);
              }
              this.projectsList = [...response.data.data];
            }
          })
          .catch((error) => {
            console.log(error)
          })
      },

      /**
       * @disc: url 连接
       * @params: name
       * @date: 2019-08-20 18:00
       * @author: Wave
       */
      toUrl(name) {
        let newPush = connect(name, '', 0);
        if (newPush.success) {
          this.$router.push(newPush.data);
        }
      }
    }
  }
</script>

<style lang="less">
  .home {
    .pocm {
      background: linear-gradient(to right, #4ef16a, #0ede94);
      height: 500px;
      width: 100%;
      .img_bg {
        margin: 15px 0 0 0;
      }
    }
    .investor {
      height: 600px;
      width: 100%;
      .title{
        margin-top: 140px;
      }
      .img_bg {
        margin: 100px 0 0 0;
      }
    }
    .originator {
      height: 600px;
      width: 100%;
      background-color: #f8f8f8;
      .img_bg {
        margin: 150px 0 0 0;
      }
    }
    .hot {
      height: 790px;
      margin: 0 0 60px 0;
      .hot_title {
        width: 200px;
        margin: 0 auto;
        h2 {
          margin: 120px auto 20px;
          text-align: center;
          line-height: 40px;
        }
        h6 {
          background: linear-gradient(to right, #4ef16a, #0ede94);
          height: 5px;
        }
      }
      .hot_list {
        margin: 100px auto 0;
      }
    }
  }

</style>
