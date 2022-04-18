<div align="center">
	<h1>A-Soul 浏览器宠物</h1>
    <em>A-Soul Browser Pet</em>
    <p>在浏览器里养一只A-Soul成员当宠物。</p>
    <img src="./images/image0.jpg" width="80%" />
</div>

## 🔰 安装方法

Chrome 浏览器：

1. 进入**设置/扩展程序**
2. 启用右上角**“开发者模式” **
3. 点击**“加载已解压的扩展程序”**，选择项目文件夹

## 🏓 使用方法

打开任意网页，即可看到一只可爱小然出现在你的页面上。

<img src="./images/image1.jpg" width="80%" />

#### 支持的互动方式：

* **拖拽**：小然会跟随鼠标改变位置并变换表情
* **点击**：小然会变换不同的表情
* **跟随鼠标**：小然会不断跟随鼠标位置
* **跟随点击**：小然会追逐最近点击鼠标的位置

#### 支持修改的配置：

除了小然，还有其他四位A-Soul成员可以配置，点击扩展按钮，在弹出框中进行配置。

<img src="./images/image2.jpg" width="80%" />

* **生成诱饵**：每位成员都对应着不同的诱饵，会在点击鼠标后展示 *（可能会影响正常点击）*
* **固定方式**：每位成员的位置相对页面固定/相对浏览器窗口定位
* **速度**：每位成员追踪鼠标/追踪点击位置时的速度

#### 附加功能：

* **整点报时**：小然会在每个整点为你报时（后续迭代）
* **成员语录**：点击成员后弹出成员经典语录（后续迭代）

## 🚚 开发相关

#### 项目技术栈：

项目使用 jQuery + MDUI 完成，jQuery用于替代原生 DOM 操作，更方便的操作元素属性、添加与解除监听器；MDUI用于构建弹窗配置页的界面。

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
 └── static           // 存储静态文件如图片、图标
```

#### 测试用例：

测试环境：Google Chrome 100.0.4896.88 (正式版本) （64 位）

针对部分网页场景，挑选了以下网站运行测试，拓展能够完整并且正确运行：

* [掘金首页](https://juejin.cn/)
* [掘金个人主页](https://juejin.cn/user/4420463502826087)
* [比赛官网](https://hackathon2022.juejin.cn/)

## 🔗 相关链接

[Github 主页 ](https://github.com/ZiuChen) [CSDN 博客](https://blog.csdn.net/Huuc6)  [掘金主页](https://juejin.cn/user/4420463502826087)