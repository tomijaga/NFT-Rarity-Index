import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { TokenCard } from "components";
import axios from "axios";
import evolved from "pages/api/tokens/fused";
import { Row, Col } from "antd";
import { Token } from "models/server/tokens";
const EvolvedOutkastsPage: NextPage = () => {
  const [outkasts, setOutkasts] = useState<Token[]>([]);

  useEffect(() => {
    const getOutkasts = async () => {
      const { data } = await axios.get("/api/tokens?limit=50");
      setOutkasts(data);
    };
    getOutkasts();
  }, []);

  return (
    <>
      {outkasts.map((outkast) => (
        <Col>
          <TokenCard token={outkast} width={150} />
        </Col>
      ))}
    </>
  );
};

export default EvolvedOutkastsPage;