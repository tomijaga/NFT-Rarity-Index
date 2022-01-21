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
  const { id } = router.query;

  useEffect(() => {
    const getToken = async () => {
      const { data } = await axios.get(`/api/tokens/${id}`);
      setToken(data);
    };

    if (id) {
      getToken();
    }
  }, [id]);

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

  const historyTabWidth =
    (tokenCardWidth + 20 + 10) * 2 ** (maxDepth(token) - 2);

  const embedFusion = (node: Token) => {
    const previous = node?.history?.previous;
    const fusion = node?.history?.fusion;

    const getFusion = () => {
      if (fusion) {
        if (fusion?.history?.previous) {
          return embedFusion(fusion.history.previous);
        }

        return embedFusion(fusion);
      }
      return null;
    };
    return (
      <Row
        justify="center"
        style={
          {
            // borderTop: "1px solid gray",
          }
        }
      >
        <Col style={{ padding: "5px" }}>
          <TokenCard
            preview={false}
            width={tokenCardWidth}
            token={node}
            showS3Image
            hoverable={token?.id !== node.id}
          />
        </Col>
        <Col span={24}>
          <Row
            justify="center"
            align={"bottom"}
            style={{
              padding: "0px 10px",
            }}
            gutter={10}
          >
            <Col span={12}>{previous && fusion && embedFusion(previous)}</Col>

            <Col span={12}>{getFusion()}</Col>
          </Row>
        </Col>
      </Row>
    );
  };

  const getAttributes = () => {
    const mapAttributes = ({ trait_type, value }: Attribute) => {
      return (
        <>
          <Col span={24}>
            <Card size="small">
              <Row>
                <Col span={9}>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: "small" }}
                  >
                    {trait_type}
                  </Typography.Text>
                </Col>
                <Col span={24}>{value}</Col>
              </Row>
            </Card>
          </Col>
        </>
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
      <Row justify={"space-between"}>
        {token?.attributes?.map(mapAttributes)}
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
                <Image src={token?.image} alt={`${token?.id}_img`} />
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
                        value={`${token?.experience.toLocaleString()} / ${(10000).toLocaleString()} xp`}
                      ></Statistic>
                      <Progress
                        showInfo={false}
                        percent={((token?.experience ?? 0) / 10000) * 100}
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
                    <div style={{ overflow: "auto" }}>
                      <div
                        style={{
                          margin: "auto",
                          width: `${historyTabWidth}px`,
                        }}
                      >
                        {token && embedFusion(token)}
                      </div>
                    </div>
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
