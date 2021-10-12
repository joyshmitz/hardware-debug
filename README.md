# Hardware debug block
**Block to expose hardware features via http api**

## Highlights


## Setup and configuration

Use this as standalone with the button below:

[![template block deploy with balena](https://balena.io/deploy.svg)](https://dashboard.balena-cloud.com/deploy?repoUrl=https://github.com/rcooke-warwick/hardware-debug-block)

Or add the following service to your `docker-compose.yml`:

```yaml
version: "2.1"
services:
  hardware-debug-block:
    restart: always
    privileged: true
    image: ghcr.io/rcooke-warwick/hardware-debug-block:latest
    ports:
      - "80:3000"
```

> If you want to use a webserver exposing a public facing page, you will need to remove the exposed port 80


## Motivation

This block lets you extract hardware information via an easy to use http api, without needing knowledge of the command line tools typically used to get this information. You can also use it to interact with the device hardware, for example to toggle GPIO pins, read/write from an i2c bus, and more.

## Getting Help

If you're having any problem, please [raise an issue](https://github.com/balenablocks/template/issues/new) on GitHub and we will be happy to help.


## License

balenablock-template is free software, and may be redistributed under the terms specified in the [license](https://github.com/balenablockstemplate/blob/master/LICENSE).
