<template>
  <div class="invoke-dubbo-dialog">
    <div class="invoke-dubbo-dialog-interface-info">
      <el-descriptions class="margin-top" :column="4" size="mini" border>
        <el-descriptions-item span="3" >
          <template slot="label"> {{$t('dubbo.invokePage.serviceName')}} </template>
          {{ currentProvider.serviceName }}
          <copyButton :message="currentProvider.serviceName"></copyButton>
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.dubboVersion')}} </template>
          {{ currentProvider.dubboVersion }}
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label"> {{$t('dubbo.invokePage.application')}} </template>
          {{ currentProvider.application }}
          <copyButton :message="currentProvider.application"></copyButton>
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.jarVersion')}} </template>
          {{ currentProvider.revision }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.version')}} </template>
          {{ currentProvider.version }}
        </el-descriptions-item>

        <el-descriptions-item span="3">
          <template slot="label"> {{$t('dubbo.invokePage.operate')}} </template>
          <el-select v-model="currentProvider" value-key="address" class="providerSelect" width="160px" filterable >
            <el-option v-for="item in providerList" :key="item.address" :label="item.address" :value="item">
            </el-option>
          </el-select>
          <el-select v-model="method" @change="methodChange" class="methodSelect" filterable value-key="name">
            <el-option v-for="item in currentProvider.methods" :key="item.name" :label="item.name" :value="item">
            </el-option>
          </el-select>
          <el-select v-model="currentInvoker" class="invokerSelect">
            <el-option v-for="invokerType in invokerTypes" :key="invokerType.code" :label="invokerType.name" :value="invokerType.code"></el-option>
          </el-select>
          <el-button plain type="primary" icon="el-icon-thumb" @click="invokeDubbo()" :disabled="invokeing">{{invokeing ?  $t('dubbo.invokePage.calling') : $t('dubbo.invokePage.call')}}</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div ref="contentElement" class="invoke-dubbo-dialog-content">
      <dragTab :fisrtTabProps="fisrtTabProps" fisrtDefaultName="params" :secondTabProps="secondTabProps" secondDefaultName="response" :collapsible="false">
        <template slot="fisrtToolBar">
          <dragTabToolBar name="paramType">
            <el-tooltip  effect="light" :content="$t('dubbo.invokePage.format')" placement="top-start">
              <i class="el-icon-lollipop iconButton" @click="() => $refs.paramTypeEditor.formatContent()"></i>
            </el-tooltip>
            <el-tooltip effect="light" :content="$t('editor.copy')" placement="top-start">
              <i class="el-icon-document-copy iconButton" @click="() => $refs.paramTypeEditor.copy()"></i>
            </el-tooltip>
          </dragTabToolBar>
          <dragTabToolBar name="params">
            <el-tooltip effect="light" :content="$t('dubbo.invokePage.historyParam')" placement="top">
              <i class="el-icon-notebook-1 iconButton" @click="openHistoryDialog"></i>
            </el-tooltip>
            <el-tooltip effect="light" :content="$t('dubbo.invokePage.generateParam')" placement="top">
              <i class="el-icon-news iconButton" @click="() => codeConfig.code = method.defaultParameter  || '[]'"></i>
            </el-tooltip>
            <el-tooltip effect="light" :content="$t('dubbo.invokePage.generateCommand')" placement="top">
              <i class="el-icon-magic-stick iconButton" @click="generateInvokeCommand"></i>
            </el-tooltip>
            <el-tooltip  effect="light" :content="$t('dubbo.invokePage.format')" placement="top-start">
              <i class="el-icon-lollipop iconButton" @click="() => $refs.paramEditor.formatContent()"></i>
            </el-tooltip>
            <el-tooltip effect="light" :content="$t('editor.copy')" placement="top-start">
              <i class="el-icon-document-copy iconButton" @click="() => $refs.paramEditor.copy()"></i>
            </el-tooltip>
          </dragTabToolBar>
        </template>
        <template slot="fisrtContent">
          <dragTabItem name="paramType" @show="() => $refs.paramTypeEditor.focus()">
            <jsonCodeEditor ref="paramTypeEditor" :codeConfig="paramTypeCodeConfig" :lint="true"></jsonCodeEditor>
          </dragTabItem>
          <dragTabItem name="params" @show="() => $refs.paramEditor.focus()">
            <jsonCodeEditor ref="paramEditor" :codeConfig="codeConfig" :lint="true"></jsonCodeEditor>
          </dragTabItem>
        </template>

        <template slot="secondToolBar">
          <dragTabToolBar name="response">
            <span>{{ invokeReulst.elapsedTime ? `Time: ${invokeReulst.elapsedTime} ms` : '' }} </span>
            <el-tooltip  effect="light" :content="$t('dubbo.invokePage.format')" placement="top-start">
              <i class="el-icon-lollipop iconButton" @click="() => $refs.responseEditor.formatContent()"></i>
            </el-tooltip>
            <el-tooltip effect="light" :content="$t('editor.copy')" placement="top-start">
              <i class="el-icon-document-copy iconButton" @click="() => $refs.responseEditor.copy()"></i>
            </el-tooltip>
          </dragTabToolBar>
        </template>
        <template slot="secondContent">
          <dragTabItem name="response"  @show="() => $refs.responseEditor.focus()">
            <jsonCodeEditor ref="responseEditor" :codeConfig="invokeReulst"></jsonCodeEditor>
          </dragTabItem>
        </template>
      </dragTab>
    </div>

    <el-dialog :title="$t('dubbo.invokePage.historyInvokeParamList')" width="60%" top="10vh" :visible.sync="dialogVisible" :close-on-click-modal="false">
      <dubboInvokeHistoryParam ref="dubboInvokeHistoryParam" @selectionChange="(invokeHistory) => codeConfig.code = invokeHistory.param"></dubboInvokeHistoryParam>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="selectHistoryParam">{{$t('base.confirm')}}</el-button>
        <el-button @click="dialogVisible = false">{{$t('base.cancel')}}</el-button>
      </span>
    </el-dialog>
  </div>

</template>

<script>

import registry from "@/renderer/api/registryClient.js";
import dubboInvoke from "@/renderer/api/dubboInvokerClient.js";
import appConfig from "@/renderer/api/appConfig.js";
import invokeHisotryRecord from "@/renderer/api/invokeHistoryClient.js";

import jsonCodeEditor from "@/renderer/components/editor/json-code-editor.vue";
import Loading from "@/renderer/common/utils/MyLoading";
import dubboInvokeHistoryParam from "@/renderer/views/dubbo/dubbo-invoke-history-param.vue";
import copyButton from "@/renderer/components/copyButton.vue";
import dragTab from '@/renderer/components/tabs/dragTab.vue';
import dragTabItem from '@/renderer/components/tabs/dragTabItem.vue';
import dragTabToolBar from '@/renderer/components/tabs/dragTabToolBar.vue';

export default {
  components: {
    dragTab,
    dragTabItem,
    dragTabToolBar,
    copyButton,
    jsonCodeEditor,
    dubboInvokeHistoryParam
  },
  data() {
    return {
      currentProviderAddress: '',
      currentProvider: {},
      providerList: [],
      paramTypeCodeConfig: {
        code: "[ ]",
      },
      codeConfig: {
        code: "[]",
      },
      invokeReulst: {
        code: "",
        elapsedTime: null,
      },
      method: null,
      dialogVisible: false,
      currentInvoker: "",
      invokeing: false,
      invokerTypes: [
        {
          code: "telnet",
          name: "Telnet"
        },
        {
          code: "java",
          name: "Java"
        }
      ],
      fisrtTabProps: [],
      secondTabProps: [],
    };
  },
  props: {
    registryCenterId: String,
    interfaceName: String,
    uniqueServiceName: String,
    provider: {
      type: Object,
      default: null,
    },
    selectProviderAddress: {
      type: String,
      default: '',
    },
    selectMethod: {
      type: String,
      default: '',
    }
  },
  async created() {
    this.currentInvoker = this.invokerType = await appConfig.getProperty("invokerType") || "telnet";
  },
  async mounted() {
    this.fisrtTabProps = [ {
      name: "paramType",
      titel: this.$t('dubbo.invokePage.requestParamType'),
    },{
      name: "params",
      titel: this.$t('dubbo.invokePage.requestParam'),
    },];

    this.secondTabProps = [{
      name: "response",
      titel: this.$t('dubbo.invokePage.responseInfo'),
    }];

    if (this.provider) {
      this.currentProvider = this.provider;
    }

    this.providerList = await registry.getProviderList(this.uniqueServiceName, this.registryCenterId);
    if (this.providerList.length === 0) {
      return;
    }

    this.currentProvider = this.selectProviderAddress ? this.providerList.find(x => x.address === this.selectProviderAddress) || this.providerList[0] : this.providerList[0];
    if (this.currentProvider.methods) {
      this.method = this.selectMethod ? this.currentProvider.methods.find(x => x.name === this.selectMethod) || this.currentProvider.methods[0] : this.currentProvider.methods[0];
      this.methodChange();
    }

    this.$nextTick(() => {
      this.$refs.paramTypeEditor.focus();
      this.$refs.paramEditor.focus();
      this.$refs.responseEditor.focus();
    })
  },
  methods: {
    resize() {},
    async methodChange() {
      // 先刷新列表  
      const invokeHisotry = await invokeHisotryRecord.findLastRecord(this.registryCenterId, this.currentProvider.serviceName, this.method.name);
      if(!this.method.parameterTypes){
        this.$message({
          type: "error",
          message: this.$t('dubbo.invokePage.notFoundMatedata'),
        });
        this.method.parameterTypes = [];
      }
      this.codeConfig.code = invokeHisotry ? invokeHisotry.param : this.method.defaultParameter || '[]';
      this.paramTypeCodeConfig.code = JSON.stringify(this.method.parameterTypes, null, 2);
    },
    async invokeDubbo() {
      try {
        JSON.parse(this.codeConfig.code);
      } catch (e) {
        this.$message({type: "error", message: this.$t('dubbo.invokePage.callParamError')});
        return;
      }

      let rejectFun = () => { };

      let loadingInstance = Loading.service(
        this.$refs.contentElement,
        this.$t("dubbo.invokePage.invokeProgress"),
        this.$t("dubbo.invokePage.cancelInvoke"), () => {
          rejectFun(this.$t('dubbo.invokePage.cancelInvoke'));
        });

      try {
        this.invokeing = true;

        let response = await new Promise((resolve, reject) => {
          rejectFun = reject;

          const method = {...this.method, parameterTypes: JSON.parse(this.paramTypeCodeConfig.code)};

          dubboInvoke.invokeMethod(
            this.registryCenterId,
            this.uniqueServiceName,
            this.currentProvider,
            method,
            this.codeConfig.code,
            this.currentInvoker
          ).then(resolve).catch(reject);
        });

        this.invokeReulst.code = response.data;
        this.invokeReulst.elapsedTime = response.elapsedTime;
        this.$message({
          type: "success",
          message: this.$t('dubbo.invokePage.callDubboServiceSuccess'),
        });
      } finally {
        loadingInstance.close();
        this.invokeing = false;
      }

    },
    async generateInvokeCommand() {
      const param = {
        serviceName: `${this.currentProvider.serviceName}`,
        method: this.method.name,
        params: JSON.parse(this.codeConfig.code),
      };
      this.invokeReulst.code = await dubboInvoke.buildInvokeCommand(param);
    },
    openHistoryDialog() {
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.dubboInvokeHistoryParam.changeParam(this.registryCenterId, this.currentProvider, this.method.name);
      })
    },
    selectHistoryParam() {
      const invokeHistory = this.$refs.dubboInvokeHistoryParam.getHistory();
      if(!invokeHistory){
          this.$message({
          type: "error",
          message: this.$t('dubbo.invokePage.unselectedHistory'),
        });
        return;
      }

      this.dialogVisible = false;
      this.codeConfig.code = invokeHistory.param;
    }
  },
};
</script>

