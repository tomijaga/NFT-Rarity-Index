import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { TokenCard, TraitCard, TraitCombination } from "components";
import axios from "axios";
import evolved from "pages/api/tokens/fused";
import {
  Row,
  Col,
  Collapse,
  Card,
  Typography,
  Divider,
  Dropdown,
  Menu,
  Button,
  Grid,
  Input,
  Tag,
  Select,
} from "antd";
import { Gender, Trait, TraitModel } from "models/server/traits";
import { readFileSync, writeFile } from "fs";
import { getCombinedTraits } from "utils/traits";
import { useRouter } from "next/router";

interface Dict<T> {
  [x: string]: T;
}

const formatCombinations = (data: Trait[]) => {
  const formattedCombinations: { [x: string]: Trait[] } = {};

  data.map((trait: Trait) => {
    const trait_type = formattedCombinations[trait.trait_type];
    if (trait_type) {
      const variants = trait.combos.map((combo) => ({
        ...((trait as any).toObject?.() ?? trait),
        combos: [combo],
      }));
      console.log({ variants });
      trait_type.push(...variants);
    } else {
      formattedCombinations[trait.trait_type] = [trait];
    }
  });

  return formattedCombinations;
};

export async function getServerSideProps() {
  const data = await getCombinedTraits();

  return {
    props: {
      combinations: JSON.parse(JSON.stringify(formatCombinations(data))),
    },
  };
}

const TraitCombinationsPage: NextPage<{ combinations: Dict<Trait[]> }> = ({
  combinations,
}) => {
  const router = useRouter();

  const [comboQuery, setComboQuery] = useState("");
  const [outkastId, setOutkastId] = useState(0);
  const setQuery = (id: number) => {
    if (id >= 1 && id <= 10000) {
      router.push(`/combo?id=${id}`);
    } else {
      router.push(`/combo`);
    }
  };

  const [outkastCombinations, setOutkastCombinations] = useState<Dict<Trait[]>>(
    {}
  );

  const [outkastGender, setOutkastGender] = useState<Gender>("female");

  useEffect(() => {
    const getOutkastCombinations = async () => {
      const {
        data: { combinations: combinationsData, token: tokenData },
      } = await axios.get(`/api/tokens/${outkastId}/combinations`);

      setOutkastCombinations(() => {
        const formatted = formatCombinations(combinationsData);
        const gender = tokenData.attributes
          .find(({ trait_type }: any) => trait_type === "Gender")
          .value.toLowerCase();

        console.log(formatted.Gender);
        console.log({ gender });
        setOutkastGender(gender);
        return formatted;
      });
    };

    if (outkastId) {
      getOutkastCombinations();
    }
  }, [outkastId]);

  console.log(router.query);

  useEffect(() => {
    if (router.query.id) {
      const id = Number(router.query.id);
      if (!Number.isNaN(id)) {
        return setOutkastId(id);
      }
    }

    return setOutkastId(0);
  }, [router.query.id]);

  const screens = Grid.useBreakpoint();

  const selectedCombinations =
    outkastId && Object.keys(outkastCombinations).length
      ? outkastCombinations
      : combinations;

  console.log({ outkastGender });

  return (
    <>
      <Col span={24} key="trait combinations">
        <Card>
          <Row justify="space-between" gutter={[20, 20]} align={"middle"}>
            <Col>
              <Typography.Title level={4}>Trait Combinations</Typography.Title>
            </Col>

            <Col>
              {outkastId ? (
                <Tag
                  closable
                  style={{ fontSize: "medium", padding: "2px 10px" }}
                  onClose={() => {
                    setQuery(0);
                  }}
                >
                  Combinations for {outkastId}
                </Tag>
              ) : (
                <Input.Search
                  allowClear
                  placeholder="Enter Outkast Id"
                  onSearch={(value) => {
                    const num = Number(value);
                    if (!Number.isNaN(num)) {
                      if (num >= 1 && num <= 10000) {
                        setQuery(num);
                      }
                    } else {
                      return "";
                    }
                  }}
                />
              )}
            </Col>

            <Col span={24}>
              <Collapse
                defaultActiveKey={["Eyewear"]}
                onChange={() => setComboQuery("")}
                accordion
              >
                {Object.keys(selectedCombinations).map((trait_type) => {
                  const groupedTraits = selectedCombinations[trait_type];
                  const traits_with_combinations: string[] = [];
                  groupedTraits?.forEach((trait) => {
                    const pairs: string[] = [];

                    trait.combos.forEach(({ first, second }) =>
                      pairs.push(first, second)
                    );

                    traits_with_combinations.push(...pairs);
                  });

                  const traitSlectOptions = [];
                  for (const trait_name of new Set(
                    traits_with_combinations
                  ).values()) {
                    traitSlectOptions.push(
                      <Select.Option key={trait_name} value={trait_name}>
                        {trait_name}
                      </Select.Option>
                    );
                  }

                  return (
                    <Collapse.Panel
                      header={trait_type}
                      extra={`${groupedTraits.length} Traits`}
                      key={trait_type}
                    >
                      <Row
                        justify={"space-between"}
                        style={{
                          overflowY: "auto",
                          maxHeight: "70vh",
                          overflowX: "hidden",
                        }}
                      >
                        {trait_type === "Skin" ? (
                          <Col>
                            <Select
                              disabled={!!outkastId}
                              defaultValue={"female"}
                              onChange={(value: Gender) =>
                                setOutkastGender(value)
                              }
                              value={outkastGender}
                            >
                              <Select.Option value={"female"}>
                                Female
                              </Select.Option>
                              <Select.Option value={"male"}>Male</Select.Option>
                            </Select>
                          </Col>
                        ) : (
                          <Col />
                        )}
                        <Col>
                          <Select
                            allowClear
                            placeholder="Search for a trait"
                            onChange={(value) => setComboQuery(value as string)}
                            onClear={() => setComboQuery("")}
                          >
                            {traitSlectOptions}
                          </Select>
                        </Col>
                        <Col span={24}>
                          <Divider style={{ margin: "20px 0px 0px 0px" }} />
                        </Col>

                        {groupedTraits
                          .filter(({ combos }) => {
                            if (comboQuery) {
                              return (
                                combos[0].first === comboQuery ||
                                combos[0].second === comboQuery
                              );
                            }

                            return true;
                          })
                          .map((trait) => {
                            return (
                              <Col span={24}>
                                <TraitCombination
                                  trait={trait}
                                  gender={outkastGender}
                                />
                              </Col>
                            );
                          })}
                      </Row>
                    </Collapse.Panel>
                  );
                })}
              </Collapse>
            </Col>
          </Row>
        </Card>
      </Col>
    </>
  );
};

export default TraitCombinationsPage;
