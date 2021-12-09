import express from "express";
import next from "next";

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });

const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = express();
    server.get("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(3030, () => {
      console.log("server is ready");
    });
  })
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  });
