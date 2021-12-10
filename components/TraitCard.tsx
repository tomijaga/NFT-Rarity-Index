import React, { FC } from "react";
import { Card, Image } from "antd";
export const TraitCard: FC<{ name: string; image?: string }> = ({
  name,
  image,
}) => {
  return (
    <Card size="small" title={name}>
      <Image
        alt={name.concat("_img")}
        src={image}
        preview={{
          maskClassName: "combination-mask",
        }}
        className="combination-mask"
      />
    </Card>
  );
};
