# Hardware debug block
**Block to expose hardware features via http api**

## Setup and configuration

Use this as standalone with the button below:

[![template block deploy with balena](https://balena.io/deploy.svg)](https://dashboard.balena-cloud.com/deploy?repoUrl=https://github.com/rcooke-warwick/hardware-debug)

Or add the following service to your `docker-compose.yml`:

```yaml
version: "2.1"
services:
  hardware-debug:
    restart: always
    privileged: true
    image: ghcr.io/rcooke-warwick/hardware-debug:latest
    ports:
      - "80:3000"
```

> If you want to use a webserver exposing a public facing page, you will need to remove the exposed port 80

## Documentation

This block lets you extract hardware information via an easy to use http api, without needing knowledge of the command line tools typically used to get this information. You can also use it to interact with the device hardware, for example to toggle GPIO pins, read/write from an i2c bus, and more.

For example, to retreive all i2c buses, you can make a `GET`:

```bash
curl <DEVICE_URL>/i2c/buses 
```

And to get all i2c devices connected to a bus:

```bash
curl -X POST -H "Content-Type: application/json" \
    -d '{"bus": <BUS_NUMBER}' \
    <DEVICE_URL>/i2c/detect
```

To see what other endpoints are available, check the `lib/index.js` file.

## Getting Help

If you're having any problem, please [raise an issue](https://github.com/rcooke-warwick/hardware-debug) on GitHub and we will be happy to help.

## License

balenablock-template is free software, and may be redistributed under the terms specified in the [license](https://github.com/rcooke-warwick/hardware-debug/blob/master/LICENSE).
