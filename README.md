```
   __         ______     __   __     ______     ______     ______
  /\ \       /\  __ \   /\ "-.\ \   /\  == \   /\  __ \   /\__  _\
  \ \ \____  \ \  __ \  \ \ \-.  \  \ \  __<   \ \ \/\ \  \/_/\ \/
   \ \_____\  \ \_\ \_\  \ \_\\"\_\  \ \_____\  \ \_____\    \ \_\
    \/_____/   \/_/\/_/   \/_/ \/_/   \/_____/   \/_____/     \/_/


                  LANBotX, a botkit-powered LANBot
```

LANBotX is an attempt to rewrite LANBot from the ground up to serve us better

[![dockeri.co](http://dockeri.co/image/rmlynch/lanbotx)](https://hub.docker.com/r/rmlynch/lanbotx/)

## Usage

### With Docker

* install docker
* create `.env` file with proper values
  * `token=<token>`
  * [...]
* start docker
  * `docker-compose up`

### Without Docker

* install redis
* install node dependencies
  * `npm install`
* set environment variables
  * `export token=<slack-token>`
  * [...]
* start development server
  * `npm run dev`
