#!/bin/bash
dbus-run-session -- sh -c 'gnome-shell --devkit --wayland & sleep 3 && gnome-extensions enable colab-availability@salirezak.github.io && wait'