<style>
.broder {
  border: rgb(230, 233, 243) 1px solid;
}

.invoke-dubbo-dialog {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  height: 100%;
}

.invoke-dubbo-dialog-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: auto;
}

.el-collapse-item {
  white-space: nowrap;
}

.providerSelect {
  margin-right: 10px;
  width: 200px;
}

.methodSelect {
  margin-right: 10px;
  width: 300px;
}

.contentCode {
  margin-bottom: 10px;
}

.item {
  margin-left: 2px;
  padding: 4px;
}
.item:hover {
  background-color: #ccc;
  border-radius: 50%;
}

.invokerSelect {
  width: 100px;
  padding-right: 10px;
}

.cancel-button {
  box-shadow: inset 0px 1px 0px 0px #ffffff;
  background: linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);
  background-color: #ffffff;
  border-radius: 4px;
  border: 1px solid #dcdcdc;
  display: inline-block;
  cursor: pointer;
  color: #666666;
  font-family: Arial;
  font-size: 16px;
  font-weight: bold;
  padding: 10px 29px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffffff;
  margin-top: 10px;
}
.cancel-button:hover {
  background: linear-gradient(to bottom, #f6f6f6 5%, #ffffff 100%);
  background-color: #f6f6f6;
}
.cancel-button:active {
  position: relative;
  top: 1px;
}
</style>