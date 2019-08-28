<template>
  <div class="projects_list bg-white">
    <div class="w1200 projects_title">
      <h5 class="info fl">下方为当前已经启动的POCM项目，请选择合适的项目进行投资</h5>
      <el-button round class="btn fr" @click="toUrl('projectsLaunch','',0)">发行项目</el-button>
    </div>
    <div class="cb"></div>
    <div class=" w1200 projects_info bg-white">
      <div class="p_list shadow fl" v-for="(item,index) in projectsList" :key="index"
           @click="toUrl('projectsInfo',item.id)">
        <img src="./../../assets/img/list_bg.png"/>
        <h2 class="font18">{{item.name}}</h2>
        <h6>{{item.projectCard}}</h6>
        <p><span>当前运行节点</span><font class="fr">{{item.agentsCount}}</font></p>
        <p><span>抵押NULS总数</span><font class="fr">{{item.totalDeposit}}</font></p>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import {POCM_API_URL} from '@/config'
  import {divisionDecimals} from '@/api/util'

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
      selectDataByStatus() {
        const url = POCM_API_URL +'/pocm/release/list';
        const data = {status: 1};
        axios.post(url, data)
          .then((response) => {
            //console.log(response.data.data);
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
       * @params: params
       * @date: 2019-08-20 18:01
       * @author: Wave
       */
      toUrl(name,params) {
        this.$router.push({
          name: name,
          query: {releaseId: params}
        });
      }
    }
  }
</script>

<style lang="less">
  .projects_list {
    min-height: 900px;
    margin: 0 auto 60px;
    .projects_title {
      .info {
        font-size: 22px;
        line-height: 50px;
        margin: 20px 0 0 0;
      }
      .btn {
        margin: 20px 0 0 0 !important;
      }
    }
    .projects_info {
      margin: 20px auto 0;
      .p_list {
        margin: 50px 10px 0;
        width: 285px;
        &:first-child {
          margin-left: 0;
        }
        &:nth-child(4n) {
          margin-right: 0;
        }
        &:nth-child(5n) {
          margin-left: 0;
        }
      }
    }

  }

</style>
