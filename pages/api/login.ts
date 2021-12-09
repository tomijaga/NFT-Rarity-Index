// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Cookies from "cookies";

type Data = {
  success: boolean;
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;

  if (method !== "POST") {
    return res.status(400).json({
      success: false,
      message: "Must be a POST request",
    });
  }

  if (req.body === process.env.NEXT_PUBLIC_ADMIN_ID) {
    let cookies = new Cookies(req, res);
    cookies.set("outkast_admin_access", process.env.SECRET_KEY, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production" ? true : false,
      maxAge: 180000, // 30 minutes
    });

    return res.status(200).json({
      success: true,
      message: "You are logged in",
    });
  }
  return res.status(400).json({
    success: false,
    message: "Wrong login details",
  });
}
