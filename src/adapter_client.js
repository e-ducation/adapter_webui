// init ClipboardJS
new ClipboardJS('#token');
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('adapter_token');

// pubsub topics: https://github.com/CodeLabClub/codelab_adapter_client_python/blob/master/codelab_adapter_client/topic.py

const map = {
  extension_arduino_uno: 'Arduino UNO',
  extension_jupyterlab: '',
  extension_microbit_radio: 'micro:bit radio',
  extension_NetworkZero: 'NetworkZero',
  extension_python: 'Python',
  extension_simple_pyboard: 'Simple Pyboard',
  extension_Siri: 'Siri',
  extension_stage: '',
  extension_uart_adapter: 'UART Adapter',
  extension_usb_microbit: 'USB micro:bit',
  extension_webserver: '',
  extension_webUI_manager: '',
  extension_wechat: '微信',
  extension_Yanshee: 'Yanshee',
  node_adapterMario: 'LEGO Mario',
  node_alphamini: '悟空机器人',
  node_brainCo: 'BrainCo Focus 一代',
  node_cozmo: '人工智能机器人 Cozmo',
  node_digimon: '',
  node_HCI: 'HCI',
  node_minecraft: '我的世界',
  node_motionSensor_gesture: '',
  node_motionSensor_proximity: 'Motion Sensor Kit',
  node_overdrive: 'Anki Overdrive 赛车',
  node_overdrive2: 'Anki Overdrive 赛车 Ⅱ',
  node_physical_blocks2: 'Dynamic Table 2.0',
  node_raspberrypi: '',
  node_RoboMasterEP2: '机甲大师 EP 2.0',
  node_sonicPi: '',
  node_spheroRVR: 'Sphero RVR（乐福编程机器人）',
  node_status_bar_mac: '',
  node_status_bar_win: '',
  node_tello3: '大疆教育无人机 第 3 版',
  node_vector: '人工智能机器人 Vector',
  node_yeelight: ''
};

Vue.use(VueMarkdown);

