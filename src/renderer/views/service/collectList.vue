<template>
  <div class="collectContainer">
    <el-tree class="notSelect interfaceTree" ref="tree" :data="collectList" :props="defaultProps" node-key="_id" 
          highlight-current  :default-expanded-keys="defaultExpandIds" @node-expand="handleNodeExpand" @node-collapse="handleNodeCollapse"
          @node-click="handleNodeClick"   @node-contextmenu="openMenuList">

      <div class="custom-tree-icon" slot-scope="{ data }">
        <span>{{ data.name }}</span>
      </div>
    </el-tree>
      
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
      defaultExpandIds: [],
      defaultProps: {
        children: "list",
        label: "name",
      },
      collectList: [],
      expandIds: [],

      dialogVisible: false,
      groupList: [],
      currentCollectInfo: {},
    };
  },
  inject: ['openServiceInfoPage', 'dataSourceId', 'addTab'],
  mounted(){
    this.findList();
  },
  methods: {
    async findList() {
      const collectList = await interfaceCollectClient.findList(this.dataSourceId);

      const unGroupList = lodash.orderBy(collectList.filter(x => !x.group), ['name'], ['asc']);
      const groupList = lodash.chain(collectList.filter(x => x.group))
                              .groupBy('group')
                              .map((value, key) => ({ _id: `group-${key}`, name: key,  list: lodash.orderBy(value, ['name'], ['asc']) }))
                              .value();

      this.collectList = [...lodash.orderBy(groupList, ['name'], ['asc']), ...unGroupList];
    },
    async openMenuList(event, collectInfo){
      const menuTemplate = [];

      if(collectInfo.list && collectInfo.list.length > 0){
        if(!this.defaultExpandIds.find(item => item === collectInfo._id)) {
          menuTemplate.push({
            label: this.$t('expand'), 
            click: () => this.handleNodeExpand(collectInfo)
          });
        } else {
          menuTemplate.push({
            label: this.$t('collapse'), 
            click: () => this.handleNodeCollapse(collectInfo)
          });
        }
      } else {

        menuTemplate.push({
          label: this.$t('collect.open'),
          click: async () => this.handleNodeClick(collectInfo)
        });
        menuTemplate.push({ type: 'separator' }),

        menuTemplate.push({
          label: this.$t('collect.update'),
          click: async () => this.openCollectDialog(collectInfo)
        });
        menuTemplate.push({
          label: this.$t('collect.cancel'),
          click: async () => { 
            await interfaceCollectClient.deletCollect(collectInfo._id)
            this.findList();
          }
        });
      }

      menuTemplate.push({ type: 'separator' });
      // 注册插件菜单
      this.$appRenderer.fillPluginMenu("collectList", menuTemplate, {
        tab: {
          addTab: this.addTab
        }
      }, collectInfo);

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
      // 不是叶子节点，不能打开
      if(collectInfo.list){
        return;
      }

      const title = collectInfo.name || collectInfo.serviceName;
      const serviceInfo = {
        serviceName: collectInfo.serviceName,
        uniqueServiceName: collectInfo.uniqueServiceName || collectInfo.serviceName,
        serviceType: collectInfo.serviceType || "dubbo"
      };

      this.openServiceInfoPage(title, collectInfo.serviceName, serviceInfo)
    },

    // 树节点展开
    handleNodeExpand(data) {
      // 保存当前展开的节点
      if (!this.defaultExpandIds.find(item => item === data._id)) { 
        this.defaultExpandIds.push(data._id)
      }
    },
    // 树节点关闭
    handleNodeCollapse(data) {
      // 删除当前关闭的节点
      this.$refs.tree.store._getAllNodes().forEach(item => {
        if(item.data._id === data._id){
          item.expanded = false
        }
      });

      lodash.remove(this.defaultExpandIds, item =>  item === data._id);
    },

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


/* 未展开 */
.collectGroupContainerHeader .collapse:before{   
  content: "\e6e0";
  font-size: 16px;
  color: #389e0d;
}

/* 未展开 */
.collectGroupContainerHeader .expanded:before{   
  content: "\e6e0";
  font-size: 16px;
  color: #389e0d;
}


</style>