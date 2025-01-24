/*
 * @Author: 关振俊
 * @Date: 2025-01-17 10:53:38
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-24 10:28:30
 * @Description:
 */
import type { UserConfigExport } from "@tarojs/cli";
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
  },
  h5: {},
} satisfies UserConfigExport<"webpack5">;
