<div align="center">
	<h1>A-Soul 浏览器宠物</h1>
    <em>A-Soul Browser Pet</em>
    <p>在浏览器里养一只A-Soul成员当宠物</p>
    <a href="https://github.com/ZiuChen/A-Soul-Browser-Pet"><img src="https://img.shields.io/badge/Github-black?logo=github"></img></a>
<a href="https://gitee.com/ziuc/A-Soul-Browser-Pet"><img src="https://img.shields.io/static/v1?label=Gitee&message=%E9%95%9C%E5%83%8F&color=c71d23&style=flat-square&logo=gitee&logoColor=c71d23"></img></a>
<img src="https://img.shields.io/static/v1?label=Vue.js&message=v3.2&color=4FC08D&style=flat-square&logo=vue.js&logoColor=ffffff"></img>
<img src="https://img.shields.io/badge/%20License-MIT-yellow?style=flat-square&labelColor=black"></img>
    <img src="https://cdn.jsdelivr.net/gh/ZiuChen/A-Soul-Browser-Pet@bili_version/docs/images/image0.png" width="80%" />
</div>

## 🔰 安装方式

> 此扩展为“稀土掘金2022编程挑战赛”比赛作品
>
> 后续开发将集中在bili_version分支，main分支不再做任何修改。

| 浏览器版本 | 拓展版本 | 安装方式              | 可用性 |
| :--------: | :------: | :-------------------- | :----: |
|   Chrome   | `0.0.4`  | `.zip`                |   ✅    |
|    Edge    | `0.0.4`  | `官方应用商店` `.zip` |   ✅    |
|  FireFox   | `0.0.4`  | `官方应用商店`        |   ✅    |
| 其他浏览器 |   `/`    | `/`                   |  `/`   |

Chrome 浏览器：

1. 进入**设置/扩展程序**
2. 启用右上角 **“开发者模式”**
3. 点击 **“加载已解压的扩展程序”**，选择项目下的src目录

安装详细步骤：[安装方式](./docs/INSTALLATION.md)

## 🏓 使用说明

打开任意网页，即可看到一只可爱小然出现在你的页面上。

> 她能陪你一起读文献、刷视频、看直播，还能够与你互动，帮你收集语料，提醒你按时休息。

<img src="https://cdn.jsdelivr.net/gh/ZiuChen/A-Soul-Browser-Pet@bili_version/docs/images/image1.png" width="80%" />

#### 互动方式：

* **拖拽**：小然会跟随鼠标改变位置并变换表情；
* **点击**：小然会变换不同的表情，并且弹出随机预设语句；
* **跟随鼠标**：小然会不断跟随鼠标位置；
* **跟随点击**：小然会追逐最近点击鼠标的位置；

#### 附加功能：

* **拖拽收藏**：将链接/图片/选中文字拖拽到小然身上，她会为你保存起来；
* **管理收藏**: 点击拓展按钮，可以在弹出页内打开/复制/删除收藏内容；

#### 自定义配置：

除了小然，还有其他四位A-Soul成员可以配置，点击扩展按钮，在弹出框中进行配置。

<img src="https://cdn.jsdelivr.net/gh/ZiuChen/A-Soul-Browser-Pet@bili_version/docs/images/image2.png" width="80%" />

* **诱饵**：每位成员都对应着不同的诱饵，会在点击鼠标后展示； *（可能会影响正常点击）*
* **收藏**：开启后，可以使用拖拽收藏功能；
* **速度**：成员追踪鼠标/追踪点击位置时的速度；

## 🚚 开发相关

#### 技术栈与开发周期：

项目使用 *Vue* + *jQuery* + *MDUI* + *Anime.js* 完成，*Vue* 用于构建弹窗界面，*jQuery* 用于替代原生 DOM 操作，更方便的操作元素属性、添加与解除监听器；*MDUI* 用于构建弹窗配置页的样式， *Anime.js* 用于辅助实现人物角色动作的过渡动画。

#### 项目结构：

```text
src
 ├── background.js    // service_worker脚本
 ├── css              // 存储样式文件
 ├── index.js         // 注入页面的content_scripts脚本
 ├── lib              // 依赖的外部库
 ├── manifest.json    // Chrome 扩展的描述文件
 ├── popup.html       // 弹窗页的.html文件
 ├── popup.js         // 弹窗页的.js文件
 └── static           // 存储静态文件如图片、图标等
```