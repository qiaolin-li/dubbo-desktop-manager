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
            <el-tooltip class="item" effect="dark" :content="$t('dubbo.invokePage.call')" placement="top">
              <el-button plain type="primary" icon="el-icon-thumb" @click="invokeDubbo()"></el-button>

            </el-tooltip>
            <el-tooltip class="item" effect="dark" :content="$t('dubbo.invokePage.generateParam')" placement="top">

              <el-button plain type="primary" icon="el-icon-news" @click="generateParam()"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" :content="$t('dubbo.invokePage.generateCommand')" placement="top">
              <el-button plain type="primary" icon="el-icon-magic-stick" @click="generateInvokeCommand()"></el-button>

            </el-tooltip>
          </el-button-group>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="invoke-dubbo-dialog-content ">
      <div class="invoke-dubbo-dialog-content-code">
        <div class="contentCode broder">

          <codeEditor :codeConfig="codeConfig">
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
import invokeHisotryRecord from "@/core/repository/invokeHistoryRepository.js";
import registry from "@/core/registry";
import codeEditor from "@/components/editor/code-editor.vue";

export default {
  components: {
    codeEditor,
  },
  data() {
    return {
      codeConfig: {
        code: "[]",
      },
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
      let response = await dubboInvokeUtils.invokeMethod(
        this.provider,
        this.method,
        this.codeConfig.code
      );
      this.invokeReulst.code = response.code;
      this.invokeReulst.elapsedTime = response.elapsedTime;

      // 保存调用记录
      let invokeHistory = {
        serviceName: this.provider.serviceName,
        method: this.method,
        param: this.codeConfig.code,
      };
      await invokeHisotryRecord.save(invokeHistory);
      this.$message({
        type: "success",
        message: this.$t('dubbo.invokePage.callDubboServiceSuccess'),
      });
      this.flushInvokeHistoryList();
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
      this.invokeHisotryList = await invokeHisotryRecord.findList(this.provider.serviceName, this.method, 1, 50);
    },
    generateParam() {
      // 生成参数
      registry.getMethodFillObject(this.provider, this.registryCenterId, this.method)
        .then((code) => {
          this.codeConfig.code = code || "[]";
        }).catch((error) => {
          this.$message({
            message: this.$t('dubbo.invokePage.generateParamError'),
            type: 'warning'
          });
          this.codeConfig.code = "[]";
        });
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
</style>