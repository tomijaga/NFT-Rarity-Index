import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { TokenCard } from "components";
import axios from "axios";
import evolved from "pages/api/tokens/fused";
import { Row, Col, Card, Typography, Statistic, Tooltip } from "antd";
import { Token } from "models/server/tokens";
import { formatDistanceToNowStrict } from "date-fns";

const EvolvedOutkastsPage: NextPage = () => {
  const [evolvedTokensData, setEvolvedTokensData] = useState<{
    count: number;
    tokens: Token[];
  }>({} as any);

  const [totalFusions, setTotalFusions] = useState(0);
  const [totalOutkastTokens, setTotalOutkastTokens] = useState(0);

  const { count, tokens } = evolvedTokensData;

  useEffect(() => {
    const getFusionStats = async () => {
      const {
        data: { fusions, tokens: okTokens },
      } = await axios.get("/api/stats/fusion");

      setTotalFusions(fusions.total);
      setTotalOutkastTokens(okTokens.total);
    };

    const getFusedTokens = async () => {
      const { data } = await axios.get("/api/tokens/fused");
      setEvolvedTokensData(data);
    };

    getFusedTokens();
    getFusionStats();
  }, []);

  return (
    <>
      <Col span={24}>
        <Card size={"small"}>
          <Row justify="space-around">
            <Col>
              <Statistic title={"Token Supply"} value={totalOutkastTokens} />
            </Col>
            <Col>
              <Statistic
                title={"Total Fusions"}
                value={totalFusions}
                suffix={"/ 5000"}
              />
            </Col>{" "}
            <Col>
              <Statistic title={"Fused Outkast"} value={count} />
            </Col>
            <Col>
              <Statistic
                title={"Last Fusion "}
                value={formatDistanceToNowStrict(
                  new Date(tokens?.[0].lastModified ?? Date.now())
                )}
              />
            </Col>
            {/* <Col>
              <Typography.Title level={5}>
                Fuse now before its too late and all that crap
              </Typography.Title>
            </Col> */}
          </Row>
        </Card>
      </Col>

      <Col span={24} key="fusions">
        <Row>
          <Col span={24}>
            <Typography.Title level={3}>
              Recently Fused Outkasts
            </Typography.Title>
          </Col>
          <Col span={24}>
            <Card>
              <Row justify={"space-around"} gutter={[10, 10]}>
                {tokens?.map((token) => (
                  <Col>
                    <TokenCard preview={false} token={token} width={150} />
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default EvolvedOutkastsPage;
