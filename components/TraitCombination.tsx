import React, { FC } from "react";
import { Col, Card, Row, Grid, Divider, Tag } from "antd";
import { TraitCard } from "components";
import { Trait, Gender } from "models/server/traits";
import { chooseRandomly } from "utils";

const getTraitImageUrl = (
  trait_type: string,
  trait_value: string,
  gender: Gender = "female"
) => {
  let replace: NodeJS.Dict<string> = {
    Weapon: "Weapons",
  };
  trait_type = replace[trait_type] || trait_type;

  let traitValue = trait_value.split("'").join("_");

  if (trait_type === "Skin" && gender == "female") {
    return `https://outkast.world/traits/${"Female Skin"}/${traitValue}.png`;
  }
  return `https://outkast.world/traits/${trait_type}/${traitValue}.png`;
};

export const TraitCombination: FC<{
  trait: Trait;
  gender?: Gender;
}> = ({ trait, gender }) => {
  const screens = Grid.useBreakpoint();

  const traitGender =
    trait.trait_type === "Skin"
      ? gender ?? chooseRandomly(["female", "male"])
      : null;

  const getCurrentTraitImage = (trait_value: string) =>
    getTraitImageUrl(trait.trait_type, trait_value, gender);

  const [combo, trait_1, trait_2] = [
    trait.value.toString(),
    trait.combos[0].first,
    trait.combos[0].second,
  ];

  return (
    <Card size="small">
      <Row gutter={20}>
        {trait.levelRequirement && (
          <Col>
            <span>Level {trait.levelRequirement} Required</span>
          </Col>
        )}
        {trait.date > Date.now() - 3600 * 60 * 24 * 7 * 5 && (
          <Col>
            {" "}
            <Tag color="green"> Recently Added</Tag>
          </Col>
        )}
      </Row>

      {screens.sm ? (
        <Row align="middle" justify="space-between" style={{ padding: "20px" }}>
          <Col span={6}>
            <TraitCard name={trait_1} image={getCurrentTraitImage(trait_1)} />
          </Col>
          <Col span={6}>
            <TraitCard name={trait_2} image={getCurrentTraitImage(trait_2)} />
          </Col>
          <Col>
            <Divider style={{ height: "150px" }} type="vertical" />
          </Col>
          <Col span={6}>
            <TraitCard
              name={trait.value.toString()}
              image={getCurrentTraitImage(combo)}
            />
          </Col>
        </Row>
      ) : (
        <Row
          align="middle"
          justify="space-around"
          gutter={[10, 10]}
          style={{ padding: "20px 0px" }}
        >
          {" "}
          <Col span={11}>
            <TraitCard name={trait_1} image={getCurrentTraitImage(trait_1)} />
          </Col>
          <Col span={11}>
            <TraitCard name={trait_2} image={getCurrentTraitImage(trait_2)} />
          </Col>{" "}
          <Col xs={24}></Col>
          <Col span={16}>
            <TraitCard name={combo} image={getCurrentTraitImage(combo)} />
          </Col>
        </Row>
      )}
    </Card>
  );
};
