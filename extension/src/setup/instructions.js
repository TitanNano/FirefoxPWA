import 'iframe-resizer/js/iframeResizer.contentWindow'

import { Tab } from 'bootstrap'

async function prepareInstallInstructions () {
  const version = browser.runtime.getManifest().version
  const { os, arch } = await browser.runtime.getPlatformInfo()

  // Set CRT download URL based on system arch and extension version
  let crtArch
  if (arch === 'x86-64') crtArch = 'x64'
  else if (arch === 'x86-32') crtArch = 'x86'
  else if (arch === 'arm') crtArch = 'arm64'
  document.getElementById('connector-download-url-crt').setAttribute('href', `https://aka.ms/vs/16/release/vc_redist.${crtArch}.exe`)

  // Set MSI download URL based on system arch and extension version
  // Currently just relying on x86 emulation for Windows ARM
  const msiArch = arch === 'x86-64' ? 'x86_64' : 'x86'
  document.getElementById('connector-download-url-msi').setAttribute('href', `https://github.com/filips123/FirefoxPWA/releases/download/v${version}/firefoxpwa-${version}-${msiArch}.msi`)

  // Set DEB download URL based on system arch and extension version
  // For ARM it doesn't matter which version we set because DEB tab will be hidden later
  const debArch = arch === 'x86-64' ? 'amd64' : 'i386'
  document.getElementById('connector-download-url-deb').setAttribute('href', `https://github.com/filips123/FirefoxPWA/releases/download/v${version}/firefoxpwa_${version}_${debArch}.deb`)

  // TODO: Set RPM download URL based on system arch and extension version
  // For ARM it doesn't matter which version we set because RPM tab will be hidden later

  // Set repository info based on system arch and extension version
  document.getElementById('connector-repository-tag').innerText = `v${version}`
  document.getElementById('connector-cargo-version').innerText = version
  document.getElementById('connector-userchrome-version').innerText = version

  // Hide DEB and RPM tabs on ARM
  // And rename "Other Linux" to just "Linux"
  if (arch === 'arm') {
    document.getElementById('linux-deb-install-tab').classList.add('d-none')
    document.getElementById('linux-rpm-install-tab').classList.add('d-none')
    document.getElementById('linux-source-install-tab').innerText = 'Linux'
    document.getElementById('linux-source-install-name').innerText = 'Linux'
  }

  // Set the default tab to the current OS
  let defaultTab

  if (os === 'win') {
    defaultTab = 'windows'
  } else if (os === 'linux') {
    defaultTab = arch === 'arm' ? 'linux-source' : 'linux-deb'
  } else if (os === 'mac') {
    defaultTab = 'macos'
  } else {
    defaultTab = 'other'
  }

  new Tab(document.getElementById(`${defaultTab}-install-tab`)).show()
}

prepareInstallInstructions()
