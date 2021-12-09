import React, { FC, useEffect, useState, ReactNode } from "react";
import type { NextPage } from "next";
import {
  Button,
  Card,
  Row,
  Col,
  Image,
  Typography,
  Radio,
  Form,
  Input,
  Skeleton,
  Empty,
  Grid,
  Collapse,
} from "antd";
import axios from "axios";
import { Attribute, Token } from "../models/server/tokens";
import { TraitType } from "../models/server/trait-type";
import { TokenCard } from "components";

const FusePage: NextPage = () => {
  const [tokenId1, setTokenId1] = useState(0);
  const [token1, setToken1] = useState<Token>();

  const [tokenId2, setTokenId2] = useState(0);
  const [token2, setToken2] = useState<Token>();

  const [fusedData, setFusedData] = useState({ rank: 0, rarity_score: 0 });

  const screens = Grid.useBreakpoint();
  const emptyTokenCard = (
    <Card>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Enter token id"
      />
    </Card>
  );
  const formHandler = async (data: { [P in TraitType]: string | number }) => {
    const traits: Attribute[] = [];
    for (const datum of Object.entries(data)) {
      if (datum[1]) {
        console.log(datum);

        traits.push({
          trait_type: datum[0] as TraitType,
          value: datum[1],
        });
      }
    }

    let { data: apiResult } = await axios.post(`./api/rarity`, traits);

    setFusedData(apiResult);
  };

  const getTokenData = (id: number, setterFn: (data: Token) => void) => {
    if (id >= 1 && id <= 10000) {
      axios.get(`./api/tokens/${id}`).then(({ data }) => {
        setterFn(data);
      });
    }
  };

  useEffect(() => {
    getTokenData(tokenId1, setToken1);
  }, [tokenId1]);

  useEffect(() => {
    getTokenData(tokenId2, setToken2);
  }, [tokenId2]);

  const displayTraits = () => {
    const MAX_TRAITS = 13;
    const components: ReactNode[] = [];
    let gender1, gender2;
    for (let i = 0; i < MAX_TRAITS; i += 1) {
      const trait1 = !token1?.fused ? token1?.attributes?.[i] : null;
      const trait2 = !token2?.fused ? token2?.attributes?.[i] : null;

      const trait_type = trait1?.trait_type ?? trait2?.trait_type;
      const defaultValue = trait1?.value ?? trait2?.value;
      const disableLevel = trait_type === "Level";

      if (trait_type === "Gender") {
        gender1 = trait1?.value;
        gender2 = trait2?.value;
      } else {
        components.push(
          <Col span={24}>
            <Form.Item
              key={trait_type}
              tooltip="THe clothes determine te"
              label={
                trait_type === "Clothes"
                  ? trait_type.concat(" (Gender)")
                  : trait_type
              }
              name={trait_type}
            >
              <Radio.Group value={defaultValue}>
                {trait1 && (
                  <Radio
                    disabled={disableLevel || !trait1?.value}
                    value={trait1?.value}
                  >
                    {trait_type === "Clothes"
                      ? (trait1?.value as string).concat(` (${gender1})`)
                      : trait1?.value}
                  </Radio>
                )}
                {trait2 && (
                  <Radio
                    disabled={disableLevel || !trait2?.value}
                    value={trait2?.value}
                  >
                    {trait_type === "Clothes"
                      ? (trait2?.value as string).concat(` (${gender2})`)
                      : trait2?.value}
                  </Radio>
                )}
              </Radio.Group>
            </Form.Item>
          </Col>
        );
      }
    }

    return components;
  };
  return (
    <Form onFinish={formHandler} layout="vertical">
      <Row style={{ padding: "20px" }} gutter={[20, 20]}>
        <Col md={16} sm={24} span={24}>
          <Row justify="center" gutter={[0, 30]}>
            <Col span={12}>
              <Input.Search
                placeholder="xxxx"
                allowClear
                onSearch={(value) => setTokenId1(Number(value))}
              />
              {token1 ? (
                <TokenCard preview={false} hoverable={false} token={token1} />
              ) : (
                emptyTokenCard
              )}
            </Col>
            <Col span={12}>
              <Input.Search
                placeholder="xxxx"
                allowClear
                onSearch={(value) => setTokenId2(Number(value))}
              ></Input.Search>
              {token2 ? (
                <TokenCard preview={false} hoverable={false} token={token2} />
              ) : (
                emptyTokenCard
              )}
            </Col>
            <Col>
              <Button htmlType="submit">Submit</Button>
            </Col>
            <Col span={24} style={{ textAlign: "center" }}>
              <Typography.Title level={2}>
                Fused Rank: #{fusedData.rank === 0 ? "-" : `${fusedData.rank} `}{" "}
              </Typography.Title>

              <Typography.Title level={5} type="secondary">
                (rarity score: {fusedData.rarity_score.toFixed(2)})
              </Typography.Title>
            </Col>
          </Row>
        </Col>

        <Col md={8} sm={24} span={24}>
          <Card title="Select Traits">
            <Row
              style={{
                height: screens.md ? "85vh" : "60vh",
                overflow: "auto",
              }}
            >
              {displayTraits()}
            </Row>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default FusePage;
