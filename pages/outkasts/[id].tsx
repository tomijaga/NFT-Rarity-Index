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

  console.log({ depth: minDepth(token) });

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
          <Col>{trait_type}</Col>
          <Col>{value}</Col>
          <Divider />
        </>
      );
    };

    if (token?.fused) {
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
      <Col span={24}>
        <Row gutter={[20, 20]} justify="center">
          <Col span={23} md={9} sm={20} xs={23}>
            <Image src={token?.image} alt={`${token?.id}_img`} />
          </Col>

          <Col span={23} md={15} sm={20} xs={23}>
            <Row justify="space-between" gutter={[10, 10]}>
              <Col span={24}>
                <Row justify="space-between">
                  <Col>
                    <Typography.Link href="https://outkast.world/" strong>
                      WE ARE THE OUTKAST
                    </Typography.Link>
                  </Col>
                  <Col md={12} sm={0}>
                    <Button.Group size="small">
                      <Button
                        onClick={async () => {
                          const result = await axios.get(`/api/update/${id}`);
                          console.log(result);
                        }}
                      >
                        Refresh Metadata
                      </Button>
                      <Button>Opensea</Button>
                      <Button>Outkast Website</Button>
                    </Button.Group>
                  </Col>
                </Row>
              </Col>
              <Col span={24}>
                <Typography.Title level={2}>{token?.name}</Typography.Title>
              </Col>
              <Col span={24}>
                <Statistic title="Id" value={token?.id} />
              </Col>

              <Col span={8}>
                <Statistic
                  title="Rank"
                  value={`#${token?.rank}` ?? "unknown"}
                />{" "}
              </Col>
              <Col span={8}>
                <Statistic
                  title="Rarity Score"
                  value={token?.rarity_score?.toFixed(2) ?? "unknown"}
                />
              </Col>

              <Col span={8}>
                <Statistic title="Level" value={token?.level ?? "unknown"} />
              </Col>
              <Col>
                <Statistic
                  title="Experience"
                  value={`${token?.experience.toLocaleString()} / ${(10000).toLocaleString()} xp`}
                />
                <Progress
                  showInfo={false}
                  percent={((token?.experience ?? 0) / 10000) * 100}
                  format={(xp) => `${10000} xp`}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col span={16} md={9} sm={20} xs={23} style={{}}>
        <Card title="Traits">{getAttributes()}</Card>
      </Col>
      <Col span={16} md={15} sm={20} xs={23}>
        <Card title="Fusion History">
          {/* <Row justify="center" style={{ overflowX: "scroll" }}> */}
          <div style={{ overflow: "auto" }}>
            <div
              // span={24}
              // flex={"1600px"}
              style={{
                margin: "auto",
                width: `${historyTabWidth}px`,
              }}
            >
              {token && embedFusion(token)}
            </div>
          </div>
          {/* </Row> */}
        </Card>
      </Col>
    </>
  );
};

export default TokenDetails;
