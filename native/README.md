FirefoxPWA - Native
===================

The native part of the FirefoxPWA project.

## Description

The native part is written in Rust and handles the parts that the extension cannot do alone. This includes installing Firefox runtime, patching it with the chrome modifications, installing the sites, and launching them. This can be done via the `firefoxpwa` console program, or via the browser extension that connects with this program using native messaging protocol for easier use.

The native part also contains browser chrome (UI) modifications written in JS and CSS to make the browser work as a standalone PWA: Hiding tab and address bar, re-arranging widgets, handling the site scope, and applying system integration.

Read the [main README file](../README.md) for more details about the project.

## Installation

### Supported Operating Systems

* Windows (pre-built MSI installer & source installation)
* Debian-like Linux (pre-built DEB package & source installation)
* Other Linux (source installation)
* ~~macOS~~ (to be added in the future)

### From Release Binaries

You can download installers/packages and the shell completions from the [latest GitHub release](https://github.com/filips123/FirefoxPWA/releases/latest).

On Windows, you will need to install the [Visual C++ Redistributable](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads) package.

### From Development Binaries

You can download and install [latest build artifact](https://github.com/filips123/FirefoxPWA/actions/workflows/native.yaml) from GitHub Actions builds. Note that these are development versions that may be unstable.

On Windows, you will need to install the [Visual C++ Redistributable](https://support.microsoft.com/en-us/help/2977003/the-latest-supported-visual-c-downloads) package.

### From Source

#### Windows

1. Install the Rust language and Git.
2. Install [`cargo-wix`](https://github.com/volks73/cargo-wix) (you need to install it directly from repository).
3. Clone the repository and cd into the `native` (this) directory.
4. Generate WiX configuration for UserChrome modifications:
   ```shell
   heat dir userchrome -o wix/userchrome.wxs -scom -frag -srd -sreg -gg -cg UserChrome -var wix.UserChromeSource -dr UserChromeDir
   ```
5. Build the project in release mode and package it as an MSI installer:
   ```shell
   cargo wix
   ```
6. Run the installer from the `target/wix` directory.

#### Debian-like Linux

1. Install the Rust language and Git.
2. Install [`cargo-deb`](https://github.com/mmstick/cargo-deb).
3. Clone the repository and cd into the `native` (this) directory.
4. Build the project in release mode and package it as a DEB package:
   ```shell
   cargo deb
   ```
5. Install the DEB package from the `target/debian` directory.

#### Other Linux

1. Install the Rust language and Git.
2. Clone the repository and cd into the `native` (this) directory.
3. If building a specific version:
    1. Checkout the correct Git tag.
    2. Modify `version` field inside `Cargo.toml` to the correct version.
    3. Modify `DISTRIBUTION_VERSION` variable inside `userchrome/profile/chrome/pwa/chrome.jsm` to the correct version.
4. Build the project in release mode:
   ```shell
   cargo build --release
   ```
5. Copy the built files to the correct locations:
    * `target/release/firefoxpwa` -> `/usr/bin/firefoxpwa`
    * `target/release/firefoxpwa-connector` -> `/usr/libexec/firefoxpwa-connector`
    * `manifests/linux.json` -> `/usr/lib/mozilla/native-messaging-hosts/firefoxpwa.json`
    * `manifests/linux.json` -> `/usr/lib64/mozilla/native-messaging-hosts/firefoxpwa.json`
    * `userchrome/` -> `/usr/share/firefoxpwa/userchrome/`
6. Create an empty directory `/usr/share/firefoxpwa/runtime/` and make it writable by normal users (`777`).
   This is needed for FirefoxPWA runtime installation and Firefox auto-updates to work.
   If you do not plan to use Firefox auto-updates, you can restore the permissions after the runtime is installed.

You can also run the below commands to do this automatically (except Rust and Git installation):

```shell
# Clone the repository and switch into the correct directory
git clone https://github.com/filips123/FirefoxPWA.git
cd FirefoxPWA/native

# Optional: Building a specific version
# Set the VERSION environment variable
git checkout tags/v${VERSION}
sed -i "s/version = \"0.0.0\"/version = \"$VERSION\"/g" Cargo.toml
sed -i "s/DISTRIBUTION_VERSION = '0.0.0'/DISTRIBUTION_VERSION = '$VERSION'/g" userchrome/profile/chrome/pwa/chrome.jsm

# Build the project in release mode
cargo build --release

# Copy the files to the correct locations
sudo install -D target/release/firefoxpwa /usr/bin/firefoxpwa
sudo install -D target/release/firefoxpwa-connector /usr/libexec/firefoxpwa-connector
sudo install -D manifests/linux.json /usr/lib/mozilla/native-messaging-hosts/firefoxpwa.json
sudo install -D manifests/linux.json /usr/lib64/mozilla/native-messaging-hosts/firefoxpwa.json

# Copy the userchrome directory to the correct location
sudo mkdir -p /usr/share/firefoxpwa/userchrome/
sudo cp -R userchrome/* /usr/share/firefoxpwa/userchrome/

# Create an empty runtime directory and make it writable by normal users
sudo mkdir -p /usr/share/firefoxpwa/runtime/
sudo chmod 777 /usr/share/firefoxpwa/runtime/
```

If you want to modify the installation or runtime directory, you will also need to modify the source code before building. Check [the FAQ in the repository wiki](https://github.com/filips123/FirefoxPWA/wiki/Frequently-Asked-Questions) for more details.

## Usage

### Runtime Management

Before you can use this project, you need to download and install Firefox browser runtime:

```shell
firefoxpwa runtime install
```

The runtime will be completely separated from your main Firefox installation.

To install runtime on Windows, you will need [7-Zip](https://7-zip.org/) installed. Installing the runtime will automatically trigger the 7-Zip installer if needed. This may require accepting User Account Control prompt. You can also manually install 7-Zip or use your existing 7-zip installation. After the runtime is installed, you can delete 7-Zip manually.

You can also uninstall the runtime, but you won't be able to use this project again until you install it back:

```shell
firefoxpwa runtime uninstall
```

### Profile Management

By default, all PWA sites will be installed to a common profile with ID `00000000000000000000000000`. You can also create separate isolated profiles and install sites there. This means you can also install multiple instances of the same site with different accounts.

* To create a new separate profile:

  ```shell
  firefoxpwa profile create --name PROFILE-NAME --description PROFILE-DESCRIPTION
  ```

  Both the name and description arguments are optional. This will create a new profile directory and return its ID. You will need that ID to later install the sites into a profile or remove it.

* To remove an existing profile:

  ```shell
  firefoxpwa profile remove ID
  ```

  This will completely remove the profile and all sites installed in it, including all user data. You might not be able to fully recover this action. Note that a default profile cannot be completely removed, and trying to remove it will just clear all sites and user data, but keep a profile ID in the profile list.

* To update an existing profile:

   ```shell
   firefoxpwa profile update ID --name NEW-PROFILE-NAME --description NEW-PROFILE-DESCRIPTION
   ```
  
   This will just change your profile name and description, while keeping the ID and all sites intact.

* To view all available profiles and installed sites:

  ```shell
  firefoxpwa profile list
  ```

  This will print all your profiles and sites installed in them, including their IDs. You will need profile IDs to install a new site into a separate profile or remove a profile, and site IDs to launch or remove sites.

### Site Management

* To install a site:

  ```shell
  firefoxpwa site install MANIFEST-URL --profile PROFILE-ID
  ```

  The profile is optional and will default to a common profile. There are also some other options, you can check them in the program help. This will download the site manifest, parse it and register the site. It will also return the ID of the site that you will need to launch it.

* To uninstall a site:

  ```shell
  firefoxpwa site uninstall ID
  ```

  This will uninstall the site and remove it from the list. However, site data will stay and will be reused if you later install it again in the same profile. To clear the data, do that through a browser, or also remove a profile.

* To launch a site:

  ```shell
  firefoxpwa site launch ID
  ```

  This will launch the Firefox browser runtime and open the site.

### Other

This project provides shell completion files for Bash, Elvish, Fish, PowerShell, and Zsh. On Windows, all completions are automatically installed into the `completions` directory in your chosen installation directory, but you will need to manually include them in your shell. In the DEB package, completions for Bash, Fish, and Zsh are automatically installed into the correct directories for that shells. For other systems or shells, you can find the pre-built completions in build artifacts or release attachments, or build them along with the project (they will be in `target/{PROFILE}/completions`).

You can also check the built-in program help.

## Contributing

Please make sure that your Rust code is properly linted and formatted using [clippy](https://github.com/rust-lang/rust-clippy) and [rustfmt](https://github.com/rust-lang/rustfmt) (nightly version).

There is currently no formatter for UserChrome JS and CSS, but may be added in the future. Please try to keep your code clean...
