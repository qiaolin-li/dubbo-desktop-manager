<template>
  <div class="collectContainer">
    <div v-for="data in collectList" :key="data.name" >
      <div v-if="data.name"  class="collectGroupContainer"   >
        <div class="collectGroupContainerHeader notSelect element-hover" @click="toggleExpand(data)">
          <div>
            <i class="expanded el-tree-node__expand-icon el-icon-caret-right" v-if="expandIds.includes(data.name)"></i>
            <i  class="el-tree-node__expand-icon el-icon-caret-right" v-else ></i>
            <i class="el-icon-folder"></i>
            <span>{{data.name}}</span>
          </div>
        </div>
        <div v-show="expandIds.includes(data.name)"  class="collectInterfaceContainer element-hover notSelect"  v-for="collect in data.list" :key="collect._id" @contextmenu.stop="openMenuList($event, collect)" @dblclick="handleNodeClick(collect)"  >
          <i class="interfaceIcon"></i>
          <span>{{collect.name}}</span>
        </div>
      </div>
      <div v-else class="collectInterfaceContainer element-hover notSelect"  v-for="collect in data.list" :key="collect._id"  @contextmenu.stop="openMenuList($event, collect)" @dblclick="handleNodeClick(collect)">
        <i class="interfaceIcon"></i>
        <span>{{collect.name}}</span>
      </div>
    </div>

    <el-dialog :title="$t('collect.collect')" width="70%" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <el-form label-position="right" label-width="120px" ref="form"  >
        <el-form-item :label="$t('collect.group')"   >
          <el-autocomplete style="width: 100%" class="inline-input" v-model="currentCollectInfo.group" :fetch-suggestions="queryGroupList" :placeholder="$t('collect.defaultGroup')" ></el-autocomplete>
        </el-form-item>
        <el-form-item :label="$t('collect.name')" >
          <div>
            <el-input  type="input" v-model="currentCollectInfo.name" style="width: 80%; margin-right: 10px"  ></el-input>
            <el-link type="primary" @click="currentCollectInfo.name = currentCollectInfo.serviceName">使用服务全称</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveCollectService">{{$t('collect.collect')}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import interfaceCollectClient   from "@/renderer/api/ServiceCollectClient.js";
const remote = require("@electron/remote");
const lodash = require('lodash');

export default {
  components: {
  },
  data() {
    return {
      collectList: {},
      expandIds: [],

      dialogVisible: false,
      groupList: [],
      currentCollectInfo: {},
    };
  },
  inject: ['openServiceInfoPage', 'dataSourceId'],
  mounted(){
    this.findList();
  },
  methods: {
    async findList() {
      const collectList = lodash.chain(await interfaceCollectClient.findList(this.dataSourceId))
        .groupBy('group')
        .map((value, key) => ({ name: key !== 'null' ? key : null, list: lodash.orderBy(value, ['name'], ['asc']) }))
        .value();

      this.collectList = lodash.orderBy(collectList, ['name'], ['asc']);
    },
    async openMenuList(event, collectInfo){
      const menuTemplate = [{
          label: this.$t('collect.open'),
          click: async () => this.handleNodeClick(collectInfo)
        },
        { type: 'separator' },
        {
          label: this.$t('collect.copyInterfaceName'),
          click: async () => this.$writeClipboard(collectInfo.serviceName)
        },
        { type: 'separator' },
        {
          label: this.$t('collect.cancel'),
          click: async () => { 
            await interfaceCollectClient.deletCollect(collectInfo._id)
            this.findList();
          }
        },
      ];

      menuTemplate.push({
        label: this.$t('collect.update'),
        click: async () => this.openCollectDialog(collectInfo)
      });

      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    },

    async queryGroupList(queryString, cb) {
      const groupList = await interfaceCollectClient.findGroupList(this.dataSourceId);
      cb(groupList.map(x => ({ value: x, label: x })));
    },

    openCollectDialog(collectInfo) {
      this.dialogVisible = true;
      this.currentCollectInfo = collectInfo;
    },
    
    async saveCollectService() {
      await interfaceCollectClient.save({...this.currentCollectInfo, registryCenterId: this.dataSourceId});
      
      this.dialogVisible = false;
      this.findList();
      this.$message({
        type: "success",
        message: this.$t('editor.collectSuccess'),
      });
    },
    handleNodeClick(collectInfo) {
      const title = collectInfo.name || collectInfo.serviceName;
      const serviceInfo = {
        serviceName: collectInfo.serviceName,
        uniqueServiceName: collectInfo.uniqueServiceName || collectInfo.serviceName,
        serviceType: collectInfo.serviceType || "dubbo"
      };

      this.openServiceInfoPage(title, collectInfo.serviceName, serviceInfo)
    },
    toggleExpand(data) {
      this.expandIds = this.expandIds.includes(data.name) ? this.expandIds.filter(item => item !== data.name) : [...this.expandIds, data.name]
    }
  },
};
</script>

<style  >

.interfaceContainer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.searchTool {
  display: flex;
}

.interfaceTree {
  height: 100%;
  overflow: auto;
}

.custom-tree-icon {
  position: relative;
}

.el-icon-folder {
  margin-right: 5px;
  color: rgb(136, 241, 124);
  border-radius: 50%;
}

.collectContainer {
  min-width: max-content;
  height: 100%;
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.collectGroupContainer .collectInterfaceContainer {
  padding-left: 20px;
}

.collectGroupContainerHeader  {
  height: 25px;
  line-height: 25px
}

.collectGroupContainerHeader i{
  margin-left: 5px;
}

.collectInterfaceContainer {
  padding-left: 5px;
  height: 25px;
}

.collectInterfaceContainer span {
  line-height: 25px;
}

</style>