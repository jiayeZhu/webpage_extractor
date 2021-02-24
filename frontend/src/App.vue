<template>
  <div id="app">
    <transition name="fade">
      <router-view />
    </transition>
  </div>
</template>

<script>
export default {
  name: "app",
  created: async function () {
    this.axios.defaults.baseURL = "http://localhost:3000";
  },
  data: () => ({
    show: true,
  }),
};
</script>

<style lang="less">
.fade-enter-active {
  transition: all 0.2s ease;
}
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter, .fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  // transform: translateX(10px);
  opacity: 0;
}
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
html {
  background: #fafafa;
}
#app {
  position: relative;
  min-height: calc(100vh - 16px);
  background: #fff;
  border-radius: 5px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  #header {
    margin: 1rem 0;
  }
  .el-divider {
    margin: 0 20px;
    width: calc(100% - 40px);
  }
  #pagination {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }
}

</style>
