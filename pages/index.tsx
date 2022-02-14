import React, { useEffect, useState, useCallback } from "react";
import type { NextPage } from "next";
import { TokenCard } from "components";
import axios from "axios";
import evolved from "pages/api/tokens/fused";
import {
  Row,
  Col,
  Card,
  Typography,
  Statistic,
  Tooltip,
  Pagination,
  Select,
  Grid,
  Button,
  Switch,
  Space,
} from "antd";
import { Token } from "models/server/tokens";
import { formatDistanceToNowStrict } from "date-fns";
import Link from "next/link";

const EvolvedOutkastsPage: NextPage = () => {
  const screens = Grid.useBreakpoint();
  const [evolvedTokens, setEvolvedTokens] = useState<Token[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(50);
  const [tokenSortMethed, setTokenSortMethod] = useState("-lastModified");
  const [isLoadingFusions, setIsLoadingFusions] = useState(false);
  const [displayFusedOnly, setDisplayFusedOnly] = useState(true);
  const [totalCardsDisplayed, setTotalCardsDisplayed] = useState(0);
  const [stats, setStats] = useState<any>({
    fusions: { total: 0, lastFusion: Date.now() },
    tokens: { total: 0, fused: 0 },
  });

  const getFusedTokens = useCallback(
    async (
      page: number = 1,
      pageSize: number = currentPageSize,
      sort: string = tokenSortMethed
    ) => {
      console.log(page);
      setIsLoadingFusions(true);
      const { data } = await axios.get(
        `/api/tokens${
          displayFusedOnly ? "/fused" : ""
        }?limit=${pageSize}&offset=${
          (page ? page - 1 : 0) * pageSize
        }&sort=${sort}`
      );
      setIsLoadingFusions(false);

      setEvolvedTokens(data);
    },
    [displayFusedOnly, currentPageSize, tokenSortMethed]
  );

  useEffect(() => {
    getFusedTokens();
  }, [getFusedTokens]);

  useEffect(() => {
    const getFusionStats = async () => {
      const { data } = await axios.get("/api/stats/fusion");

      setStats(data);
      setTotalCardsDisplayed(data?.tokens?.fused ?? 0);
    };

    getFusionStats();
  }, []);

  const pagination = (
    <Pagination
      size="small"
      total={totalCardsDisplayed}
      current={currentPage}
      pageSize={currentPageSize}
      showSizeChanger
      defaultPageSize={50}
      // showTotal={() => "Total 100 items"}
      onChange={(page, pageSize) => {
        setCurrentPage(() => page);
        setCurrentPageSize(pageSize || 50);
        getFusedTokens(page, pageSize, tokenSortMethed);
      }}
    />
  );

  return (
    <>
      <Col span={24}>
        <Row justify="end">
          <Col span={24}>
            <Card size={"small"}>
              <Row justify="space-around" gutter={[30, 20]}>
                <Col>
                  <Statistic
                    title={"Token Supply"}
                    value={stats.tokens.total}
                  />
                </Col>
                <Col>
                  <Statistic
                    title={"Total Fusions"}
                    value={stats.fusions.total}
                    suffix={"/ 5000"}
                  />
                </Col>{" "}
                <Col>
                  <Statistic
                    title={"Fused Outkast"}
                    value={stats.tokens.fused}
                  />
                </Col>
                <Col>
                  <Statistic
                    title={"Last Fusion "}
                    value={formatDistanceToNowStrict(
                      new Date((stats.fusions.lastFusion.seconds ?? 0) * 1000)
                    )}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* <Col>
            <Typography.Text type="secondary">
              Last Updated at {new Date((stats.lastUpdated.seconds??0) * 1000).toLocaleDateString()}
            </Typography.Text>
          </Col> */}
        </Row>
      </Col>

      <Col span={24} key="fusions">
        <Row>
          <Col span={24}>
            <Typography.Title level={3}>
              Citizens of Andrometa{" "}
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Card>
              <Row align="middle" justify={"space-between"} gutter={[10, 20]}>
                <Col>
                  <Space>
                    <Col>
                      Sort By:{" "}
                      <Select
                        size="small"
                        value={tokenSortMethed}
                        onChange={(sortValue) => {
                          setTokenSortMethod(() => sortValue);
                          setCurrentPage(() => 1);
                        }}
                      >
                        <Select.Option value="-lastModified">
                          Recently Fused
                        </Select.Option>
                        <Select.Option value="-level">
                          Highest Level
                        </Select.Option>
                        <Select.Option value="+level">
                          Lowest Level
                        </Select.Option>
                        <Select.Option value="+rank">Rarity</Select.Option>

                        {/* <Select.Option value="-fusions">
                      Highest Fusions
                    </Select.Option> */}
                      </Select>
                    </Col>
                    <Col style={{ alignItems: "center" }}>
                      Displaying:
                      <Typography.Text>
                        {displayFusedOnly ? " Only Fused " : " All Outkasts "}
                      </Typography.Text>
                      <Switch
                        defaultChecked
                        size="small"
                        checked={displayFusedOnly}
                        onChange={(checked) => {
                          setDisplayFusedOnly(() => checked);
                          setTotalCardsDisplayed(
                            () =>
                              (checked
                                ? stats?.tokens?.fused
                                : stats?.tokens?.total) ?? 0
                          );

                          setCurrentPage(() => 1);
                        }}
                      />
                    </Col>
                  </Space>
                </Col>

                {isLoadingFusions && (
                  <Col>
                    <Button type="text" loading={{ delay: 0 }}>
                      Retrieving Outkasts...
                    </Button>
                  </Col>
                )}

                <Col>{pagination}</Col>

                <Col span={24}>
                  <Row justify={"space-around"} gutter={[10, 10]}>
                    {evolvedTokens?.map((token) => {
                      const tokenCardComponent = (
                        // <Link
                        //   key={token.id}
                        //   href={`/outkasts/${token.id}`}
                        //   passHref
                        // >
                        // <a>
                        <TokenCard
                          hoverable={false}
                          preview={false}
                          token={token}
                          width={150}
                          showS3Image={
                            process.env.NODE_ENV === "production" ? true : false
                          }
                        />
                        /* </a>
                        </Link> */
                      );

                      return screens.xs ? (
                        <Col span={12} key={token.id}>
                          {tokenCardComponent}
                        </Col>
                      ) : (
                        <Col key={token.id}>{tokenCardComponent}</Col>
                      );
                    })}
                  </Row>
                </Col>
                <Col />
                <Col>{pagination}</Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default EvolvedOutkastsPage;
