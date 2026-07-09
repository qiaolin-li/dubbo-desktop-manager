import { resolve }                                  from 'path'
import { defineConfig, externalizeDepsPlugin }      from 'electron-vite'
import vue                                          from '@vitejs/plugin-vue2'

function monacoMissingSourceMapPlugin() {
  const emptySourceMap = JSON.stringify({
    version: 3,
    sources: [],
    names: [],
    mappings: ''
  })

  return {
    name: 'ddm-monaco-missing-source-map',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.split('?')[0].endsWith('/marked.umd.js.map')) {
          next()
          return
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(emptySourceMap)
      })
    }
  }
}

const alias = [
  {
    find: '@',
    replacement: resolve(process.cwd(), 'src')
  },
  {
    find: 'codemirror',
    replacement: resolve(process.cwd(), 'node_modules/codemirror')
  },
]

export default defineConfig({
  main: {
    esbuild: {
      charset: 'ascii'
    },
    resolve: {
      alias
    },
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      rollupOptions: {
        input: resolve(process.cwd(), 'src/main/background.js'),
        output: {
          entryFileNames: 'background.js'
        }
      }
    }
  },
  preload: {
    esbuild: {
      charset: 'ascii'
    },
    resolve: {
      alias
    },
    plugins: [
      externalizeDepsPlugin()
    ],
    build: {
      rollupOptions: {
        input: resolve(process.cwd(), 'src/main/preload.js'),
        output: {
          entryFileNames: 'preload.js'
        }
      }
    }
  },
  renderer: {
    publicDir: resolve(process.cwd(), 'public'),
    server: {
      sourcemapIgnoreList(sourcePath) {
        return sourcePath.includes('node_modules')
      }
    },
    resolve: {
      alias:[
        ...alias,
        {
          find: 'vue',
          replacement: 'vue/dist/vue.esm.js',
        }
      ]
    },
    plugins: [
      vue(),
      monacoMissingSourceMapPlugin(),
    ],
    optimizeDeps: {
      // exclude: ['monaco-editor'],
      include: [
        'vue',
        'vue-router',
        'pinia',
        'axios',
        'element-plus/es',
        'lodash-es',
        'monaco-editor/esm/vs/editor/editor.api', 
        'monaco-editor'
        // 把你项目里用到的包都加进来
      ]
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(process.cwd(), 'src/renderer/index.html'),
          jsonEditor: resolve(process.cwd(), 'src/renderer/json-editor.html')
        }
      }
    }
  }
})
