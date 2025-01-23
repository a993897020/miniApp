/*
 * @Author: 关振俊
 * @Date: 2023-03-24 17:21:36
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-17 09:37:04
 * @Description: 
 * process.argv 获取命令行
 * TODO:做一个启动列表，选择选项运行指定端 √
 * TODO:判断当前node版本是否符合该项目，不符合设置该项目指定node版本，在执行启动程序 √
 * TODO:根据执行项目的使用率进行排序启动列表 √
 */
// eslint-disable-next-line import/no-commonjs
const childProcess = require('child_process')
const {
  select
  // eslint-disable-next-line import/no-commonjs
} = require("@inquirer/prompts")
// eslint-disable-next-line import/no-commonjs
const path = require('path')
// eslint-disable-next-line import/no-commonjs
const fs = require('fs')
// console.log(process)


const nodeVersion = parseFloat(process.versions.node)
const minVersion = 14.15
const hasNodeVersion = '14.'
// console.log(typeof nodeVersion, { nodeVersion, childProcess })
// console.log(`当前node版本号${process.versions.node}`)

// 获取文件路径
const curFilePath = path.join(__dirname, '/appList.json')
// 获取启动列表数据(json返回)
const jsonList = JSON.parse(fs.readFileSync(curFilePath, 'utf-8'))
// 根据使用率进行升序启动列表
const formatAppList = () => jsonList.list.sort((a, b) => b.useCount - a.useCount)
// 修改程序的使用率，为根据使用率进行排序启动列表
const updateAppUseCount = (system) => {
  jsonList.list.forEach(p => p.value === system ? p.useCount += 1 : p.useCount)
  fs.writeFileSync(curFilePath, JSON.stringify(jsonList, null, 4))
}
try {
  const runApp = async () => {
    const answer = await select({
      message: '请选择你要启动的程序',
      default: 0,
      choices: formatAppList(),
    });
    if (nodeVersion < minVersion) {
      console.log(`当前node版本号${process.versions.node}过低`);
      console.log(`正在帮您切换node版本v${hasNodeVersion}`);
      childProcess.execSync(`nvm use ${hasNodeVersion}`, {
        stdio: 'inherit'
      })
    }
    childProcess.execSync(`npm run dev:${answer}`, {
      stdio: 'inherit'
    })
    updateAppUseCount(answer)
    process.exit(0)
  }

  process.on('uncaughtException', (error) => {
    console.log({
      error
    });
    if (error instanceof Error && error.name === 'ExitPromptError') {
      console.log('👋 until next time!');
    } else {
      // Rethrow unknown errors
      // process.exit(0)
      throw error;
    }
  });

  runApp()

} catch (error) {
  console.log({
    error
  });

  if (error instanceof Error && error.name === 'ExitPromptError') {
    // noop; silence this error
  } else {
    // process.exit(0)
    throw error;
  }
}
