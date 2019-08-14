<template>
  <div class="projects_list bg-white">
    <div class="w1200 projects_title">
      <h5 class="info fl">下方为当前已经启动的POCM项目，请选择合适的项目进行投资</h5>
      <el-button round class="btn fr">选择项目</el-button>
    </div>
    <div class="cb"></div>
    <div class=" w1200 projects_info bg-white">
      <div class="p_list shadow fl" @click="toUrl('projectsInfo')">
        <img src="./../../assets/img/list_bg.png"/>
        <h6>Aleph 一个专注于Layer2 的平台XXXXXXAleph 一个专注于 一个专注于Layer2 的平注于Layer2 的注于Layer2 的台XXXXXX</h6>
        <p><span>当前运行节点</span><font class="fr">2</font></p>
        <p><span>抵押NULS总数</span><font class="fr">7,655,432</font></p>
      </div>
      <div class="p_list shadow fl">
        <img src="./../../assets/img/list_bg.png"/>
        <h6>Aleph 一个专注于Layer2 的平台XXXXXXAleph 一个专注于 一个专注于Layer2 的平注于Layer2 的注于Layer2 的台XXXXXX</h6>
        <p><span>当前运行节点</span><font class="fr">2</font></p>
        <p><span>抵押NULS总数</span><font class="fr">7,655,432</font></p>
      </div>
      <div class="p_list shadow fl">
        <img src="./../../assets/img/list_bg.png"/>
        <h6>Aleph 一个专注于Layer2 的平台XXXXXXAleph 一个专注于 一个专注于Layer2 的平注于Layer2 的注于Layer2 的台XXXXXX</h6>
        <p><span>当前运行节点</span><font class="fr">2</font></p>
        <p><span>抵押NULS总数</span><font class="fr">7,655,432</font></p>
      </div>
      <div class="p_list shadow fl">
        <img src="./../../assets/img/list_bg.png"/>
        <h6>Aleph 一个专注于Layer2 的平台XXXXXXAleph 一个专注于 一个专注于Layer2 的平注于Layer2 的注于Layer2 的台XXXXXX</h6>
        <p><span>当前运行节点</span><font class="fr">2</font></p>
        <p><span>抵押NULS总数</span><font class="fr">7,655,432</font></p>
      </div>
      <div class="p_list shadow fl">
        <img src="./../../assets/img/list_bg.png"/>
        <h6>Aleph 一个专注于Layer2 的平台XXXXXXAleph 一个专注于 一个专注于Layer2 的平注于Layer2 的注于Layer2 的台XXXXXX</h6>
        <p><span>当前运行节点</span><font class="fr">2</font></p>
        <p><span>抵押NULS总数</span><font class="fr">7,655,432</font></p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {};
    },
    created() {
    },
    methods: {

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
  .projects_list{
    min-height: 900px;
    margin: 0 auto 60px;
    .projects_title{
      .info{
        font-size: 22px;
        line-height: 50px;
        margin: 20px 0 0 0;
      }
      .btn{
        margin: 20px 0 0 0 !important;
      }
    }
    .projects_info{
      margin: 20px auto 0;
      .p_list{
        margin: 50px 10px 0;
        width: 285px;
        &:first-child{
          margin-left: 0;
        }
        &:nth-child(4n){
          margin-right: 0;
        }
        &:nth-child(5n){
          margin-left: 0;
        }
      }
    }

  }

</style>
