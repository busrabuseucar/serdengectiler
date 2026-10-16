import {defineConfig} from "playwright/test";
export default defineConfig({
 testDir:"./e2e",use:{baseURL:"http://127.0.0.1:5174"},
 webServer:{command:"python3 -m http.server 5174 --bind 127.0.0.1",url:"http://127.0.0.1:5174"},
 projects:[{name:"desktop",use:{viewport:{width:1280,height:900}}},{name:"mobile",use:{viewport:{width:390,height:844}}}]
});
