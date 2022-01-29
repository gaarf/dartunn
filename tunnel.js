const invariant = require("tiny-invariant");
const localtunnel = require("localtunnel");
const { createHmac } = require("crypto");
const got = require("got");

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

module.exports = async function () {
  const timestamp = Date.now();

  const tunnel = await localtunnel({
    port: Number(DARTUNN_LOCAL_PORT),
    local_host: DARTUNN_LOCAL_HOST,
    subdomain: `${DARTUNN_SUBDOMAIN}-${timestamp}`,
  });

  const body = JSON.stringify({
    url: tunnel.url,
    timestamp,
  });

  const signature = createHmac("sha256", DARTUNN_SECRET)
    .update(body)
    .digest("hex");

  console.log({ DARTUNN_WEBHOOK, body, signature });

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
      (response) => console.log(response.body),
      ({ code }) => console.error(code)
    );

  tunnel.on("request", (info) => {
    console.log({ info });
  });

  tunnel.on("error", (error) => {
    console.log({ error });
  });
}
