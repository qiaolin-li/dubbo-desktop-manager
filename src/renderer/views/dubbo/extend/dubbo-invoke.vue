<template>
  <div class="invoke-dubbo-dialog">
    <div class="invoke-dubbo-dialog-interface-info">
      <el-descriptions class="margin-top" :column="3" size="mini" border>
        <el-descriptions-item span="3">
          <template slot="label"> {{$t('dubbo.invokePage.serviceName')}} </template>
          {{ provider.serviceName }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.application')}} </template>
          {{ provider.application }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.address')}} </template>
          {{ provider.address }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.generic')}} </template>
          {{ provider.generic }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.version')}} </template>
          {{ provider.version }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.dubboVersion')}} </template>
          {{ provider.dubboVersion }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.jarVersion')}} </template>
          {{ provider.revision }}
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label"> {{$t('dubbo.invokePage.method')}} </template>
          <el-select v-model="method" @change="methodChange" class="methodSelect">
            <el-option v-for="item in provider.methods" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"> {{$t('dubbo.invokePage.operate')}}</template>
          <el-button-group>
            <el-tooltip class="item" effect="light" :content="$t('dubbo.invokePage.call')" placement="top">
              <el-button plain type="primary" icon="el-icon-thumb" @click="invokeDubbo()"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="light" :content="$t('dubbo.invokePage.generateParam')" placement="top">
              <el-button plain type="primary" icon="el-icon-news" @click="generateParam()"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="light" :content="$t('dubbo.invokePage.generateCommand')" placement="top">
              <el-button plain type="primary" icon="el-icon-magic-stick" @click="generateInvokeCommand()"></el-button>

            </el-tooltip>
          </el-button-group>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div id="invoke-dubbo-dialog-content" class="invoke-dubbo-dialog-content ">
      <div class="invoke-dubbo-dialog-content-code">
        <div class="contentCode broder">

          <codeEditor :codeConfig="codeConfig" :lint="true">
            <template v-slot:titel>
              {{$t('dubbo.invokePage.requestParam')}}
              <el-popover placement="top-start" :title="$t('dubbo.invokePage.requestParamStrategyTitle')" width="200" trigger="hover" :content="$t('dubbo.invokePage.paramGenerateStrategyDesc')">
                <i slot="reference" class="el-icon-info"></i>
              </el-popover>
            </template>
            <template v-slot:content>
              <el-tooltip class="item" effect="light" :content="$t('dubbo.invokePage.format')" placement="top-start">
                <i class="el-icon-lollipop" @click="formatContent"></i>
              </el-tooltip>
            </template>
          </codeEditor>
        </div>

        <div class="contentCode broder">
          <codeEditor :codeConfig="invokeReulst">
            <template v-slot:titel>
              {{$t('dubbo.invokePage.responseInfo')}} {{ invokeReulst.elapsedTime }}
            </template>
          </codeEditor>
        </div>
      </div>

      <div class="invoke-dubbo-dialog-content-hisotry broder">
        {{$t('dubbo.invokePage.historyInvokeParamList')}}{{ invokeHisotryList.length }}）

        <ul class="infinite-list">
          <li v-for="invokeHistry in invokeHisotryList" :key="invokeHistry._id" class="infinite-list-item" @click="copy(invokeHistry)">
            {{ getInvokeHisotryTitle(invokeHistry) }}
          </li>
        </ul>
      </div>
    </div>

  </div>

</template>

<script>

import dubboInvokeUtils from "@/utils/dubboInvokeUtils.js";
import dubboInvoke from "@/main/invoker/";
import invokeHisotryRecord from "@/main/repository/invokeHistoryRepository.js";
import registry from "@/main/registry";
import resolveMateData from "@/utils/resolveMateData";
import codeEditor from "@/renderer/components/editor/code-editor.vue";
import Loading from "@/utils/MyLoading";

export default {
  components: {
    codeEditor,
  },
  data() {
    return {
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
    };
  },
  props: {
    registryCenterId: String,
    provider: Object,
  },
  mounted() {
    this.getMataData();

    if (this.provider && this.provider.methods) {
      this.method = this.provider.methods[0];
      this.methodChange();
    }
  },
  methods: {
    async methodChange() {
      // 先刷新列表
      await this.flushInvokeHistoryList();

      if (this.invokeHisotryList && this.invokeHisotryList.length > 0) {
        this.codeConfig.code = this.invokeHisotryList[0].param;
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

      let loadingInstance = Loading.service(this.$t("dubbo.invokePage.invokeProgress"), this.$t("dubbo.invokePage.cancelInvoke"), () => {
        rejectFun(this.$t('dubbo.invokePage.callDubboServiceError'));
      });

      this.$nextTick(() => {
        new Promise((resovle, reject) => {
          rejectFun = reject;
          let response = dubboInvoke.invokeMethod(
            this.provider,
            this.metadata,
            this.method,
            this.codeConfig.code
          );
          resovle(response);
        }).then(response => {
          this.invokeReulst.code = response.code;
          this.invokeReulst.elapsedTime = response.elapsedTime;
          this.$message({
            type: "success",
            message: this.$t('dubbo.invokePage.callDubboServiceSuccess'),
          });
          this.flushInvokeHistoryList();
        }).catch(errorMessage => {
          this.$message({
            type: "error",
            message: errorMessage,
          });
        }).finally(() => {
          loadingInstance.close();
        });

      })



    },
    async generateInvokeCommand() {
      let param = {
        serviceName: `${this.provider.serviceName}`,
        method: this.method,
        params: JSON.parse(this.codeConfig.code),
      };
      this.invokeReulst.code = dubboInvokeUtils.buildInvokeCommand(param);
    },
    copy(invokeHistory) {
      this.codeConfig.code = invokeHistory.param;
    },
    async flushInvokeHistoryList() {
      this.invokeHisotryList = invokeHisotryRecord.findList(this.provider.serviceName, this.method, 1, 50);
    },
    generateParam() {

      //  生成参数
      let code = resolveMateData.generateParam(this.metadata, this.method);
      this.codeConfig.code = code || "[]";
    },
    getMataData() {
      this.metadata = registry.getMetaData(this.provider, this.registryCenterId);
    },
    getInvokeHisotryTitle(invokeHistory) {
      return this.$moment(new Date(invokeHistory.createTime)).format(
        "YYYY-MM-DD HH:mm:ss"
      );
    },
    formatContent() {
      let formatedCode = JSON.stringify(JSON.parse(this.codeConfig.code), null, 2)
      this.codeConfig.code = formatedCode;
    }
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
  margin-left: 5px;
  margin-right: 5px;
}

.invoke-dubbo-dialog-content {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  align-content: space-between;
  height: 70vh;
  overflow: auto;
}

.invoke-dubbo-dialog-content-code {
  width: 75%;
}
.invoke-dubbo-dialog-content-hisotry {
  overflow-y: auto;
  width: 25%;
  padding-left: 10px;
  margin-left: 10px;
  height: 69vh;
}

.el-collapse-item {
  white-space: nowrap;
}

.infinite-list {
  line-height: 20px;
  font-size: 12px;
  font-weight: bold;
  border: 1px solid rgb(248, 245, 245);
  border: 0px;
  list-style: none;
  border-radius: 2px;
}

.infinite-list li {
  display: block;
  width: 100%;
  background: beige;
  margin-top: 5px;
  margin-bottom: 5px;

  border-radius: 2px;
}
.infinite-list li:hover {
  background: #999;
}

.methodSelect {
  width: 100%;
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
</style>