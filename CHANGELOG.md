# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
as of 2.0.0.

## [Unreleased]

### Added

- Add author biographies and portraits from Wikipedia with `--with-author-details` (#31)
- Add support for sources without popularity: the source declares it, `config.json` carries the flag, and the UI hides flames and the most popular book and falls back to alphabetical sorting (#14)

### Fixed

- Promote Wikisource `issued` to standard `published` metadata (#10)
- Wikisource: stop offering the withdrawn `xhtml` format, and fail early when a requested format is not offered by ws-export (#11)

## [1.0.0] - 2026-09-25

- initial version of `papers` scraper, successor of `gutenberg` scraper with support for multiple sources and a brand new Vue.JS UI
