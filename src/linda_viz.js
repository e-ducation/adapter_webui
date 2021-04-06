// todo 模块化， vue 有利于面向对象，因为dom可编程
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("adapter_token");
// console.debug(token) // ok
// 来自websocket 的linda消息要不要验证？
let NODE_ID = "linda/js/client";
let HELP_URL = "https://adapter.codelab.club/user_guide/Linda/";
let runtime = null;
let adapter_client = new AdapterBaseClient(NODE_ID, HELP_URL, runtime);

let app = new Vue({
    el: '#app',
    data: {
      dump_data: '',
      status_data: '', 
      auto_dump: false,
      auto_status: false,
    },
    methods: {
      dump: function () {
        adapter_client.linda_dump().then((data)=>{console.log("dump",data); this.dump_data = data})
        // this.message = this.message.split('').reverse().join('')
      },
      status: function () {
        adapter_client.linda_status().then((data)=>{console.log("status",data); this.status_data = data})
        // this.message = this.message.split('').reverse().join('')
      },
    },
    created: function(){
        const INTERVAL = 200; //0.2s
        setInterval(()=>{ if (this.auto_dump){
            adapter_client.linda_dump().then((data)=>{console.log("linda",data); this.dump_data = data})
        } }, INTERVAL); 

        setInterval(()=>{ if (this.auto_status){
            adapter_client.linda_status().then((data)=>{console.log("linda",data); this.status_data = data})
        } }, INTERVAL)
    }
  })
  
  