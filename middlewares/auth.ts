// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  success: boolean;
  message: string;
};

export default function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { method } = req;

  if (method !== "POST") {
    return res
      .status(400)
      .json({ success: false, message: "Only POST requests are allowed." });
  }

  if (req.cookies && req.cookies.outkast_admin_access) {
    let token = req.cookies.outkast_admin_access;

    if (token !== process.env.SECRET_KEY) {
      return res
        .status(400)
        .json({ success: false, message: "You are not logged in" });
    }
  }
}
