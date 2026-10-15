# Colab Availability

A GNOME Shell extension that checks whether Google Colab responds and shows the result in the top bar.

[![GNOME Shell 50](https://img.shields.io/badge/GNOME%20Shell-50-4a86cf)](https://github.com/salirezak/colab-availability)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

## Features

- Checks [Google Colab](https://colab.research.google.com/) and displays the result in the panel.
- Runs a check when the extension starts, then repeats it at the configured interval.
- Left-click the indicator to run a check immediately.
- Middle-click the indicator to open Google Colab in the default browser.
- Right-click the indicator to open its preferences.
- Choose icon only, status text only, or both; adjust icon and text sizes.
- Place the indicator in the left, center, or right panel section and set its order.
- Configure the check interval and request timeout.

The status is based on the HTTP response: `Available` means the endpoint returned HTTP 200. Other HTTP responses appear as their status code. Network failures can show `No internet`, `Timeout`, or `Error`.

## Requirements

- GNOME Shell 50
- A network connection to Google Colab

## Installation

The extension is not yet listed on [GNOME Extensions](https://extensions.gnome.org/). To install from this source repository:

```sh
git clone https://github.com/salirezak/colab-availability.git
cd colab-availability
mkdir -p ~/.local/share/gnome-shell/extensions/colab-availability@salirezak.github.io
cp -r icons schemas *.js stylesheet.css metadata.json ~/.local/share/gnome-shell/extensions/colab-availability@salirezak.github.io/
glib-compile-schemas ~/.local/share/gnome-shell/extensions/colab-availability@salirezak.github.io/schemas
gnome-extensions enable colab-availability@salirezak.github.io
```

On Wayland, log out and back in if the extension does not appear after installation. You can also enable it with the **Extensions** app.

### Testing during development

To test the extension in a separate GNOME Shell Wayland session, install `mutter-devkit` if it is not already installed. Then run:

```sh
dbus-run-session gnome-shell --devkit --wayland
```
This starts a separate GNOME Shell devkit session for testing. The extension must already be installed in the standard GNOME Shell extensions directory. You may need to enable the extension separately.

[More information about testing GNOME Shell extensions](https://gjs.guide/extensions/development/creating.html#testing-the-extension).

## Configuration

Open the extension's preferences from the **Extensions** app or run:

```sh
gnome-extensions prefs colab-availability@salirezak.github.io
```

Preferences let you adjust the display mode, icon and font sizes, panel section and order, check interval (1–3600 seconds), and request timeout (1–120 seconds). **Restore defaults** resets all preferences.

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/salirezak/colab-availability). Please include your GNOME Shell version and relevant logs when reporting a problem.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
