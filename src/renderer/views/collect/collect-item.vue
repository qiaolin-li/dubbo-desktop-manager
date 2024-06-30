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
  </div>
</template>

<script>
import interfaceCollectClient from "@/renderer/api/ServiceCollectClient.js";
const remote = require("@electron/remote");
const lodash = require('lodash');

export default {
  components: {
  },
  data() {
    return {
      collectList: {},
      expandIds: [],
    };
  },
  props: {
    connectInfo: Object,
  },
  mounted(){
    this.findInterfaceList();
  },
  methods: {
    async findInterfaceList() {
      
      const collectList = [];
      let list = await interfaceCollectClient.findList(this.connectInfo._id);
      for (let i = 0; i < list.length; i++) {
        if (!list[i].group) {
          continue;
        }

        let groupData = collectList.find(item => item.name === list[i].group);
        if(!groupData){
          groupData = {
            name: list[i].group,
            list: []
          };
          collectList.push(groupData);
        }

        groupData.list.push(list[i]);
      }

      collectList.forEach(item => {
        item.list = lodash.orderBy(item.list, ['name'], ['asc']);
      })
      
      collectList.push({
        list: lodash.orderBy(list.filter(item => !item.group), ['name'], ['asc'])
      });

      this.collectList = lodash.orderBy(collectList, ['name'], ['asc']);
    },
    async openMenuList(event, serviceInfo){
      const menuTemplate = [{
          label: this.$t('collect.open'),
          click: async () => this.handleNodeClick(serviceInfo)
        },
        { type: 'separator' },
        {
           label: this.$t('collect.copyInterfaceName'),
          click: async () => {
            navigator.clipboard.writeText(serviceInfo.serviceName)
            this.$message({
              type: "success",
              message: this.$t('editor.copySuccess'),
            });
          }
        },
        { type: 'separator' },
        {
          label: this.$t('collect.cancel'),
          click: async () => { 
            await interfaceCollectClient.deletCollect(serviceInfo._id)
            this.findInterfaceList();
          }
        },
       
      ];

      const collectMenuList = [];
      const groupList = await interfaceCollectClient.findGroupList(serviceInfo.registryCenterId);
      groupList.forEach(name => {
        if(name === serviceInfo.group) return
        collectMenuList.push({
          label: name,
          click: async () => this.collectServiceToGroup(serviceInfo, name)
        })
      })
   
      collectMenuList.push({
        label: this.$t('collect.newGroup'), 
        click: async () => {
          this.$prompt(this.$t('collect.inputGroupName'), this.$t('hint'), {
            confirmButtonText: this.$t('confirm'),
            cancelButtonText: this.$t('cancel')
          }).then(({ value }) => {
            this.collectServiceToGroup(serviceInfo, value);
          });
        }
      })

      collectMenuList.push({
        label: this.$t('collect.defaultGroup'),
        click: async () => this.collectServiceToGroup(serviceInfo)
      })

      menuTemplate.push({
        label: this.$t('collect.collect'),
        submenu: collectMenuList
      });


      // 阻止默认行为
      event.preventDefault();
      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    },
    
    async collectServiceToGroup(serviceInfo, group = null) {
      serviceInfo.group = group
      await interfaceCollectClient.save(serviceInfo)
      this.findInterfaceList();
      this.$message({
        type: "success",
        message: this.$t('editor.collectSuccess'),
      });
    },
    handleNodeClick(serviceInfo) {
      const name = serviceInfo.name.indexOf(':') >= 0 ? serviceInfo.name.substring(0, serviceInfo.name.indexOf(':')) : serviceInfo.name;
      let data = {
        registryCenterId: serviceInfo.registryCenterId,
        serviceName: serviceInfo.serviceName,
        interfaceName: name,
      };
      this.$emit("clickServiceInfo", data);
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