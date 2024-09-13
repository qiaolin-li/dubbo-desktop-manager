<template>
  <div class="container">
    <div  v-for="dataSourceInfo in dataSourceInfoList" :key="dataSourceInfo._id">
      <!-- zk 连接 -->
      <div class="connectContainer element-hover notSelect"  @dblclick="openConnect(dataSourceInfo)" @contextmenu.stop="openMenuList($event, dataSourceInfo)">
        <!-- zk 连接名称 -->
        <div class="connectContainer-left">
          <i class="iconfont el-icon-coin"></i>
          <span class="txt">{{ dataSourceInfo.name }}</span>
        </div>

        <!-- 操作按钮 -->
        <div class="connectContainer-right">
          <el-tooltip effect="light" :content="$t('base.modify')" placement="right-start">
            <i class="el-icon-edit iconButton" @click.stop="() => $emit('editConnect', dataSourceInfo._id)"></i>
          </el-tooltip>
          <el-tooltip effect="light" :content="$t('base.delete')" placement="right-start">
            <i class="el-icon-delete iconButton" @click.stop="deleteConnect(dataSourceInfo._id)"></i>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const remote = require("@electron/remote");
import dataSourceRepository from "@/renderer/api/DataSourceRepositoryClient.js";
import lodash from 'lodash';


let iconIndex = 0;
const iconList = lodash.shuffle(['el-icon-light-rain', 'el-icon-lightning', 'el-icon-heavy-rain', 'el-icon-sunrise',
                    'el-icon-sunrise-1', 'el-icon-sunset', 'el-icon-sunny', 'el-icon-cloudy', 'el-icon-partly-cloudy',
                    'el-icon-cloudy-and-sunny', 'el-icon-moon', 'el-icon-moon-night']);


export default {
  props: {
    mainPanel: Object,
  },  
  data() {
    return {
      dataSourceInfoList: [],
      interfaceInfo: {}
    };
  },
  mounted() {
    this.findConnectList();
  },
  methods: {
    async findConnectList() {
      let dataSourceInfoList = await dataSourceRepository.findList();
      for (let i = 0; i < dataSourceInfoList.length; i++) {
        dataSourceInfoList[i].interfaceList = [];
      }
      this.dataSourceInfoList = dataSourceInfoList;
    },
    openConnect(dataSourceInfo) {
      this.mainPanel.addMenu({
        id: dataSourceInfo._id, 
        label: dataSourceInfo.name,
        icon: iconList[iconIndex % iconList.length],
        component: 'serviceManager', 
        closable: true,
        params: {
          dataSourceInfo
        }
      });

      iconIndex++;
    },
    deleteConnect(id) {
      this.$confirm(this.$t('connect.confirmDeleteConnect'), this.$t('base.hintTitle'), {
        confirmButtonText: this.$t('base.confirm'),
        cancelButtonText: this.$t('base.cancel'),
        type: "warning",
      }).then(async () => {
        await dataSourceRepository.deleteConnect(id);
        this.$message({
          type: "success",
          message: this.$t('base.deleteSuccess'),
        });
        this.findConnectList();
      });
    },
    openMenuList(event, dataSourceInfo){
      const menuTemplate = [
        {
          label: this.$t('connect.open'),
          click: async () => this.openConnect(dataSourceInfo)
        },
        { type: 'separator' },
        {
          label: this.$t('base.modify'),
          click: async () => this.editConnect(dataSourceInfo._id)
        },
        {
          label: this.$t('base.delete'),
          click: async () => this.deleteConnect(event, dataSourceInfo._id)
        }
      ];
      // 阻止默认行为
      event.preventDefault();
      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    }
  }
}
</script>

<style>

.connectContainer {
  display: flex;
  justify-content: space-between;
  line-height: 30px;
  white-space: nowrap;
  padding-left: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.txt {
  margin-left: 5px;
}

</style>