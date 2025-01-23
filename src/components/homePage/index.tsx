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
 * @LastEditTime: 2025-01-23 17:15:53
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
      const wrapH = getContainerHeight() - res[0].height - 40 - 50;
      setContainerHeight(wrapH);
    });
  }, []);

  return (
    <View className="container">
      <Content height={containerHeight}></Content>
      <View style={{ padding: 12 }}>
        <Button
          id="recordBtn"
          block
          size="large"
          type="info"
          style={{ width: "100%" }}
          onClick={toPage}
        >
          记录
        </Button>
      </View>
    </View>
  );
};
export default index;
