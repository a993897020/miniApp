/*
 * @Author: 关振俊
 * @Date: 2025-01-17 16:18:58
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-23 10:46:04
 * @Description:
 */
import {
  TextArea,
  Form,
  Button,
  Uploader,
  FileItem,
} from "@nutui/nutui-react-taro";
import { View } from "@tarojs/components";
import Taro, { useLoad } from "@tarojs/taro";
import { useState } from "react";
import { CacheKey } from "src/utils/constant";
import { formatDate, randomId, waitTime } from "src/utils/tools";

/*
 * @Author: 关振俊
 * @Date: 2025-01-17 16:18:59
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-17 16:33:46
 * @Description:编写记录
 */
const MAX_TITLE_LENGTH = 10;
const MAX_CONTENT_LENGTH = 500;
const MAX_FILE_COUNT = 10;

const WritePage: React.FC = () => {
  const [form] = Form.useForm();
  const [id, setId] = useState<string>("");

  // 拦截上传附件，只允许上传图片
  const beforeUpload = async (files: any[]) => {
    const allowedTypes = ["image"];
    const filteredFiles = Array.from(files).filter((file) =>
      allowedTypes.includes(file.fileType)
    );
    if (filteredFiles.length === 0) {
      Taro.showToast({
        title: "请上传图片",
        icon: "none",
      });
    }
    return filteredFiles;
  };
  const changeFile = (files: FileItem[]) => {
    console.log({ files });
  };

  // 提交表单
  const submitSucceed = async (values: any) => {
    const recordList = Taro.getStorageSync(CacheKey) || [];
    // if (Array.isArray(values.files) && values.files.length > 0) {
    //   for (let i = 0; i < values.files.length; i++) {
    //     if (!values.files[i]?.base64) {
    //       const tempFilePath = values.files[i].path;
    //       values.files[i].base64 = toBase64(tempFilePath);
    //     }
    //   }
    // }
    if (!id) {
      values.id = randomId();
      values.createTime = formatDate(Date.now(), "dateTime");
    } else {
      values.updateTime = formatDate(Date.now(), "dateTime");
    }

    Taro.showLoading({
      title: "提交中...",
    });
    await waitTime();

    if (!id) {
      recordList.push(values);
    } else {
      const index = recordList.findIndex((item) => item.id === id);
      recordList[index] = values;
    }
    Taro.setStorageSync(CacheKey, recordList);
    Taro.showToast({
      title: "提交成功",
      icon: "success",
    });
    await waitTime();
    Taro.navigateBack({
      delta: 1,
    });
  };

  useLoad((opt) => {
    const id = opt.id;
    if (id) {
      const recordList = Taro.getStorageSync(CacheKey) || [];
      const record = recordList.find((item) => item.id === id);
      if (record) {
        form.setFieldsValue(record);
        setId(id);
      }
    }
  });
  return (
    <View style={{ paddingInline: 10 }}>
      <Form
        form={form}
        divider
        labelPosition="left"
        onFinish={(values) => submitSucceed(values)}
        footer={
          <>
            <Button nativeType="submit" block type="info">
              提交
            </Button>
          </>
        }
      >
        <Form.Item
          required
          label="标题"
          name="title"
          rules={[{ required: true, message: "请输入标题" }]}
        >
          <TextArea
            placeholder="请输入标题"
            maxLength={MAX_TITLE_LENGTH}
            showCount
            rows={1}
            autoSize
          />
        </Form.Item>
        <Form.Item
          label="内容"
          name="content"
          rules={[{ required: true, message: "请输入内容" }]}
        >
          <TextArea
            placeholder="请输入内容"
            maxLength={MAX_CONTENT_LENGTH}
            showCount
          />
        </Form.Item>
        <Form.Item label="附件" name="files">
          <Uploader
            multiple
            maxCount={MAX_FILE_COUNT}
            beforeUpload={beforeUpload}
            onChange={changeFile}
          />
        </Form.Item>
      </Form>
    </View>
  );
};
export default WritePage;
