import { Card, Col, Image as AntdImage, Row, Tooltip, Typography } from "antd";
import { Token } from "models/server/tokens";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";

export const TokenCard: FC<{
  token?: Token;
  width?: number;
  hoverable?: boolean;
  preview?: boolean;
  showS3Image?: boolean;
  link?: boolean;
}> = ({
  token,
  width,
  hoverable = true,
  preview = true,
  showS3Image,
  link = true,
}) => {
  const no_of_fusions = token?.fusedWith.length;

  const linkWrapper = (element: any, addLink: boolean) =>
    !addLink ? (
      element
    ) : (
      <Link key={token?.id} href={`/outkasts/${token?.id}`} passHref>
        {element}
      </Link>
    );

  return linkWrapper(
    <Card
      size="small"
      hoverable={hoverable}
      style={{
        width: width ?? "100%",
        padding: "0px",
        margin: "0px",
        height: "100%",
        cursor: link ? "pointer" : "",
      }}
    >
      {no_of_fusions ? (
        <div style={{ position: "absolute", top: "0px", right: "0px" }}>
          <Tooltip
            title={` ${no_of_fusions} Fusion${no_of_fusions > 1 ? "s" : ""}`}
          >
            <Typography.Text strong code style={{ margin: "0px" }}>
              ✕{no_of_fusions}
            </Typography.Text>
          </Tooltip>
        </div>
      ) : null}
      <Typography.Title level={5} style={{ padding: "0px", margin: "0" }}>
        {token?.name}
      </Typography.Title>
      <Typography.Text>{token?.id}</Typography.Text>

      <AntdImage
        onClick={(e) => e.stopPropagation()}
        src={showS3Image ? token?.s3_image : token?.image}
        fallback={token?.image}
        alt={`Outkast loading... 📸`}
        preview={preview}
      />
      <Row justify="space-between" align="middle">
        {token?.level && (
          <Col>
            <Typography.Text style={{ fontSize: "small" }} strong code>
              Level {token.level}
            </Typography.Text>{" "}
          </Col>
        )}

        <Col>
          <Tooltip title="Rarity Rank">
            {token?.rank && (
              <Typography.Text style={{ fontSize: "large" }} strong code>
                #{token.rank}
              </Typography.Text>
            )}
          </Tooltip>
        </Col>
      </Row>
    </Card>,
    link
  );
};
