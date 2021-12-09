import React, { useEffect, useState } from "react";
import type { NextPage } from "next";
import { TokenCard } from "components";
import axios from "axios";
import evolved from "pages/api/tokens/fused";
import { Row, Col } from "antd";
import { Token } from "models/server/tokens";

const EvolvedOutkastsPage: NextPage = () => {
  const [fusedTokens, setTusedokens] = useState<Token[]>([]);

  useEffect(() => {
    const getFusedTokens = async () => {
      const { data } = await axios.get("/api/tokens/decommissioned");
      setTusedokens(data);
    };
    getFusedTokens();
  }, []);

  return (
    <>
      {fusedTokens.map((token) => (
        <Col>
          <TokenCard token={token} width={150} />
        </Col>
      ))}
    </>
  );
};

export default EvolvedOutkastsPage;