const extensions_bar = new Vue({
  el: '#app',
  data: {
    activeName: 'first', //tab page
    token: token,
    logs: [],
    status: 'disconnected', // from adapter， connected
    version: '', // from adapter
    exts_statu: {},
    nodes_statu: {},
    // all_statu: {},
    //checkedExtensions: [],
    //extensions: ["extension_eim", "extension_eim2"],
    // https://scratch.codelab.club/projects/editor?adapter_token=${token}
    links: {
      // "CodeLab Scratch": `https://scratch-beta.codelab.club?adapter_token=${token}`, // todo adapter_host, 根据 URL判断
    },
    showMenu: false,
    dialogTableVisible: false,
    dialogFormVisible: false,
    form: {
      plugin_url: '',
      select_url: ''
    },
    extensionListLength: 0,
    formLabelWidth: '120px',
    isCollapse: false,
    allNameFilter: '',
    allFilter: undefined,
    extensinFilter: undefined,
    extNameFilter: '',
    nodeFilter: undefined,
    nodeNameFilter: '',
    languanges: window.language,
    currentLanguage: localStorage.getItem('adapterLanguage') || 'zh-cn',
    // showTypeToggle: true, // true: ext; false: node
    showTypeToggle: 1, // 1:Adapter 设置,2:查看环境信息,3:关于 Adapter,4:扩展启用状态
    extCurrentPage: 1,
    nodeCurrentPage: 1,
    allCurrentPage: 1,
    extPageSize: 10,
    nodePageSize: 10,
    allPageSize: 10,
    map: map,
    autoStart: false,
    autoUpdate: false,
    defaultMenu: '1-1',
    isShowPassword: true,
    passwordDialog: false,
    ruleForm: {
      pass: '',
      manager: false
    },
    envData: null,
    pwdError: '',
    ip: ''
  },
  computed: {
    language() {
      localStorage.setItem('adapterLanguage', this.currentLanguage);
      if (this.currentLanguage === 'en') {
        ELEMENT.locale(ELEMENT.lang.en);
      } else {
        ELEMENT.locale(ELEMENT.lang.zhCN);
      }
      return this.languanges[this.currentLanguage];
    },
    filtedExtsLenght() {
      let filtedObj = {};
      Object.keys(this.exts_statu).forEach(key => {
        if (this.extensinFilter === undefined) {
          if (!this.extNameFilter || key.includes(this.extNameFilter)) {
            filtedObj[key] = this.exts_statu[key];
          }
        } else {
          if (this.exts_statu[key].is_running === this.extensinFilter) {
            if (!this.extNameFilter || key.includes(this.extNameFilter)) {
              filtedObj[key] = this.exts_statu[key];
            }
          }
        }
      });
      return Object.keys(filtedObj).length;
    },
    filtedExts() {
      let filtedObj = {};
      Object.keys(this.exts_statu)
        .slice(
          (this.extCurrentPage - 1) * this.extPageSize,
          this.extCurrentPage * this.extPageSize
        )
        .forEach(key => {
          if (this.extensinFilter === undefined) {
            if (!this.extNameFilter || key.includes(this.extNameFilter)) {
              filtedObj[key] = this.exts_statu[key];
            }
          } else {
            if (this.exts_statu[key].is_running === this.extensinFilter) {
              if (!this.extNameFilter || key.includes(this.extNameFilter)) {
                filtedObj[key] = this.exts_statu[key];
              }
            }
          }
        });
      console.log('filtedExt', filtedObj);
      return filtedObj;
    },
    filtedNodesLength() {
      let filtedObj = {};
      Object.keys(this.nodes_statu).forEach(key => {
        if (this.nodeFilter === undefined) {
          if (!this.nodeNameFilter || key.includes(this.nodeNameFilter)) {
            filtedObj[key] = this.nodes_statu[key];
          }
        } else {
          if (this.nodes_statu[key].is_running === this.nodeFilter) {
            if (!this.nodeNameFilter || key.includes(this.nodeNameFilter)) {
              filtedObj[key] = this.nodes_statu[key];
            }
          }
        }
      });
      return Object.keys(filtedObj).length;
    },
    filtedNodes() {
      let filtedObj = {};
      Object.keys(this.nodes_statu)
        .slice(
          (this.nodeCurrentPage - 1) * this.nodePageSize,
          this.nodeCurrentPage * this.nodePageSize
        )
        .forEach(key => {
          if (this.nodeFilter === undefined) {
            if (!this.nodeNameFilter || key.includes(this.nodeNameFilter)) {
              filtedObj[key] = this.nodes_statu[key];
            }
          } else {
            if (this.nodes_statu[key].is_running === this.nodeFilter) {
              if (!this.nodeNameFilter || key.includes(this.nodeNameFilter)) {
                filtedObj[key] = this.nodes_statu[key];
              }
            }
          }
        });
      console.log('filtedNode', filtedObj);
      return filtedObj;
    },
    // extensionListLength() {
    //   let result = {}
    //   Object.keys(this.all_statu).forEach((key) => {
    //     if (this.nodeFilter === undefined) {
    //       if (!this.nodeNameFilter || key.includes(this.nodeNameFilter)) {
    //         result[key] = this.all_statu[key]
    //       }
    //     } else {
    //       if (this.nodes_statu[key].is_running === this.nodeFilter) {
    //         if (!this.nodeNameFilter || key.includes(this.nodeNameFilter)) {
    //           result[key] = this.all_statu[key]
    //         }
    //       }
    //     }
    //   })
    //   return Object.keys(result).length
    // },
    extensionList() {
      let result = {};
      let keys = [];
      let all_statu = { ...this.exts_statu, ...this.nodes_statu };
      Object.keys(all_statu).forEach(key => {
        if (this.allFilter === undefined) {
          if (
            !this.allNameFilter ||
            this.map[key]?.includes(this.allNameFilter) ||
            key.includes(this.allNameFilter)
          ) {
            keys.push(key);
          }
        } else {
          if (this.all_statu[key].is_running === this.allFilter) {
            if (
              !this.allNameFilter ||
              this.map[key]?.includes(this.allNameFilter) ||
              key.includes(this.allNameFilter)
            ) {
              keys.push(key);
            }
          }
        }
      });

      if (this.allNameFilter) {
        this.allCurrentPage = 1;
      }
      this.extensionListLength = keys.length;
      keys = keys.slice(
        (this.allCurrentPage - 1) * this.allPageSize,
        this.allCurrentPage * this.allPageSize
      );
      for (let key of keys) {
        result[key] = this.all_statu[key];
      }

      return result;
    },
    all_statu() {
      return { ...this.exts_statu, ...this.nodes_statu };
    }
  },
  methods: {
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    },
    blur(event) {
      //失焦
      console.log('blur');
    },
    handleClick(val) {
      console.log('clicked:', val);
      this.adapter_client.menu_action(val);
    },
    exit_adapter_app() {
      this.adapter_client.exit_adapter_app();
    },
    handleSelect(item) {
      // 填充内容

      console.log('select extension name', item.value);
      this.form.plugin_url = item.url;
      console.log('select extension url', item.url);
    },
    createFilter(queryString) {
      return extenion => {
        let isinclude = extenion.value
          .toLowerCase()
          .includes(queryString.toLowerCase());
        return isinclude;
      };
    },
    querySearch(queryString, cb) {
      let community_plugins = this.community_plugins;
      // console.log("querySearch: ", this.community_plugins)
      let results = queryString
        ? community_plugins.filter(this.createFilter(queryString))
        : community_plugins;
      console.log('querySearch filter: ', results);
      // 调用 callback 返回建议列表的数据
      cb(results);
    },
    plugin_download: function () {
      //url match github...
      // 区分手动输入和选择
      let plugin_url;
      plugin_url = this.form.plugin_url;

      console.log('download', plugin_url);
      let is_url_valid = false;
      console.log('download plugin:', plugin_url);
      // extension, 预加载 考虑安全
      let whitelist = [
        'https://github.com/CodeLabClub/codelab_adapter_extensions',
        'https://raw.githubusercontent.com/CodeLabClub/codelab_adapter_extensions',
        'https://adapter.codelab.club',
        'http://adapter.codelab.club'
      ];

      whitelist.forEach(function (item, index, array) {
        // extension 需要在白名单里
        if (
          (plugin_url.startsWith(item) && plugin_url.includes('extension_')) ||
          plugin_url.includes('node_')
        ) {
          is_url_valid = true;
        }
      });
      if (is_url_valid) {
        // begin to download，todo 放在client里
        this.adapter_client.download(plugin_url);
        this.dialogFormVisible = false;
        this.form.plugin_url = '';
        return;
      } else {
        // todo notify 有换行问题，在python做好换行
        let notify_message =
          'Please download extension from https://github.com/CodeLabClub/codelab_adapter_extensions or https://adapter.codelab.club/extensions_nodes_mirrors/';
        if (plugin_url.includes('extension_')) {
          this.$message({
            // showClose: true,
            message: notify_message,
            type: 'warning' // warning
          });
        }
      }
    },
    check: function (state, node, pluginType) {
      // console.log(`${e.target.value} ${e.target.checked}`);
      if (this.status !== 'connected!') {
        console.log('connected:', this.status);
        return;
      } // 不继续， todo 条件不满足，不切换
      console.log(`${node} ${state}`);
      const node_name = node;
      let turn;
      if (state === true) {
        turn = 'start';
        console.log('start');
      } else {
        turn = 'stop';
        console.log('stop');
      }
      this.adapter_client.operate_node_extension(turn, node_name, pluginType);
    },
    //
    // 开机自动启动、自动更新扩展
    handlerSwitch(event, type) {
      console.log(`handlerSwitch:`, event, type);
    },

    // 在软件启动自检里做
    update_adapter_status(content) {
      let adapter_version = content.version;
      this.version = adapter_version;
      // todo
      /*
            console.log(`webui_version -> ${this.adapter_client.webui_version}; adapter_version:${adapter_version}`);
            if (this.adapter_client.webui_version === void(0) || adapter_version > this.adapter_client.webui_version){
                console.warn("webui_version is old version!")
                this.$notify({type:"warning",message:"Web UI 版本太低，5秒后将自动更新, 完成后需要重新运行"})
                setTimeout(() => {
                    this.adapter_client.menu_action('extensions_update');
                }, 5000);
            }
            */
      // 如果 webui_version 更低，则自动更新插件
    },
    error_message_callback(error_message) {
      this.$message(error_message);
    },
    notify_callback(notify_message) {
      this.$notify(notify_message);
    },
    update_nodes_status(nodes_status) {
      this.exts_statu = nodes_status['exts_status_and_info'];
      this.nodes_statu = nodes_status['node_status_and_info'];
      this.$loading().close();
    },
    onConnect() {
      this.status = 'connected!';
    },
    onDisconnect(reason) {
      window.close();
      alert('已退出 (exited)');
      this.status = `disconnect! ${reason}`;
      let notify_message = {
        message: `disconnect! ${reason}`,
        type: 'error' // warning
      };
      this.$notify(notify_message);
      this.$loading({ fullscreen: true });
      // alert("请重启()")
      //setTimeout(() => {
      //}, 500);
    },
    onMessage(msg) {
      console.log('message to app...');
    },
    onAdapterPluginMessage(msg) {
      console.log('message to app...');
    },
    node_statu_change_callback(extension_node_name, content) {
      const status_checked_map = { start: true, stop: false };
      if (extension_node_name.startsWith('extension_') || extension_node_name.startsWith('node_')) {
        this.exts_statu[extension_node_name]['is_running'] =
          status_checked_map[content];
        console.log(`extension statu change to ${content}`);
      }
      // if (extension_node_name.startsWith('node_')) {
        // this.nodes_statu[extension_node_name]['is_running'] =
          // status_checked_map[content];
        // console.log(`node statu change to ${content}`);
      // }
    },
    selectMenuItem(key, keyPath) {
      console.log(`selectMenuItem:`, key, keyPath);
      this.defaultMenu = key;

      /**
       * 1、进入任意「开发者选项」下的页面时，弹出密码认证提示框，认证成功后，直到重新启动 Adapter，都可以无需输入密码进入任意「开发者选项」下的页面。
        2、勾选「我是管理员..."后，本机之后都不需要输入密码，即可进入任意「开发者选项」下的页面。
       */
      if (keyPath[0] === '2') {
        if (
          sessionStorage.getItem('isCertified') ||
          localStorage.getItem('checkAdmin')
        ) {
          // 如果已认证 || 勾选过管理员，无需弹出密码框
          this.handlerCertied(key);
        } else {
          this.passwordDialog = true;
        }
      }
    },
    handlerCertied(key) {
      switch (key) {
        case '2-1':
          this.showTypeToggle = 4;
          break;
        case '2-2':
          this.dialogFormVisible = true;
          break;
        case '2-3':
          this.handleClick('open_user_dir');
          break;
        default:
          break;
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          axios
            .post(
              'https://api.aimaker.space/api/v1/adapter/check_password/',
              { password: this.ruleForm.pass }
            )
            .then(response => {
              if (response.data.success) {
                sessionStorage.setItem('isCertified', true);
                if (this.ruleForm.manager) {
                  localStorage.setItem('checkAdmin', true);
                }
                this.passwordDialog = false;
                this.handlerCertied(this.defaultMenu);
                this.ruleForm = {
                  pass: '',
                  manager: false
                };
              } else if (!response.data.success && response.data.message) {
                this.pwdError = '';
                setTimeout(() => {
                  this.pwdError = response.data.message;
                }, 200);
              }
            })
            .catch(error => {
              console.log('error====', error);
            });
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    goBack() {
      this.passwordDialog = false;
      this.showTypeToggle = 1;
      this.defaultMenu = '1-1';
      this.ruleForm = {
        pass: '',
        manager: false
      };
      this.pwdError = '';
    },
    handlerEev() {
      this.showTypeToggle = 2;
    }
  },
  created: function () {
    // init
    this.adapter_client = new AdapterBaseClient(
      // 传递到内部，修改
      this.onConnect,
      this.onDisconnect,
      this.onMessage,
      this.onAdapterPluginMessage,
      this.update_nodes_status,
      this.node_statu_change_callback,
      this.notify_callback,
      this.error_message_callback,
      this.update_adapter_status
    );
    window.adapter_client = this.adapter_client; // 方便做实验， linda: await adapter_client.linda_out([1,2,3]);  await adapter_client.linda_dump(["dump"])
  },
  mounted() {
    //timestamp
    let timestamp = new Date().getTime();
    axios
      .get(
        `https://adapter.codelab.club/extensions_nodes_mirrors/extensions_nodes.json?timestamp=${timestamp}`
      )
      .then(response => {
        // console.log('market extenions:', response.data.extensions)
        // console.log('market nodes:', response.data.nodes)
        this.community_plugins = response.data.extensions.concat(
          response.data.nodes
        ); // //fetch Community extension
      })
      .catch(error => {
        console.log(error);
        this.errored = true;
      });
    this.$nextTick(() => {
      console.log(this.all_statu);
    });

    axios
      .get(
        `https://codelab-adapter.codelab.club:12358/env?adapter_token=${token}`
      )
      .then(response => {
        let objStr = JSON.stringify(response.data, null, 4);
        this.envData = objStr;
        this.ip = response.data.connect_info.ip;
      })
      .catch(error => {
        console.log('error====', error);
      });
  }
});
