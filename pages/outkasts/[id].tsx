import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Divider,
  Empty,
  Image,
  Typography,
  Button,
  Statistic,
  Progress,
  Collapse,
  Carousel,
} from "antd";
import axios from "axios";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { Attribute, Token } from "models/server/tokens";
import { TokenCard } from "components";

const TokenDetails: NextPage = () => {
  const [token, setToken] = useState<Token>();

  const tokenCardWidth = 150;
  const router = useRouter();
  const { id, name } = router.query;

  useEffect(() => {
    const getToken = async () => {
      if (name) {
        const res = await axios.get(`/api/tokens/${name}`);
        setToken(res.data);
        return;
      }

      const { data } = await axios.get(`/api/tokens/${id}`);
      setToken(data);
    };

    if (id) {
      getToken();
    }
  }, [id, name]);

  const maxDepth = (token: Token | undefined | null): number => {
    const previous = token?.history?.previous;
    const fusion = token?.history?.fusion;
    if (!token) return 0;
    return Math.max(maxDepth(previous), maxDepth(fusion)) + 1;
  };

  const minDepth = (token: Token | undefined | null): number => {
    const previous = token?.history?.previous;
    const fusion = token?.history?.fusion;
    if (!token) return 0;
    return Math.min(minDepth(previous), minDepth(fusion)) + 1;
  };

  let fusions = token?.fusedWith.length;

  const historyTabWidth = (tokenCardWidth + 20 + 10) * 2 ** 1;
  let nextLevelXP = 1250;

  if (token) {
    const nextLevel = token?.level ? token?.level + 1 : 2;
    nextLevelXP = ((nextLevel * (nextLevel + 1)) / 2) * 100 + nextLevel * 1250;
  }
  const embedFusion = (node: Token) => {
    const previous = node?.history?.previous;
    const fusion = node?.history?.fusion;

    const getChildNode = (childNode: Token) => {
      childNode.history = { previous: null, fusion: null };
      return embedFusion(childNode);
    };

    const tokenCard = (tokenDetails: Token, showS3Image: boolean = true) => {
      return (
        <TokenCard
          preview={false}
          width={tokenCardWidth}
          token={tokenDetails}
          showS3Image={showS3Image}
          hoverable={tokenDetails?.id !== node.id}
          link={tokenDetails?.id !== node.id}
        />
      );
    };

    return (
      <div style={{ position: "relative", width: "100%" }}>
        <div
          style={{
            width: `${historyTabWidth}px`,
            margin: "auto",
            background: "#364d79",
            padding: "60px 0px",
          }}
        >
          <Row justify="center">
            <Col style={{ padding: "5px" }}>{tokenCard(node)}</Col>
            <Col span={24}>
              <Row
                justify="center"
                align={"top"}
                style={{
                  padding: "0px 10px",
                }}
                gutter={10}
              >
                <Col span={12}>{previous && tokenCard(previous)}</Col>

                <Col span={12}>{fusion && tokenCard(fusion)}</Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  const getAttributes = () => {
    const mapAttributes = ({ trait_type, value }: Attribute) => {
      return (
        <Col span={6}>
          <Card
            bodyStyle={{ backgroundColor: "rgba(200, 200, 200, 0.1)" }}
            size="small"
          >
            <Row>
              <Col span={24}>
                <Typography.Text type="secondary" style={{ fontSize: "small" }}>
                  {trait_type}
                </Typography.Text>
              </Col>
              <Col span={24}>{value}</Col>
            </Row>
          </Card>
        </Col>
      );
    };

    if (token?.decommissioned) {
      return (
        <Row justify="center" align="middle">
          <Col>
            <Empty description="Fused tokens have no traits" />
          </Col>
        </Row>
      );
    }
    return (
      <Row gutter={[10, 10]} justify={"space-between"}>
        {token?.attributes
          ?.filter((property) => property.trait_type !== "Level")
          ?.map(mapAttributes)}
      </Row>
    );
  };

  return (
    <>
      <Col span={24} style={{ height: "90vh", overflow: "auto" }}>
        <Row
          gutter={[20, 20]}
          justify="center"
          style={{ position: "relative", top: "0px" }}
        >
          <Col span={23} md={9} sm={20} xs={23}>
            <Row gutter={[10, 10]} style={{ position: "sticky", top: "0px" }}>
              <Col>
                <Image src={token?.image} alt={`loading image 🎥`} />
              </Col>

              <Col span={24}>
                <Row justify="space-between">
                  <Col>
                    <Typography.Link href="https://outkast.world/" strong>
                      WE ARE THE OUTKAST
                    </Typography.Link>
                  </Col>
                  <Col span={24}>
                    <Typography.Title level={2}>{token?.name}</Typography.Title>
                  </Col>
                </Row>
              </Col>
              <Col md={12} sm={0}>
                <Button.Group>
                  {/* <Button
                    onClick={async () => {
                      const result = await axios.get(`/api/update/${id}`);
                      console.log(result);
                    }}
                  >
                    Refresh Metadata
                  </Button> */}
                  <Button
                    type="default"
                    target="_blank"
                    href={`https://opensea.io/assets/0x1c5ed03149b1fd5efe12828a660c7b892c111ba4/${token?.id}`}
                  >
                    Opensea
                  </Button>
                  <Button
                    type="default"
                    target="_blank"
                    href="https://outkast.world"
                  >
                    Outkast Website
                  </Button>
                </Button.Group>
              </Col>
              <Col>
                <Card>
                  <Row justify="space-around" gutter={[50, 20]}>
                    <Col>
                      <Statistic title="Level" value={token?.level ?? 0} />
                    </Col>
                    <Col>
                      <Statistic title="Fusions" value={fusions ?? 0} />
                    </Col>

                    <Col>
                      <Statistic
                        title="Experience"
                        value={`${token?.experience.toLocaleString()} / ${Math.max(
                          nextLevelXP,
                          token?.experience || 0
                        ).toLocaleString()} xp`}
                      ></Statistic>
                      <Progress
                        showInfo={false}
                        percent={
                          token ? (token?.experience / nextLevelXP) * 100 : 0
                        }
                        format={(xp) => `${10000} xp`}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col span={23} md={15} sm={20} xs={23}>
            <Row justify="space-between" gutter={[20, 20]}>
              <Col span={24}>
                <Collapse defaultActiveKey={["fusion_history"]}>
                  <Collapse.Panel
                    header={"Fusion History"}
                    key={"fusion_history"}
                  >
                    <Carousel dots dotPosition="bottom">
                      {(() => {
                        let node = token as Token | undefined | null;
                        console.log({ token });
                        const fusions = [];
                        let i = 0;
                        while (node) {
                          if (node.history) {
                            fusions.push(embedFusion(node));
                          }
                          node = node?.history?.previous;
                        }
                        let n = fusions.length;
                        if (n) {
                          return fusions.map((fusion, i) => (
                            <div>
                              <h3>
                                Fusion {n - i} of {fusions.length}
                              </h3>
                              {fusion}
                            </div>
                          ));
                        } else {
                          console.log({ token });
                          return [
                            <>
                              <Empty
                                description={
                                  <h3>This outkast has no Fusions</h3>
                                }
                              />
                            </>,
                          ];
                        }
                      })()}
                    </Carousel>
                  </Collapse.Panel>
                </Collapse>
              </Col>

              <Col span={24}>
                <Collapse defaultActiveKey={["token_properties"]}>
                  <Collapse.Panel
                    header={"Properties"}
                    key={"token_properties"}
                  >
                    {getAttributes()}
                  </Collapse.Panel>
                </Collapse>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </>
  );
};

export default TokenDetails;
