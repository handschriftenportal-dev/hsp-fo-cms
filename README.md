# Handschriftenportal - CMS client

## Description

This repository contains a [web module](https://github.com/handschriftenportal-dev/hsp-web-module) to display project information texts that are stored in a content management system. It is part of the set of modules that make up the public [web application](https://github.com/handschriftenportal-dev/hsp-fo-app) of the Handschriftenportal.

## Technology stack

* The content to display is managed by a Wordpress server.
* The module is a client side application that internally uses React.
* It implements the Javascript API defined in [hsp-web-module](https://github.com/handschriftenportal-dev/hsp-web-module)

## Status

Alpha (in development)

## Live

https://handschriftenportal.de/cms

## Known issues

* internal links to other WordPress pages only work, when added as described in the [official documentation](https://wordpress.com/support/links/#add-links-to-posts-pages-and-widgets) (second gif)
* internal links do not work with activated Yoast Plugin while adding the link on the WordPress page (see https://github.com/Yoast/wordpress-seo/issues/17035)
* Wordpress widgets don't work

## Getting started

### Requirements

* a WordPress instance (version >=5.5.3) with Plugins [WP REST API V2 Menus](https://de.wordpress.org/plugins/wp-rest-api-v2-menus/) and [WPML Multilingual CMS](https://wpml.org/)
* activated [REST API](https://developer.wordpress.org/rest-api/)
* some WordPress pages added to the advanced menu ([menu location](https://wordpress.com/support/menus/create-a-menu/#menu-locations) "expanded")

### Running the Demo

* set the variable `wordpressEndpoint` in the [server script](/server/start.js) to contain the url of your wordpress instance
* run `npm install` to install all dependencies
* run `npm run build:dev`
* run `npm run start` to start a server
* access http://localhost:8080 in your browser

## Getting help

To get help please use our contact possibilities on [twitter](https://twitter.com/hsprtl)
and [handschriftenportal.de](https://handschriftenportal.de/)

## Getting involved

To get involved please contact our development
team [handschriftenportal@sbb.spk-berlin.de](handschriftenportal-dev@sbb.spk-berlin.de)

## Open source licensing info

The project is published under the [MIT License](https://opensource.org/licenses/MIT).

## Credits and references

1. [Github Project Repository](https://github.com/handschriftenportal-dev)
2. [Project Page](https://handschriftenportal.de/)
3. [Internal Documentation](doc/ARC42.md)
