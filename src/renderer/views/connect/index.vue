<template>
  <split-pane @resize="resize" split="vertical" :min-percent="15" :default-percent="20">
      <template slot="paneL">
          <div class="left-container">
            <div id="connectDiv">
              <div class="addConnectDialog dragRegion">
                <span class="btn-plus" @click="openAddConnectDialog()">
                  <i class="el-icon-plus"></i>{{` ${$t('connect.addConnect')}`}}</span>
              </div>
              <el-divider class="my-divider"></el-divider>
              <connectList ref="connectList" :mainPanel="mainPanel" @editConnect="openAddConnectDialog"></connectList>

              <el-dialog :title="currentConnectId ? $t('connect.modifyConnect') : $t('connect.addConnect')" width="40%" :visible.sync="dialogVisible" :close-on-click-modal="false">
                <addConnect @saveSuccess="saveConnectSuccess" :id="currentConnectId" :key="addConnectKey" />
              </el-dialog>
            </div>
          </div>
      </template>
      <template slot="paneR">
          <myTabList ref="myTabs" navScrollClassList="dragRegion" tabListClassList="noDragRegion"></myTabList>
      </template>
  </split-pane>
</template>

<script>
import myTabList from '@/renderer/components/tabs/index.vue';
import addConnect from "./add/add-connect.vue";
import connectList from "./connect-list.vue";
import { ipcRenderer } from 'electron'
const remote = require("@electron/remote");

export default {
  components: {
    myTabList,
    addConnect,
    connectList
  },
  props: {
    mainPanel: Object,
  },  
  data() {
    return {
      addConnectKey: 1,
      dialogVisible: false,
      currentConnectId: null,
    };
  },
  created() {
    ipcRenderer.on('openAddConnectDialogEvent', () =>  this.openAddConnectDialog());
  },
  mounted() {
    let connectDiv = document.getElementById("connectDiv");

    // 菜单键点击
    connectDiv.addEventListener('contextmenu', ev => {
      // 菜单模板
      const menuTemplate = [
        {
          label: this.$t('menu.addConnect'),
          click: async () => {
            this.openAddConnectDialog();
          }
        }
      ];

      // // 构建菜单项
      const menu = remote.Menu.buildFromTemplate(menuTemplate);
      // 阻止默认行为
      ev.preventDefault();

      // 弹出上下文菜单
      menu.popup({
        // 获取网页所属的窗口
        window: remote.getCurrentWindow()
      });
    });
  },
  methods: {
    resize() {},
    // eslint-disable-next-line no-unused-vars
    saveConnectSuccess(data) {
      this.$refs.connectList.findConnectList();
      this.dialogVisible = false;
    },
    openAddConnectDialog(id) {
      this.addConnectKey++;
      this.dialogVisible = true;
      this.currentConnectId = id || "";
    },
  }
}
</script>

<style>
.my-divider {
  margin: 2px 0px;
}

#connectDiv {
  height: 100%;
  width: 100%;
  overflow: auto;
}

.addConnectDialog {
  margin: 6px 10px;
}

.btn-plus {
  height: 30px;
  line-height: 30px;
  padding: 5px 10px;
}

.btn-plus:hover {
  background-color: #ccc;
  border-radius: 4px;
}

.is-light {
  border-color: #ececec !important;
}

.popper__arrow {
  border-right-color: #ececec !important;
}
</style>