import { View, Button, Text } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useEffect, useState } from "react";
import "./index.scss";
/*
 * @Author: 关振俊
 * @Date: 2025-01-23 14:36:41
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-23 16:21:24
 * @Description:过渡页
 */
const index: React.FC = () => {
  const [showTransition, setShowTransition] = useState(true);
  const goToHomePage = () => {
    setShowTransition(true);
  };
  useEffect(() => {
    // if (showTransition) {
    //   setTimeout(() => {
    //     Taro.redirectTo({
    //       url: "/pages/index/index",
    //     });
    //   }, 1500); // 等待动画完成
    // }
  }, [showTransition]);
  useEffect(() => {
    setTimeout(() => {
      Taro.redirectTo({
        url: "/pages/index/index",
      });
    }, 5000);
  });
  return (
    <>
      <View className="container">
        <View className="welcome_text">欢迎光临</View>
        <Button
          className="enter_button"
          onClick={() => Taro.redirectTo({ url: "/pages/index/index" })}
        >
          进入首页
        </Button>
      </View>
    </>
  );
};
export default index;
