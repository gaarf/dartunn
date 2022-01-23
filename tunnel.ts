import invariant from "tiny-invariant";
import localtunnel from "localtunnel";
import { createHmac } from "crypto";
import got from "got";

const {
  DARTUNN_LOCAL_PORT,
  DARTUNN_LOCAL_HOST,
  DARTUNN_SUBDOMAIN,
  DARTUNN_WEBHOOK,
  DARTUNN_SECRET,
} = process.env;

invariant(DARTUNN_LOCAL_PORT);
invariant(DARTUNN_WEBHOOK);
invariant(DARTUNN_SECRET);

export default async function () {
  const tunnel = await localtunnel({
    port: Number(DARTUNN_LOCAL_PORT),
    local_host: DARTUNN_LOCAL_HOST,
    subdomain: DARTUNN_SUBDOMAIN,
  });

  const body = JSON.stringify({
    url: tunnel.url,
    timestamp: Date.now(),
  });

  const signature = createHmac("sha256", DARTUNN_SECRET)
    .update(body)
    .digest("hex");

  const webhook = await got
    .post(DARTUNN_WEBHOOK, {
      body,
      method: "POST",
      headers: {
        "X-Webhook-Signature": signature,
        "Content-type": "application/json",
      },
    })
    .then(
      (response) => response.body,
      ({ code }) => console.error(code)
    );

  console.log({ tunnel, webhook });

  tunnel.on("request", (info) => {
    console.log({ info });
  });

  tunnel.on("error", (error) => {
    console.log({ error });
  });
}
