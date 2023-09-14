import { NextRequest, NextResponse } from "next/server";

let digmanBaseUrl = process.env.DIGMAN_BASEURL;

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const subPath = params.path.join("/");
  const digmanPath = `${req.nextUrl.pathname}${req.nextUrl.search}`.replaceAll(
    "/api/digital-man/",
    "",
  );
  if (digmanBaseUrl.endsWith("/")) {
    digmanBaseUrl = digmanBaseUrl.slice(0, -1);
  }
  const fetchUrl = `${digmanBaseUrl}/${digmanPath}`;
  // 转发请求到外部 API
  const response = await fetch(fetchUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method === "GET" ? null : JSON.stringify(req.body),
  });
  const res = new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
  // // 复制响应头
  // for (const [key, value] of response.headers) {
  //     res.headers.set(key, value);
  // }
  return res;
}

export const GET = handle;
export const POST = handle;
