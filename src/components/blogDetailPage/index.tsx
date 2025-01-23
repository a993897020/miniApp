/*
 * @Author: 关振俊
 * @Date: 2025-01-20 16:17:52
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-23 11:41:15
 * @Description:
 */
import { View } from "@tarojs/components";
import "./index.scss";
import { useLoad } from "@tarojs/taro";
import Taro from "@tarojs/taro";
import { CacheKey } from "src/utils/constant";
import { useState } from "react";
import { waitTime } from "src/utils/tools";
import {
  Space,
  Image,
  Loading,
  ImagePreview,
  BackTop,
} from "@nutui/nutui-react-taro";
/*
 * @Author: 关振俊
 * @Date: 2025-01-20 16:17:53
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-20 17:22:14
 * @Description:博客详情
 */

const index: React.FC = () => {
  const [blogInfo, setBlogInfo] = useState<blogItem | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [previewImg, setPreviewImg] = useState<string>("");

  const handleImageShow = async (blog: blogItem) => {
    if (!Array.isArray(blog.files)) return blog;
    for (let i = 0; i < blog.files.length; i++) {
      const p = blog.files[i];
      const url = `${Taro.env.USER_DATA_PATH}/${Date.now() + i}.png`;
      Taro.getFileSystemManager().writeFileSync(
        url,
        p.base64.replace("data:image/png;base64,", ""),
        "base64"
      );
      p.newUrl = url;
    }
    return blog;
  };

  useLoad(async (opt) => {
    const id = opt.id;
    if (id) {
      Taro.showLoading({ title: "加载中" });
      await waitTime();
      const blogData = Taro.getStorageSync(CacheKey);
      const blog = blogData.find((item: any) => item.id === id);
      // await handleImageShow(blog);
      // console.log({ blog });
      setBlogInfo(blog);
      Taro.hideLoading();
    }
  });
  return (
    blogInfo && (
      <View className="blog_wrap">
        <View className="blog_title">{blogInfo.title}</View>
        <View className="blog_time">
          {blogInfo.updateTime ? blogInfo.updateTime : blogInfo.createTime}
        </View>
        <View className="blog_content">{blogInfo.content}</View>
        {blogInfo.files && (
          <View className="blog_imgs">
            <Space>
              {blogInfo.files.map((item: any, idx: number) => {
                return (
                  <Image
                    width="80"
                    height="80"
                    src={item.url}
                    loading={<Loading className="nut-icon-loading" />}
                    key={idx}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setShowPreview(true);
                      setPreviewImg(item.url);
                    }}
                  ></Image>
                );
              })}
            </Space>
          </View>
        )}
        <ImagePreview
          autoPlay
          images={[{ src: previewImg }]}
          visible={showPreview}
          closeIcon
          closeIconPosition="bottom"
          onClose={() => setShowPreview(false)}
        />
        <BackTop></BackTop>
      </View>
    )
  );
};
export default index;
