
// 生成 RSS 订阅源
const rss = require("@11ty/eleventy-plugin-rss");
const dayjs = require('dayjs')
const modern = require('eleventy-plugin-modern')
const toc = require('markdown-it-toc-done-right')
module.exports = config => {
  config.addPlugin(modern({
    markdownIt(md) {
      md.use(toc)
    }
  }))
  // 添加 eleventy-plugin-rss 插件
  config.addPlugin(rss)
  // 将 _redirects 文件复制到输出目录，用于重定向
  config.addPassthroughCopy("_redirects");
  // 将 favicon.ico 文件复制到输出目录，用于网页 ico
  config.addPassthroughCopy("favicon.ico");
  //  添加了一个短代码 "date"，以便在模板中格式化日期
  config.addShortcode("date", (content) => {
    return dayjs(content).format('YYYY/MM/DD')
  })
  return {
    markdownTemplateEngine: false
  };
}