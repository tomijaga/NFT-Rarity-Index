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

  const [stats, setStats] = useState<any>({
    fusions: { total: 0, lastFusion: Date.now() },
    tokens: { total: 0, fused: 0 },
  });

  const getFusedTokens = useCallback(
    async (
      page: number = 1,
      pageSize: number = 50,
      sort: string = "-lastModified"
    ) => {
      console.log(page);
      setTokenSortMethod(sort);
      setIsLoadingFusions(true);
      const { data } = await axios.get(
        `/api/tokens/fused?limit=${pageSize}&offset=${
          (page ? page - 1 : 0) * pageSize
        }&sort=${sort}`
      );
      setIsLoadingFusions(false);

      setEvolvedTokens(data);
    },
    []
  );

  useEffect(() => {
    const getFusionStats = async () => {
      const { data } = await axios.get("/api/stats/fusion");

      setStats(data);
    };

    getFusedTokens();
    getFusionStats();
  }, [getFusedTokens]);

  const pagination = (
    <Pagination
      size="small"
      total={stats?.tokens?.fused ?? 0}
      current={currentPage}
      showSizeChanger
      defaultPageSize={50}
      // showTotal={() => "Total 100 items"}
      onChange={(page, pageSize) => {
        setCurrentPage(page);
        setCurrentPageSize(pageSize || 50);
        getFusedTokens(page, pageSize);
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
            <Typography.Title level={3}>Fused Outkasts</Typography.Title>
          </Col>
          <Col span={24}>
            <Card>
              <Row justify={"space-between"} gutter={[10, 20]}>
                <Col>
                  Sort By:{" "}
                  <Select
                    value={tokenSortMethed}
                    onChange={(sortValue) => {
                      getFusedTokens(currentPage, currentPageSize, sortValue);
                    }}
                  >
                    <Select.Option value="-lastModified">
                      Recently Fused
                    </Select.Option>
                    <Select.Option value="-level">Highest Level</Select.Option>
                    <Select.Option value="+level">Lowest Level</Select.Option>
                    {/* <Select.Option value="-fusions">
                      Highest Fusions
                    </Select.Option> */}
                  </Select>
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
                          showS3Image
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
