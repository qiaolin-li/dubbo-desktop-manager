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
          <el-select v-model="currentProvider" value-key="address" class="providerSelect" width="160px">
            <el-option v-for="item in providerList" :key="item.address" :label="item.address" :value="item">
            </el-option>
          </el-select>
          <el-select v-model="method" @change="methodChange" class="methodSelect">
            <el-option v-for="item in currentProvider.methods" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
          <el-select v-model="currentInvoker" class="invokerSelect">
            <el-option v-for="invokerType in invokerTypes" :key="invokerType.code" :label="invokerType.name" :value="invokerType.code"></el-option>
          </el-select>
          <el-button plain type="primary" icon="el-icon-thumb" @click="invokeDubbo()" :disabled="invokeing">{{invokeing ?  $t('dubbo.invokePage.calling') : $t('dubbo.invokePage.call')}}</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div :id="contentElementId" class="invoke-dubbo-dialog-content ">

      <div class="invoke-dubbo-dialog-content-code">
        <div class="contentCode broder">
          <jsonCodeEditor :codeConfig="codeConfig" :lint="true">
            <template v-slot:titel>
              {{$t('dubbo.invokePage.requestParam')}}
              <el-popover placement="top-start" :title="$t('dubbo.invokePage.requestParamStrategyTitle')" width="200" trigger="hover" :content="$t('dubbo.invokePage.paramGenerateStrategyDesc')">
                <i slot="reference" class="el-icon-info"></i>
              </el-popover>
            </template>
            <template v-slot:content>
              <el-tooltip class="item" effect="light" :content="$t('dubbo.invokePage.generateParam')" placement="top">
                <i class="el-icon-news" @click="generateParam"></i>
              </el-tooltip>
              <el-tooltip class="item" effect="light" :content="$t('dubbo.invokePage.generateCommand')" placement="top">
                <i class="el-icon-magic-stick" @click="generateInvokeCommand"></i>
              </el-tooltip>
            </template>
          </jsonCodeEditor>
        </div>

        <div class="contentCode broder">
          <jsonCodeEditor :codeConfig="invokeReulst">
            <template v-slot:titel>
              {{$t('dubbo.invokePage.responseInfo')}} {{ invokeReulst.elapsedTime }}
            </template>
          </jsonCodeEditor>
        </div>
      </div>

      <dubboInvokeHistoryParam ref="dubboInvokeHistoryParam" @selectionChange="selectionChange"></dubboInvokeHistoryParam>
    </div>

  </div>

</template>

<script>

import registry from "@/renderer/api/registryClient.js";
import dubboInvoke from "@/renderer/api/dubboInvokerClient.js";
import paramGenerator from "@/renderer/api/dubboParamGeneratorClient.js";
import appConfig from "@/renderer/api/appConfig.js";

import jsonCodeEditor from "@/renderer/components/editor/json-code-editor.vue";
import Loading from "@/renderer/common/utils/MyLoading";
import dubboInvokeHistoryParam from "@/renderer/views/dubbo/dubbo-invoke-history-param.vue";
import copyButton from "@/renderer/components/copyButton.vue";

export default {
  components: {
    copyButton,
    jsonCodeEditor,
    dubboInvokeHistoryParam
  },
  data() {
    return {
      currentProviderAddress: '',
      currentProvider: {},
      providerList: [],
      contentElementId: "",
      codeConfig: {
        code: "[]",
      },
      metadata: {},
      invokeReulst: {
        code: "",
        elapsedTime: "",
      },
      method: "",
      invokeHisotryList: [],
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
      ]
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
    this.contentElementId = `invoke-dubbo-content-${Math.random()}`.replace(/./g, '-');
    this.currentInvoker = this.invokerType = await appConfig.getProperty("invokerType") || "telnet";
  },
  async mounted() {
    if (this.provider) {
      this.currentProvider = this.provider;
    }

    this.providerList = await registry.getProviderList(this.uniqueServiceName, this.registryCenterId);
    if (this.providerList.length === 0) {
      return;
    }
    this.currentProvider = this.selectProviderAddress ? this.providerList.find(x => x.address === this.selectProviderAddress) || this.providerList[0] : this.providerList[0];
    await this.getMataData();

    if (this.currentProvider && this.currentProvider.methods) {
      this.method = this.selectMethod ? this.currentProvider.methods.find(x => x === this.selectMethod) || this.currentProvider.methods[0] : this.currentProvider.methods[0];
      this.methodChange();
    }
  },
  methods: {
    resize() {
    },
    async methodChange() {
      // 先刷新列表
      const invokeHisotryList = await this.flushInvokeHistoryList();

      if (invokeHisotryList.length > 0) {
        this.codeConfig.code = invokeHisotryList[0].param;
      } else {
        this.generateParam();
      }
    },
    async invokeDubbo() {

      try {
        JSON.parse(this.codeConfig.code);
      } catch (e) {
        this.$message({
          type: "error",
          message: this.$t('dubbo.invokePage.callParamError'),
        });
        return;
      }

      let rejectFun = () => { };

      let loadingInstance = Loading.service(
        `#${this.contentElementId}`,
        this.$t("dubbo.invokePage.invokeProgress"),
        this.$t("dubbo.invokePage.cancelInvoke"), () => {
          rejectFun(this.$t('dubbo.invokePage.cancelInvoke'));
        });

      try {
        this.invokeing = true;

        let response = await new Promise((resolve, reject) => {
          rejectFun = reject;
          dubboInvoke.invokeMethod(
            this.registryCenterId,
            this.uniqueServiceName,
            this.currentProvider,
            this.metadata,
            this.method,
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
        this.flushInvokeHistoryList();
      } finally {
        loadingInstance.close();
        this.invokeing = false;
      }

    },
    async generateInvokeCommand() {
      let param = {
        serviceName: `${this.currentProvider.serviceName}`,
        method: this.method,
        params: JSON.parse(this.codeConfig.code),
      };
      this.invokeReulst.code = await dubboInvoke.buildInvokeCommand(param);
    },
    selectionChange(invokeHistory) {
      this.codeConfig.code = invokeHistory.param;
    },
    async flushInvokeHistoryList() {
      return await this.$refs.dubboInvokeHistoryParam.changeParam(this.registryCenterId, this.currentProvider, this.method)
    },
    async generateParam() {
      let code = await paramGenerator.generateParam(this.metadata, this.method);
      this.codeConfig.code = JSON.stringify(code, null, 2) || "[]";
    },
    async getMataData() {
      this.metadata = await registry.getMetaData(this.currentProvider, this.registryCenterId);
    },
    
  },
};
</script>

<style>
.broder {
  border: rgb(230, 233, 243) 1px solid;
}

.invoke-dubbo-dialog {
  height: 90vh;
  overflow-y: hidden;
  background-color: white;
}

.invoke-dubbo-dialog-content {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-content: space-between;
  height: 100%;
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

.invoke-dubbo-dialog-content-code {
  width: 75%;
  height: 100%;
}
</style>