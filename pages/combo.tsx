import {
  Card,
  Col,
  Collapse,
  Divider,
  Input,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import axios from "axios";
import { TraitCombination } from "components";
import { Gender, Trait } from "models/server/traits";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getHost } from "utils";

interface Dict<T> {
  [x: string]: T;
}

const formatCombinations = (data: Trait[]) => {
  const formattedCombinations: { [x: string]: Trait[] } = {};
  data.map((trait: Trait) => {
    const trait_type = formattedCombinations[trait.trait_type];
    if (trait_type) {
      trait_type.push(trait);
    } else {
      formattedCombinations[trait.trait_type] = [trait];
    }
  });

  return formattedCombinations;
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  res,
}) => {
  const url = getHost();
  // console.log({ res });

  if (query?.id) {
    const outkastId = Number(query?.id);
    if (outkastId >= 1 && outkastId <= 10000) {
      const {
        data: { combinations: combinationsData, token: tokenData },
      } = await axios.get(`${url}/api/tokens/${outkastId}/combinations`);

      return {
        props: {
          combinations: JSON.parse(
            JSON.stringify(formatCombinations(combinationsData))
          ),
          outkastId,
          gender: tokenData.attributes
            .find(({ trait_type }: any) => trait_type === "Gender")
            .value.toLowerCase(),
        },
      };
    }
  }

  const { data } = await axios.get(`${url}/api/traits/combo`);

  return {
    props: {
      combinations: JSON.parse(JSON.stringify(formatCombinations(data))),
    },
  };
};

const TraitCombinationsPage: NextPage<{
  combinations: Dict<Trait[]>;
  outkastId: number | undefined;
  gender: Gender;
}> = ({ combinations, gender, outkastId }) => {
  const router = useRouter();

  const [comboQuery, setComboQuery] = useState("");
  const setOukastId = (id: number) => {
    if (id >= 1 && id <= 10000) {
      router.push(`/combo?id=${id}`);
    } else {
      router.push(`/combo`);
    }
  };

  const [outkastGender, setOutkastGender] = useState<Gender>(gender);

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
                    setOukastId(0);
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
                        setOukastId(num);
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
                {Object.keys(combinations).map((trait_type) => {
                  const groupedTraits = combinations[trait_type];
                  const traits_with_combinations: string[] = [];
                  groupedTraits?.forEach((trait) => {
                    const [{ first, second }] = trait.combos;

                    traits_with_combinations.push(first, second);
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
                        justify={"start"}
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
                        <Col style={{ marginLeft: "auto" }}>
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
                              <Col span={24} lg={24} xl={12} xxl={8}>
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
