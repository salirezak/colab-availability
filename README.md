# Colab Availability

A GNOME Shell extension that checks whether Google Colab responds and shows its status in the top bar.

[![GNOME Shell 50](https://img.shields.io/badge/GNOME%20Shell-50-4a86cf)](https://github.com/salirezak/colab-availability)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)

## Features

- Checks `https://colab.research.google.com/` when enabled and periodically afterward.
- Shows the result with a success, failure, or pending icon.
- Opens a menu with the current status, any additional response details, and controls to check again, open Colab, or open preferences.
- Detects network availability changes and checks again when the connection returns.
- Lets you set the automatic check interval (1–3600 seconds).

An HTTP 200 response is shown as **Available**; HTTP 403 is shown as **Unavailable**. Other HTTP responses display their status code. Request failures can show **No internet**, **Timeout**, or **Error**.

## Requirements

- GNOME Shell 50
- A network connection to Google Colab

## Installation

To install from this source repository:

```sh
git clone https://github.com/salirezak/colab-availability.git
cd colab-availability
mkdir -p ~/.local/share/gnome-shell/extensions/colab-availability@salirezak.github.io
cp -r metadata.json extension.js prefs.js lib icons schemas ~/.local/share/gnome-shell/extensions/colab-availability@salirezak.github.io/
glib-compile-schemas ~/.local/share/gnome-shell/extensions/colab-availability@salirezak.github.io/schemas
gnome-extensions enable colab-availability@salirezak.github.io
```

On Wayland, log out and back in if the extension does not appear after installation. You can also enable it with the **Extensions** app.

## Configuration

Open preferences from the indicator menu or the **Extensions** app, or run:

```sh
gnome-extensions prefs colab-availability@salirezak.github.io
```

The preferences provide a **Check interval** setting (1–3600 seconds) and a **Reset** button to restore its default value.

## Development

To run a separate GNOME Shell Wayland devkit session, install `mutter-devkit` if needed, then run:

```sh
./run.sh
```

The script starts the session and enables the extension. The extension must already be installed in the standard GNOME Shell extensions directory. The schema can be compiled in the repository with:

```sh
./schema.sh
```

To create an installable archive, run:

```sh
./zipper.py
```

The script creates `<project-directory>.shell-extension.zip` in the repository. It runs `shexli` to validate the archive when that command is installed.

[More information about testing GNOME Shell extensions](https://gjs.guide/extensions/development/creating.html#testing-the-extension).

## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/salirezak/colab-availability). Please include your GNOME Shell version and relevant logs when reporting a problem.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
