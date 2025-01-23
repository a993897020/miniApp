import { Button } from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import { useState, useEffect } from "react";
import "./index.scss";
import { getContainerHeight } from "src/utils/tools";
import Taro from "@tarojs/taro";
import Content from "./components/content";
/*
 * @Author: 关振俊
 * @Date: 2025-01-17 14:42:41
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-22 16:03:05
 * @Description: 首页
 */
const index: React.FC = () => {
  const [containerHeight, setContainerHeight] = useState(0);

  const toPage = () => {
    Taro.navigateTo({ url: "/pages/writeRecord/index" });
  };

  useEffect(() => {
    const query = Taro.createSelectorQuery();
    query.select("#recordBtn").boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      const marginGap = 20;
      const paddingGap = 20 * 2;
      const wrapH =
        getContainerHeight() - res[0].height - marginGap - paddingGap;
      setContainerHeight(wrapH);
    });
  }, []);

  return (
    <View className="container">
      <Content height={containerHeight}></Content>
      <Button
        id="recordBtn"
        block
        size="large"
        type="info"
        style={{ width: "100%", marginTop: 20 }}
        onClick={toPage}
      >
        记录
      </Button>
    </View>
  );
};
export default index;
