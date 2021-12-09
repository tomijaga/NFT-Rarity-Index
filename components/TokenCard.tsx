import { Card, Col, Image, Row, Tooltip, Typography } from "antd";
import { Token } from "models/server/tokens";
import { useRouter } from "next/router";
import React, { FC } from "react";

export const TokenCard: FC<{
  token?: Token;
  width?: number;
  hoverable?: boolean;
  preview?: boolean;
}> = ({ token, width, hoverable = true, preview = true }) => {
  const router = useRouter();

  console.log({ token });
  return (
    <Card
      size="small"
      hoverable={hoverable}
      style={{
        width: width,
        padding: "0px",
        margin: "0px",
        // height: "100%",
      }}
      onClick={() => {
        if (hoverable) {
          router.push(`/outkasts/${token?.id}`);
        }
      }}
    >
      {token?.fusedWith.length ? (
        <div style={{ position: "absolute", top: "0px", right: "0px" }}>
          <Tooltip title="Fusions">
            <Typography.Text strong code style={{ margin: "0px" }}>
              ✕{token?.fusedWith.length}
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
        src={token?.image}
        alt={`Outkast ${token?.id} 📸`}
        preview={preview}
      />
      <Row justify="space-between" align="middle">
        {token?.level && <Col>Level {token.level}</Col>}

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
