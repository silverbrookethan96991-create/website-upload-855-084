静态电影网站使用说明

生成结果：
- 首页：index.html
- 分类总览：categories.html
- 排行榜：ranking.html
- 搜索页：search.html
- 影片详情页：movie/movie-0001.html 到 movie/movie-2000.html
- 影片总数：2000 部

分类数量：
- 国产热门: 266 部
- 动作冒险: 265 部
- 悬疑惊悚: 265 部
- 爱情喜剧: 265 部
- 科幻奇幻: 264 部
- 剧集连载: 265 部
- 综艺纪实: 146 部
- 全球佳片: 264 部

封面图片：
页面已经按要求引用网站根目录下的 1.jpg 到 150.jpg。部署时请把对应图片放在 index.html 同级目录。

播放器：
详情页使用影片页 video 标签绑定 m3u8 播放源，并通过 assets/app.js 初始化 HLS。Chrome、Edge 等浏览器会调用 Hls.js CDN；Safari 会优先使用原生 HLS。

部署方式：
将 ZIP 解压到服务器目录即可访问。所有 HTML 页面都已经写入百度统计脚本。
