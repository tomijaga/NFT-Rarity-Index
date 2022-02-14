import { Card, Col, Image, Row, Tooltip, Typography } from "antd";
import { Token } from "models/server/tokens";
import React, { FC } from "react";

export const TokenCard: FC<{
  token?: Token;
  width?: number;
  hoverable?: boolean;
  preview?: boolean;
  showS3Image?: boolean;
}> = ({ token, width, hoverable = true, preview = true, showS3Image }) => {
  const no_of_fusions = token?.fusedWith.length;

  return (
    <Card
      size="small"
      hoverable={hoverable}
      style={{
        width: width ?? "100%",
        padding: "0px",
        margin: "0px",
        height: "100%",
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

      <Image
        onClick={(e) => e.stopPropagation()}
        src={showS3Image ? token?.s3_image : token?.image}
        alt={`Outkast ${token?.id} 📸`}
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
    </Card>
  );
};
