/*
 * @Author: 关振俊
 * @Date: 2025-01-17 10:53:38
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-17 14:42:16
 * @Description:
 */
import { ConfigProvider } from "@nutui/nutui-react-taro";
import zhCN from "@nutui/nutui-react-taro/dist/locales/zh-CN";
import "./index.scss";
import HomePage from "src/components/homePage";
function Index() {
  return (
    <ConfigProvider locale={zhCN}>
      <HomePage></HomePage>
    </ConfigProvider>
  );
}

export default Index;
