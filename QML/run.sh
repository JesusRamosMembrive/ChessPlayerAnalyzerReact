#!/bin/bash

if command -v qml &> /dev/null; then
    echo "Running QML application with qml..."
    qml main.qml
elif command -v qmlscene &> /dev/null; then
    echo "Running QML application with qmlscene..."
    qmlscene main.qml
else
    echo "Error: No QML runtime found. Please install Qt with QML support."
    echo "On Ubuntu: sudo apt-get install qml-module-qtquick2 qml-module-qtquick-controls2"
    exit 1
fi
