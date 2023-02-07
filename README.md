<h1 align="center">
    Corona Warn App - Common Covid Logic (CCL)
</h1>

<p align="center">
    <a href="#about-this-repository">About this Repository</a> •
    <a href="#support-and-feedback">Support and Feedback</a> •
    <a href="#how-to-contribute">How to Contribute</a> •
    <a href="#licensing">Licensing</a>
</p>

## About this Repository

Common Covid Logic (CCL) describes a layer of common logic - especially regarding the interpretation of Digital COVID Certificates (DCCs) - that can be shared across different operating systems and implementations.

The logic in CCL is described in JSON format. An engine processes the logic on the client against a defined input structure (e.g. the set of DCCs) and can expect a defined output structure. The client can update the JSON regularly from a server. This facilitates updates to CCL independent of client releases, e.g. in order to respond to legal or regulatory pandemic-related changes on short notice.

The respective engine - JsonFunctions - is available as library:

- [corona-warn-app/cwa-kotlin-jfn](https://github.com/corona-warn-app/cwa-kotlin-jfn) for Android
- [corona-warn-app/json-functions-swift](https://github.com/corona-warn-app/json-functions-swift) for iOS

## Development

### Requirements

You need the Node.js >=16 version of [Node.js](https://nodejs.org/en/) (which includes npm).

### Test and Build

To run the automated tests, execute the following command in the root directory of the project:

```bash
npm test
```

To build the artifacts, execute the following command in the root directory of the project:

```bash
npm run build
```

The artifacts are placed in the `dist` directory (created if not existing yet).

### Important Files and Directories

- `lib/ccl/functions` contains the JsonFunction descriptions. Note that when a new function is added, it also needs to be registered in `lib/ccl/ccl-jfn.js`

- `lib/jfn` contains an implementation of JsonFunctions

- `resources/i18n/de` contains the leading UI texts. The texts of other languages are generated via the translation system and should not be changed manually.

- `resources/json-schema` contains various JSON schema definitions

- `scripts` contains scripts for building and packaging CCL

- `test/dist` contains tests that are executed after `npm run build` on the resulting artifacts

- `test/fixtures` contains test data for automated tests

- `test/fixtures/ccl/dcc-series-*.yaml` describe series of DCCs and how they should be interpreted by CCL


## Support and Feedback

The following channels are available for discussions, feedback, and support requests:

| Type                     | Channel                                                |
| ------------------------ | ------------------------------------------------------ |
| **General discussion, issues, bugs**   | <a href="https://github.com/corona-warn-app/cwa-app-ccl/issues/new/choose" title="General Discussion"><img src="https://img.shields.io/github/issues/corona-warn-app/cwa-app-ccl?style=flat-square"></a> |
| **Other requests**    | <a href="mailto:corona-warn-app.opensource@sap.com" title="Email CWA Team"><img src="https://img.shields.io/badge/email-CWA%20team-green?logo=mail.ru&style=flat-square&logoColor=white"></a> |

## How to Contribute

Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](./CONTRIBUTING.md). By participating in this project, you agree to abide by its [Code of Conduct](./CODE_OF_CONDUCT.md) at all times.

## Contributors

The German government has asked SAP and Deutsche Telekom to develop the Corona-Warn-App for Germany as open source software. Deutsche Telekom is providing the network and mobile technology and will operate and run the backend for the app in a safe, scalable and stable manner. SAP is responsible for the app development, its framework and the underlying platform. Therefore, development teams of SAP and Deutsche Telekom are contributing to this project. At the same time our commitment to open source means that we are enabling -in fact encouraging- all interested parties to contribute and become part of its developer community.

## Repositories

A list of all public repositories from the Corona-Warn-App can be found [here](https://github.com/corona-warn-app/cwa-documentation/blob/master/README.md#repositories).

## Licensing

Copyright (c) 2020-2023 SAP SE or an SAP affiliate company.

Licensed under the **Apache License, Version 2.0** (the "License"); you may not use this file except in compliance with the License.

You may obtain a copy of the License from [here](./LICENSE).

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific language governing permissions and limitations under the License.

Please see the [detailed licensing information](https://api.reuse.software/info/github.com/corona-warn-app/cwa-app-ccl) via the [REUSE Tool](https://reuse.software/) for more details.
