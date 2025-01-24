/*
 * @Author: 关振俊
 * @Date: 2025-01-20 11:46:45
 * @LastEditors: 关振俊
 * @LastEditTime: 2025-01-24 16:03:20
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
  Checkbox,
} from "@nutui/nutui-react-taro";
import Taro, { useDidShow } from "@tarojs/taro";
import { CacheKey } from "src/utils/constant";
import { randomId, toBase64, waitTime } from "src/utils/tools";
import { ArrowRight, Del, Edit } from "@nutui/icons-react-taro";
import { Text, View } from "@tarojs/components";
import ExcelJS, { Workbook, Worksheet } from "exceljs";

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
const sheetName = "Sheet1";

const Content = (props: { height: number }) => {
  const [refreshHasMore, setRefreshHasMore] = useState(true);
  const [showAnimate, setShowAnimate] = useState(false);

  const [list, setList] = useState<blogItem[]>([]);
  const [pageNo, setPageNo] = useState(1);
  // const isLoading = useRef(false);
  const pageInfo = useRef({
    pageSize: 10,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchDel, setIsBatchDel] = useState(false);
  const [selectList, setSelectList] = useState<string[]>([]);

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
    // isLoading.current = true;
    setIsLoading(true);
    await waitTime();
    const recordList: blogItem[] = Taro.getStorageSync(CacheKey) || [];
    console.log({ recordList });
    allRecord.current = recordList.reverse();
    if (type === "init") {
      const newList = allRecord.current
        .slice(0, pageInfo.current.pageSize)
        .map((p) => ({ ...p, swipeRef: React.createRef() }));
      setList(newList);
    }
    if (type === "more") {
      let newList = list.slice();
      const startIdx = (pageNo - 1) * pageInfo.current.pageSize;
      const endIdx = pageNo * pageInfo.current.pageSize;

      const moreData = allRecord.current.slice(startIdx, endIdx);
      newList = [...newList, ...moreData];

      setList(newList);
    }
    Taro.hideLoading();
    // isLoading.current = false;
    setIsLoading(false);
    pageInfo.current = {
      pageSize: 10,
      total: allRecord.current.length,
      pages: Math.ceil(allRecord.current.length / 10),
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
    if (pageNo === 1) {
      getData("init");
    }
    setPageNo(1);
    setRefreshHasMore(true);
    setIsBatchDel(false);
    setSelectList([]);
    Taro.pageScrollTo({ scrollTop: 0 });
  };
  const closeSwipe = () => {
    list.forEach((p) => {
      p.swipeRef.current?.close();
    });
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
    closeSwipe();
    if (type === "del") {
      return Taro.showModal({
        title: "提示",
        content: "确定删除吗？",
        success: async (res) => {
          if (res.confirm) {
            Taro.showLoading({ title: "删除中" });
            const recordList: blogItem[] = Taro.getStorageSync(CacheKey) || [];
            const newList = recordList.filter((p) => p.id !== item.id);
            Taro.setStorageSync(CacheKey, newList);

            closeSwipe();

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
    try {
      const res = await Taro.chooseMessageFile({
        count: 1,
        type: "file",
        extension: ["xlsx"],
      });
      // console.log({ res });
      const path = res.tempFiles[0].path;
      const fs = Taro.getFileSystemManager();
      const base64 = fs.readFileSync(path, "base64") as string;
      const buffer = Taro.base64ToArrayBuffer(base64);
      // console.log({ base64, buffer });
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const sheet = workbook.getWorksheet(sheetName) as Worksheet;
      const allValues = sheet
        .getSheetValues()
        .map((p: string[]) => p.slice(2))
        .slice(2);
      // console.log({ allValues });
      const allKey = columns.map((p) => p.key).slice(1);
      const entriesArr = allValues.map((p) => {
        const entries = p.map((pp, pii) => {
          let formatPP = pp;
          if (allKey[pii] === "files") {
            formatPP = pp ? JSON.parse(pp) : [];
          }
          if (allKey[pii] === "id") {
            formatPP = randomId();
          }
          return [allKey[pii], formatPP];
        });
        return Object.fromEntries(entries);
      });
      Taro.setStorageSync(CacheKey, [...list, ...entriesArr]);
      Taro.showToast({
        title: "导入成功",
        icon: "success",
      });
      refresh();
    } catch (err) {
      Taro.showToast({
        title: "导入失败",
        icon: "error",
      });
    }
    // console.log({ allValues, allKey });

    // console.log({ entriesArr });

    // console.log(sheet.getSheetValues());
  };
  // 导出记录
  const exportRecord = async () => {
    Taro.showLoading({
      title: "导出中",
      mask: true,
    });
    const workbook = new ExcelJS.Workbook();
    // 前置数据
    const resList = allRecord.current.map((p, pi) => ({
      ...p,
      index: pi + 1,
      files: p.files ? JSON.stringify(p.files) : "",
    }));
    // 修复表重复创建
    if (workbook.getWorksheet(sheetName)) {
      workbook.removeWorksheet(sheetName);
    }
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = columns;
    sheet.addRows(resList);

    if (allRecord.current.length > 0) {
      allRecord.current.forEach((p, pi) => {
        if (Array.isArray(p.files) && p.files.length > 0) {
          // 图片显示处理
          p.files.forEach((pp, ppi) => {
            const base64 = toBase64(pp.path);
            const imageId = workbook.addImage({
              base64: base64,
              extension: "png",
            });
            sheet.addImage(imageId, {
              tl: { col: columns.length + ppi, row: pi + 1 },
              ext: { width: 20, height: 20 },
            });
          });
        }
      });
    }

    workbook.xlsx
      .writeBuffer()
      .then((buffer) => {
        // console.log({ buffer });
        const base64 = Taro.arrayBufferToBase64(buffer);
        // console.log({ base64 });
        const url = Taro.env.USER_DATA_PATH + "/记录.xlsx";
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
          complete: () => {
            Taro.hideLoading();
          },
        });
      })
      .catch(() => {
        Taro.hideLoading();
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
        onClick={(e: any) => {
          e.stopPropagation();
          clickItem();
        }}
      >
        {icon}
        <>{text}</>
      </div>
    );
  };

  const handleDelRecord = () => {
    if (selectList.length === 0)
      return Taro.showToast({ title: "请选择要删除的记录" });
    Taro.showModal({
      title: "提示",
      content: "确定要删除吗？",
      success: (res) => {
        // console.log(res);
        if (res.confirm) {
          Taro.showLoading({ title: "删除中" });
          allRecord.current = allRecord.current.filter((item) => {
            return !selectList.includes(item.id);
          });
          // console.log(allRecord.current);
          Taro.setStorageSync(CacheKey, allRecord.current);
          Taro.hideLoading();
          refresh();
        }
      },
    });
  };
  return (
    <>
      <Space
        style={{
          marginBlock: 12,
          justifyContent: "flex-end",
          alignItems: "center",
          height: 40,
        }}
        className="padding_wrap"
      >
        {isBatchDel ? (
          <Space>
            <Button type="info" onClick={() => handleDelRecord()}>
              确定删除
            </Button>
            <Button onClick={() => setIsBatchDel(false)}>取消删除</Button>
          </Space>
        ) : (
          <Space align={"center"}>
            <Button type="danger" onClick={() => setIsBatchDel(true)}>
              批量删除
            </Button>
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
        )}
      </Space>
      <ul
        id="refreshScroll"
        style={{ ...InfiniteUlStyle, height: props.height }}
      >
        <InfiniteLoading
          target="refreshScroll"
          pullRefresh
          loadingText={<Loading>加载中</Loading>}
          hasMore={refreshHasMore}
          onLoadMore={refreshLoadMore}
          onRefresh={refresh}
        >
          <Checkbox.Group
            direction="horizontal"
            onChange={(value) => {
              console.log({ value });
              setSelectList(value);
              // if (value.length === 4) {
              //   setIndeterminate(false)
              //   setCheckbox1(true)
              // } else if (value.length && value.length < 4) {
              //   setIndeterminate(true)
              //   setCheckbox1(true)
              // } else {
              //   setCheckbox1(false)
              // }
            }}
          >
            <Space className="list_wrap padding_wrap" direction="vertical">
              {list.length > 0 ? (
                list.map((item: blogItem, index) => {
                  return (
                    <View key={index} className="list_item">
                      {isBatchDel && <Checkbox value={item.id}></Checkbox>}
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
                    </View>
                  );
                })
              ) : (
                <Empty description="暂无数据" />
              )}
            </Space>
          </Checkbox.Group>
        </InfiniteLoading>
      </ul>
    </>
  );
};
export default Content;
