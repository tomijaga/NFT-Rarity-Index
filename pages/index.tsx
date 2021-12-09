import { Col } from "antd";
import axios from "axios";
import { TokenCard } from "components";
import { Token } from "models/server/tokens";
import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
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
