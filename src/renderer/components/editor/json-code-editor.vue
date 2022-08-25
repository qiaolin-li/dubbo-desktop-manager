<template>
  <div>
    <div class="toolbar">
      <div class="toolbar-left">
        <slot name="titel"></slot>
      </div>
      <div class="toolbar-right">
          <slot name="content"></slot>
      </div>
    </div>
    <codemirror
      ref="cm"
      v-model="codeConfig.code"
      :options="cmOptions"
      @input="inputChange"
    ></codemirror>
  </div>
</template>

<script>
// 全局引入vue-codemirror
import { codemirror } from "vue-codemirror";
// 引入css文件
import "codemirror/lib/codemirror.css";
// 引入主题 可以从 codemirror/theme/ 下引入多个
import "codemirror/theme/idea.css";
// 引入语言模式 可以从 codemirror/mode/ 下引入多个
// import "codemirror/mode/sql/sql.js";
import "codemirror/mode/javascript/javascript.js";

// 搜索功能
// find：Ctrl-F (PC), Cmd-F (Mac)
// findNext：Ctrl-G (PC), Cmd-G (Mac)
// findPrev：Shift-Ctrl-G (PC), Shift-Cmd-G (Mac)
// replace：Shift-Ctrl-F (PC), Cmd-Alt-F (Mac)
// replaceAll：Shift-Ctrl-R (PC), Shift-Cmd-Alt-F (Mac)
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/dialog/dialog";
import "codemirror/addon/search/searchcursor";
import "codemirror/addon/search/search";
import "codemirror/addon/search/jump-to-line";
import "codemirror/addon/search/matchesonscrollbar";
import "codemirror/addon/search/match-highlighter";

// 代码提示功能 具体语言可以从 codemirror/addon/hint/ 下引入多个
import "codemirror/addon/hint/show-hint.css";
import "codemirror/addon/hint/show-hint";

import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/json-lint'

 // 引入jsonlint
import jsonlint from "jsonlint";
window.jsonlint = jsonlint;

import 'codemirror/addon/display/autorefresh' //及时自动更新，配置里面也需要设置autoRefresh为true


// 高亮行功能
import "codemirror/addon/selection/active-line";
import "codemirror/addon/selection/selection-pointer";

// 调整scrollbar样式功能
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/scroll/simplescrollbars";

// 自动括号匹配功能
import "codemirror/addon/edit/matchbrackets";

// 全屏功能 由于项目复杂，自带的全屏功能一般不好使
import "codemirror/addon/display/fullscreen.css";
import "codemirror/addon/display/fullscreen";

// 显示自动刷新
import "codemirror/addon/display/autorefresh";

// 多语言支持？
import "codemirror/addon/mode/overlay";
import "codemirror/addon/mode/multiplex";

// 代码段折叠功能
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/foldgutter.css";

import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/fold/xml-fold.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/comment-fold.js";

// merge功能
import "codemirror/addon/merge/merge.css";
import "codemirror/addon/merge/merge";
// google DiffMatchPatch
import DiffMatchPatch from "diff-match-patch";
// DiffMatchPatch config with global
window.diff_match_patch = DiffMatchPatch;
window.DIFF_DELETE = -1;
window.DIFF_INSERT = 1;
window.DIFF_EQUAL = 0;

export default {
  name: "code-editor",
  components: { codemirror },
  data() {
    return {
      // codeConfig: {
      //   code:'select a from table1 where b = 1'
      // },
      cmOptions: {
        // 语言及语法模式
        mode: { name: "javascript", json: true },
        // 主题
        theme: "idea",
        // 显示函数
        line: true,
        lineNumbers: true,
        // 软换行
        lineWrapping: false,
        // tab宽度
        tabSize: 4,
        // 代码提示功能
        hintOptions: {
          // 避免由于提示列表只有一个提示信息时，自动填充
          completeSingle: false,
          // 不同的语言支持从配置中读取自定义配置 sql语言允许配置表和字段信息，用于代码提示
          tables: {
            // "table1": ["c1", "c2"],
          },
        },
        // 高亮行功能
        styleActiveLine: true,
        // 调整scrollbar样式功能
        scrollbarStyle: "overlay",
        // 自动括号匹配功能
        matchBrackets: true,
        foldGutter: true,
        // CodeMirror-lint-markers是实现语法报错功能
        lint: this.lint,
        gutters: [
          "CodeMirror-linenumbers",
          "CodeMirror-foldgutter",
          "CodeMirror-line",
          "CodeMirror-lint-markers"
        ],
        foldOptions: {
          widget: (from, to) => {
            var count = undefined;
            // Get open / close token
            var startToken = "{",
              endToken = "}";
            var prevLine = this.$refs.cm.codemirror.getLine(from.line);
            if (prevLine.lastIndexOf("[") > prevLine.lastIndexOf("{")) {
              (startToken = "["), (endToken = "]");
            }

            // Get json content
            var internal = this.$refs.cm.codemirror.getRange(from, to);
            var toParse = startToken + internal + endToken;

            // Get key count
            try {
              var parsed = JSON.parse(toParse);
              count = Object.keys(parsed).length;
            } catch (e) {}

            return count ? `\u21A4${count}\u21A6` : "\u2194";
          },
        },
      },
    };
  },
  props: {
    codeConfig: Object,
    lint : {
      type: Boolean,
      default: false
    }
  },
  methods: {
    inputChange(content) {
      // this.$nextTick(() => {
        //  this.$refs.cm.codemirror.setValue((JSON.stringify(JSON.parse(content), null, 2)))
      // });
    },
    fullScreen(){
      this.$refs.cm.codemirror.setSize("auto", "auto")
      // this.$refs.cm.codemirror.setOption("fullScreen", true)
    }
  },
  mounted() {
    // 代码提示功能 当用户有输入时，显示提示信息
    this.$refs.cm.codemirror.on("inputRead", (cm) => {
      cm.showHint();
    });
    // this.codeConfig = this.codeConfig1;

    this.$refs.cm.codemirror.on("gutterClick", function (cm, n) {
      var info = cm.lineInfo(n);
      let marks = info.gutterMarkers;
      cm.setGutterMarker(n, "breakpoints", makeMarker());
    });

    function makeMarker() {
      var marker = document.createElement("div");
      marker.style.color = "#822";
      marker.innerHTML = "●";
      return marker;
    }
  },
};
</script>

<style>
.autocomplete-div {
  display: inline-block;
  width: 100%;
}
.autocomplete-name {
  display: inline-block;
}
.autocomplete-hint {
  display: inline-block;
  float: right;
  color: #0088ff;
  margin-left: 1em;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  background-color: rgb(248, 247, 247);
  line-height: 25px;
  padding-left: 10px;
  padding-right: 10px;
}  

.CodeMirror {
  /* border: 1px solid #eee; */
  height: 30vh;
  font-size: 13px;
   line-height : 120%;
}
</style>