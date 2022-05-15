<template>
  <div class="invoke-dubbo-dialog">
    <div class="invoke-dubbo-dialog-interface-info">
      <el-descriptions class="margin-top" :column="3" size="mini" border>
        <el-descriptions-item span="3">
          <template slot="label"> 接口 </template>
          {{ provider.serviceName }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"> 应用 </template>
          {{ provider.application }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> 地址 </template>
          {{ provider.address }}
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"> 泛化 </template>
          {{ provider.generic }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> 版本 </template>
          {{ provider.version }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> Dubbo </template>
          {{ provider.dubboVersion }}
        </el-descriptions-item>

        <el-descriptions-item>
          <template slot="label"> Jar </template>
          {{ provider.revision }}
        </el-descriptions-item>

        <el-descriptions-item span="2">
          <template slot="label"> 方法 </template>
          <el-select v-model="method" @change="methodChange" class="methodSelect">
            <el-option v-for="item in provider.methods" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-descriptions-item>
        <el-descriptions-item>
          <template slot="label"> 操作 </template>
          <!-- <button @click="invokeDubbo()">调用Dubbo接口</button>
          <button @click="generateParam()">生成默认参数</button>
          <button @click="generateInvokeCommand()">生成invoke命令</button> -->

          <el-button-group>
            <el-button plain type="primary" icon="el-icon-thumb" @click="invokeDubbo()">调用</el-button>
            <el-button plain type="primary" icon="el-icon-news" @click="generateParam()">生成参数</el-button>
            <el-button plain type="primary" icon="el-icon-magic-stick" @click="generateInvokeCommand()">生成命令</el-button>
          </el-button-group>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="invoke-dubbo-dialog-content">
      <div class="invoke-dubbo-dialog-content-code">
        <div class="contentCode">

          <codeEditor :codeConfig="codeConfig">
            <template v-slot:titel>
              请求参数：
              <el-popover placement="top-start" title="参数生成策略" width="200" trigger="hover" content="首先会使用上次调用成功的历史参数，如果没有，会尝试生成参数">
                <i slot="reference" class="el-icon-info"></i>
              </el-popover>
            </template>
            <template v-slot:content>

              <el-tooltip class="item" effect="light" content="格式化" placement="top-start">
                <i class="el-icon-lollipop" @click="formatContent"></i>
              </el-tooltip>
            </template>
          </codeEditor>
        </div>

        <div class="contentCode">
          <codeEditor :codeConfig="invokeReulst">
            <template v-slot:titel>
              响应信息：{{ invokeReulst.elapsedTime }}
            </template>
          </codeEditor>
        </div>
      </div>

      <div class="invoke-dubbo-dialog-content-hisotry">
        历史调用参数（{{ invokeHisotryList.length }}）

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
import codeEditor from "../../components/code-editor.vue";

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
    connectInfo: Object,
    provider: Object,
  },
  mounted() {
    if (this.provider && this.provider.methods) {
      this.method = this.provider.methods[0];
      this.methodChange();
    }
  },
  watch: {
    provider: {
      deep: true,
      // eslint-disable-next-line no-unused-vars
      handler(provider, oldProvider) {
        this.method = this.provider.methods[0];
        if (provider && provider.methods) {
          this.methodChange();
        }
      },
    },
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
        message: "调用dubbo接口成功!",
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
      registry.getMethodFillObject(this.provider, this.connectInfo, this.method)
        .then((code) => {
          this.codeConfig.code = code || "[]";
        }).catch((error) => {
          this.$message({
            message: `无法生成参数！原因：${error}`,
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
.invoke-dubbo-dialog {
  height: 80vh;
  overflow-y: auto;
}

.invoke-dubbo-dialog-content {
  margin-top: 10px;
  border: rgb(230, 233, 243) 1px solid;
  display: flex;
  flex-direction: row;
  align-content: space-between;
  height: 55vh;
  overflow: auto;
}

.invoke-dubbo-dialog-content-code {
  overflow-y: auto;
  width: 75%;
}
.invoke-dubbo-dialog-content-hisotry {
  border-left: rgb(230, 233, 243) 1px solid;
  overflow-y: auto;
  width: 20%;
  height: 100%;
  padding-left: 5px;
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
</style>