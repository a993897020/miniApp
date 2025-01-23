/*
 * @Author: 关振俊
 * @Date: 2025-01-17 16:02:49
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-22 18:00:28
 * @Description:
 */
import Taro from "@tarojs/taro";

/**
 * 获取容器可视高度
 * @returns
 */
export const getContainerHeight = () => {
  const info = Taro.getWindowInfo();
  return info.windowHeight;
};

/**
 * 格式化时间戳
 * @param timestamp 时间戳
 * @param type 显示日期类别
 * @returns
 * @example
 * formatDate(1638326400000, "date") // 2021-12-01
 * formatDate(1638326400000, "dateTime") // 2021-12-01 00:00:00
 */
export function formatDate(
  timestamp: number = Date.now(),
  type: "date" | "dateTime" = "date"
) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hour = ("0" + date.getHours()).slice(-2);
  const minute = ("0" + date.getMinutes()).slice(-2);
  const second = ("0" + date.getSeconds()).slice(-2);
  const showTypeMap = {
    date: `${year}-${month}-${day}`,
    dateTime: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
  };
  return showTypeMap[type];
}
/**
 * 模拟请求等待
 * @param time 等待时间
 * @returns
 * @example
 * await waitTime(2000) // 等待2秒
 */
export const waitTime = (time: number = 500): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};
