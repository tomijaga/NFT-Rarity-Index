import Col from "antd/lib/col";
import Grid from "antd/lib/grid";
import Layout from "antd/lib/layout";
import Menu from "antd/lib/menu";
import Link from "next/link";
import Row from "antd/lib/row";
import Typography from "antd/lib/typography";
import { useRouter } from "next/router";
import React, { FC } from "react";

// import dynamic from 'next/dynamic'
// const Layout = dynamic(import('antd/es/row'), { ssr: false })

export const PageComponent: FC = ({ children }) => {
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const horizontalPadding = screens.sm ? "20px" : "10px";
  return (
    <Layout>
      <Layout.Header
        style={{
          padding: `${screens.sm ? "0px" : "0px"} ${horizontalPadding}`,
        }}
      >
        <Row
          align="middle"
          justify={screens.sm ? "start" : "space-between"}
          gutter={20}
          style={{ height: "100%" }}
        >
          <Col>
            <Typography.Title
              level={4}
              style={{ padding: "0px", margin: "0px" }}
            >
              {screens.sm ? "WE ARE THE OUTKASTS " : "W.A.T.O "}
              🤺
            </Typography.Title>
          </Col>

          <Col sm={9}>
            <Menu
              mode="horizontal"
              style={{
                background: "transparent",
                margin: "0px",
                padding: "0px",
              }}
            >
              <Menu.Item key="fusions">
                <Link href="/fusions">
                  <a>Fusions</a>
                </Link>
              </Menu.Item>
              <Menu.Item key="combo">
                <Link href="/combo">
                  <a>Trait Combos</a>
                </Link>
              </Menu.Item>
            </Menu>
          </Col>

          {/* <Col sm={9} span={16} xs={16}>
            <Input.Search
              placeholder="Search name or id "
              enterButton
              onSearch={(value) => {
                if (value) {
                  const id = Number(value);
                  if (!Number.isNaN(id)) {
                    if (id <= 10000 && id > 0) {
                      router.push(`/outkasts/${value}`);
                    } else {
                      router.push(`/?id=${value}`);
                    }
                  } else {
                    router.push(`/?name=${value}`);
                  }
                }
              }}
            />
          </Col> */}
        </Row>
      </Layout.Header>
      <Layout.Content>
        <Row
          justify="space-between"
          gutter={[20, 20]}
          style={{ padding: `20px ${horizontalPadding}`, margin: "0px" }}
        >
          {children}
        </Row>
      </Layout.Content>
    </Layout>
  );
};
