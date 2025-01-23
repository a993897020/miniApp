/*
 * @Author: 关振俊
 * @Date: 2025-01-20 11:46:45
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-22 18:00:19
 * @Description:内容区域
 */
import React, {
  useState,
  useEffect,
  CSSProperties,
  useRef,
  ReactElement,
} from "react";
import {
  Animate,
  AnimateType,
  Button,
  Cell,
  Empty,
  InfiniteLoading,
  Loading,
  Space,
  Swipe,
  Switch,
} from "@nutui/nutui-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import { CacheKey } from "src/utils/constant";
import { waitTime } from "src/utils/tools";
import { ArrowRight, Del, Edit } from "@nutui/icons-react-taro";
import { Text } from "@tarojs/components";
import ExcelJS, { Worksheet } from "exceljs";

const InfiniteUlStyle: CSSProperties = {
  width: "100%",
  padding: "0",
  overflowY: "auto",
  overflowX: "hidden",
};
const animateList: string[] = [
  "shake",
  "ripple",
  "breath",
  "float",
  "jump",
  "twinkle",
  "flicker",
];

const Content = (props: { height: number }) => {
  const [refreshHasMore, setRefreshHasMore] = useState(true);
  const [showAnimate, setShowAnimate] = useState(true);

  const [list, setList] = useState<blogItem[]>([]);
  const [pageNo, setPageNo] = useState(1);
  const isLoading = useRef(false);
  const pageInfo = useRef({
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const allRecord = useRef<blogItem[]>([]);
  const columns = [
    { header: "序号", key: "index", width: 10 },
    { header: "id", key: "id", width: 20 },
    { header: "标题", key: "title", width: 30 },
    { header: "内容", key: "content", width: 40 },
    { header: "附件", key: "files", width: 40 },
    { header: "创建时间", key: "createTime", width: 40 },
    { header: "更新时间", key: "updateTime", width: 40 },
  ];

  const getData = async (type: "init" | "more") => {
    Taro.showLoading({ title: "加载中..." });
    isLoading.current = true;
    await waitTime();
    const recordList: blogItem[] = Taro.getStorageSync(CacheKey) || [];
    allRecord.current = recordList;
    if (type === "init") {
      const newList = recordList
        .slice(0, pageInfo.current.pageSize)
        .map((p) => ({ ...p, swipeRef: React.createRef() }));
      setList(newList);
    }
    if (type === "more") {
      let newList = list.slice();
      const startIdx = (pageNo - 1) * pageInfo.current.pageSize;
      const endIdx = pageNo * pageInfo.current.pageSize;

      const moreData = recordList.slice(startIdx, endIdx);
      newList = [...newList, ...moreData];

      setList(newList);
    }
    Taro.hideLoading();
    isLoading.current = false;
    pageInfo.current = {
      pageSize: 10,
      total: recordList.length,
      pages: Math.ceil(recordList.length / 10),
    };
  };

  const refreshLoadMore = async () => {
    if (pageNo === pageInfo.current.pages) {
      return setRefreshHasMore(false);
    }
    await waitTime();
    setPageNo(pageNo + 1);
  };

  const refresh = async () => {
    await waitTime();
    setPageNo(1);
    setRefreshHasMore(true);
  };

  /**
   * 操作内容
   * @param item 内容
   * @param type 类型 edit 编辑 del 删除 check 查看
   */
  const handleOperateItem = (
    item: blogItem,
    type: "edit" | "del" | "check"
  ) => {
    if (type === "edit") {
      Taro.navigateTo({
        url: `/pages/writeRecord/index?id=${item.id}`,
      });
    }
    if (type === "check") {
      Taro.navigateTo({
        url: `/pages/blogDetail/index?id=${item.id}`,
      });
    }
    if (type === "del") {
      Taro.showModal({
        title: "提示",
        content: "确定删除吗？",
        success: async (res) => {
          if (res.confirm) {
            Taro.showLoading({ title: "删除中" });
            const recordList: blogItem[] = Taro.getStorageSync(CacheKey) || [];
            const newList = recordList.filter((p) => p.id !== item.id);
            Taro.setStorageSync(CacheKey, newList);
            const idx = list.findIndex((p) => p.id === item.id);
            list.splice(idx, 1);
            Taro.setStorageSync(CacheKey, newList);

            await waitTime();

            Taro.showToast({
              title: "删除成功",
              icon: "success",
            });
            await waitTime();
            getData("init");
          }
        },
      });
    }
    item.swipeRef.current.close();
  };
  //   展示日期
  const showTime = (item: blogItem) => {
    if (item.updateTime) return item.updateTime;
    if (item.createTime) return item.createTime;
    return "暂无日期";
  };
  //   生成随机动画
  const createAnimateType = () => {
    // 随机获取动画索引
    const idx = Math.min(animateList.length - 1, Math.ceil(Math.random() * 10));
    const type = showAnimate ? animateList[idx] : false;
    return type as AnimateType;
  };
  // 导入记录
  const importRecord = async () => {
    const res = await Taro.chooseMessageFile({
      count: 1,
      type: "file",
      extension: ["xlsx"],
    });
    console.log({ res });
    const path = res.tempFiles[0].path;
    const fs = Taro.getFileSystemManager();
    const base64 = fs.readFileSync(path, "base64") as string;
    const buffer = Taro.base64ToArrayBuffer(base64);
    // console.log({ base64, buffer });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet("Sheet1") as Worksheet;
    const allValues = sheet
      .getSheetValues()
      .map((p: string[]) => p.slice(2))
      .slice(2);
    const allKey = columns.map((p) => p.key).slice(1);

    const entriesArr = allValues.map((p, pi) => {
      const entries = p.map((pp, pii) => [
        allKey[pii],
        allKey[pii] === "files" ? JSON.parse(pp) : pp,
      ]);
      return Object.fromEntries(entries);
    });
    Taro.setStorageSync(CacheKey, [...list, ...entriesArr]);
    // console.log({ allValues, allKey });

    // console.log({ entriesArr });

    // console.log(sheet.getSheetValues());
  };
  // 导出记录
  const exportRecord = async () => {
    const workbook = new ExcelJS.Workbook();
    // 前置数据
    const resList = allRecord.current.map((p, pi) => ({
      ...p,
      index: pi + 1,
      files: JSON.stringify(p.files),
    }));

    const sheet = workbook.addWorksheet("Sheet1");
    sheet.columns = columns;
    sheet.addRows(resList);

    workbook.xlsx.writeBuffer().then((buffer) => {
      // console.log({ buffer });
      const base64 = Taro.arrayBufferToBase64(buffer);
      // console.log({ base64 });
      const url = Taro.env.USER_DATA_PATH + "/test.xlsx";
      Taro.getFileSystemManager().writeFile({
        filePath: url,
        data: base64,
        encoding: "base64",
        success: (res) => {
          console.log({ res });
          Taro.openDocument({
            filePath: url,
            showMenu: true,
            success: (res) => {
              console.log({ res });
            },
          });
        },
        fail: (err) => {
          console.log({ err });
        },
      });
    });
  };

  useEffect(() => {
    if (pageNo === 1) {
      getData("init");
    } else {
      getData("more");
    }
  }, [pageNo]);
  useDidShow(() => {
    getData("init");
  });

  const OperateItem = (
    text: string,
    style: any,
    icon: ReactElement,
    clickItem: () => void
  ) => {
    return (
      <div
        style={{
          width: "60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "8px",
          ...style,
        }}
        onClick={() => clickItem()}
      >
        {icon}
        <>{text}</>
      </div>
    );
  };

  return (
    <>
      <ul
        id="refreshScroll"
        style={Object.assign({}, InfiniteUlStyle, { height: props.height })}
      >
        {list.length > 0 ? (
          <InfiniteLoading
            target="refreshScroll"
            pullRefresh
            loadingText={<Loading>加载中</Loading>}
            hasMore={refreshHasMore}
            onLoadMore={refreshLoadMore}
            onRefresh={refresh}
          >
            <Space
              style={{
                marginBottom: 20,
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Button type="info" onClick={() => importRecord()}>
                导入
              </Button>
              <Button type="info" onClick={() => exportRecord()}>
                导出
              </Button>
              <Text>动画</Text>
              <Switch
                onChange={setShowAnimate}
                checked={showAnimate}
                style={
                  {
                    "--nutui-switch-open-background-color": "#4969f2",
                    "--nutui-switch-close-line-background-color": "#ebebeb",
                  } as React.CSSProperties
                }
              />
            </Space>

            <Space style={{ width: "100%" }} direction="vertical">
              {list.map((item: blogItem, index) => {
                return (
                  <React.Fragment key={index}>
                    <Animate type={createAnimateType()} loop>
                      <Swipe
                        ref={item.swipeRef}
                        className="swipe_wrap"
                        rightAction={
                          <div className="swipe_right">
                            <>
                              {OperateItem(
                                "编辑",
                                {
                                  background: "#F8F8F8",
                                  color: "#1A1A1A",
                                },
                                <Edit />,
                                () => handleOperateItem(item, "edit")
                              )}
                              {OperateItem(
                                "删除",
                                {
                                  background: "#FA2C19",
                                  color: "#FFF",
                                },
                                <Del />,
                                () => handleOperateItem(item, "del")
                              )}
                            </>
                          </div>
                        }
                      >
                        <Cell
                          title={item.title}
                          extra={<ArrowRight />}
                          description={showTime(item)}
                          clickable
                          onClick={() => handleOperateItem(item, "check")}
                        ></Cell>
                      </Swipe>
                    </Animate>
                  </React.Fragment>
                );
              })}
            </Space>
          </InfiniteLoading>
        ) : (
          <Empty description="暂无数据" />
        )}
      </ul>
    </>
  );
};
export default Content;
