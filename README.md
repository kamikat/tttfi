# TTTFI

[![npm](https://img.shields.io/npm/v/tttfi.svg?maxAge=2592000)](https://www.npmjs.com/package/tttfi)

Middleware for IFTTT.

## Usage

TTTFI picks up data from IFTTT webhook, pass data through scripts and send output of script back to IFTTT.

**STEP1** Prepare scripts:

Let's write a simple hello world in Python (you can find that in samples folder).

```python
#!/usr/bin/env python2
import json
name = raw_input()
print json.dumps({ "value1": "Hello, %s!" % name })
```

**STEP2** Run docker image:

```
docker run -e API_KEY=<your-ifttt-key> \
           -e SECRET_TOKEN=<secret-token> \
           -v `pwd`/samples:/opt/bin \
           kamikat/tttfi
```

NOTE: Pick up a random string as your `SECRET_TOKEN`.

**STEP3** Setup trigger:

1. Create a webhook trigger <https://ifttt.com/create/if-maker_webhooks?sid=1>
2. Set **Event Name** to `hello` (name of the script)
3. Choose any action service
4. Click **Add ingredient** and select `Value1` on any field of the service that supports it

Test your configuration by sending some data using curl

```
echo 'world' | curl -XPOST -d- https://your-domain.com/hello/secret/<secret-token>
```

**STEP4** Setup action:

1. Create trigger with any service <https://ifttt.com/create> (Telegram for example)
2. Choose **Webhooks** service to create an action
3. Set the url (for example `https://your-domain.com/hello/secret/<secret-token>`)
4. Set **Method** to `POST` and **Content Type** to `text/plain` (the `hello` event requires simple text)
5. Add any ingredient to **body**

## License

(The MIT License)
