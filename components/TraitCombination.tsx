import React, { FC } from "react";
import { Col, Card, Row, Grid, Divider } from "antd";
import { TraitCard } from "components";
import { Trait, Gender } from "models/server/traits";
import { chooseRandomly } from "utils";

const getTraitImageUrl = (
  trait_type: string,
  trait_value: string,
  gender: Gender = "female"
) => {
  let traitType = trait_type.toLowerCase().split(" ").join();
  if (
    traitType !== "eyewear" &&
    traitType !== "hair" &&
    traitType !== "background"
  ) {
    traitType = traitType.endsWith("s") ? traitType : traitType.concat("s");
  }

  let traitValue = trait_value.split("'").join("_");
  if (traitValue === "Fierce Side-Swept") {
    traitValue = "Fierce Side-swept";
  }
  if (traitType === "skins") {
    return `https://outkast.world/traits/${traitType}/${gender}/${traitValue}.png`;
  }
  return `https://outkast.world/traits/${traitType}/${traitValue}.png`;
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
